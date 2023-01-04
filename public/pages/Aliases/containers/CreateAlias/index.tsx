import React, { useContext, useEffect, useRef } from "react";
import { EuiButton, EuiCallOut, EuiModal, EuiModalHeader, EuiModalBody, EuiModalFooter, EuiSpacer } from "@elastic/eui";
import FormGenerator, { IFormGeneratorRef } from "../../../../components/FormGenerator";
import RemoteSelect from "../../../../components/RemoteSelect";
import { ServicesContext } from "../../../../services";
import { BrowserServices } from "../../../../models/interfaces";
import { CoreServicesContext } from "../../../../components/core_services";
import { IAlias } from "../../interface";
import { getAliasActionsByDiffArray } from "../../../CreateIndex/containers/IndexForm";
import { filterByMinimatch } from "../../../../../utils/helper";
import { SYSTEM_ALIAS, SYSTEM_INDEX } from "../../../../../utils/constants";
import { DataStream } from "../../../../../server/models/interfaces";

export interface ICreateAliasProps {
  visible: boolean;
  onSuccess: () => void;
  onClose: () => void;
  alias?: IAlias;
}

export function IndexSelect({ value, onChange }: { value?: string[]; onChange: (val: string[]) => void }) {
  const services = useContext(ServicesContext) as BrowserServices;
  return (
    <RemoteSelect
      placeholder="Select indices"
      onSearchChange={undefined}
      value={value}
      onChange={onChange}
      customOptionText="Add {searchValue} as index pattern"
      refreshOptions={async ({ searchValue }) => {
        const payload: { index?: string; format: string } = {
          format: "json",
        };
        if (searchValue) {
          payload.index = `${searchValue}*`;
        }
        const [aliasResult, dataStreamList] = await Promise.all([
          services.commonService
            .apiCaller<{ index: string }[]>({
              endpoint: "cat.indices",
              data: payload,
            })
            .then((res) => {
              if (res.ok) {
                return {
                  ...res,
                  response: res.response
                    .map((item) => ({ label: item.index }))
                    .filter((item) => !filterByMinimatch(item.label, SYSTEM_INDEX)),
                };
              } else {
                return res;
              }
            }),
          services.commonService
            .apiCaller<{ data_streams?: DataStream[] }>({
              endpoint: "transport.request",
              data: {
                path: "/_data_stream",
                method: "GET",
              },
            })
            .then((res): string[] => {
              if (res.ok) {
                return (
                  res.response.data_streams?.reduce(
                    (total, current) => [...total, current.name, ...current.indices.map((item) => item.index_name)],
                    [] as string[]
                  ) || []
                );
              }

              return [];
            }),
        ]);

        if (aliasResult.ok) {
          return {
            ...aliasResult,
            response: aliasResult.response.filter((item) => !dataStreamList.includes(item.label)),
          };
        }

        return aliasResult;
      }}
    />
  );
}

export default function CreateAlias(props: ICreateAliasProps) {
  const formGenerateRef = useRef<IFormGeneratorRef>(null);
  const services = useContext(ServicesContext) as BrowserServices;
  const coreServices = useContext(CoreServicesContext);
  const isEdit = !!props.alias;

  useEffect(() => {
    if (props.visible) {
      formGenerateRef.current?.setValues(props.alias);
    }
  }, [props.visible]);

  if (!props.visible) {
    return null;
  }

  return (
    <EuiModal onClose={() => {}}>
      <EuiModalHeader>{isEdit ? "Update" : "Create"} alias</EuiModalHeader>
      <EuiModalBody>
        {isEdit && filterByMinimatch(props.alias?.alias || "", SYSTEM_ALIAS) ? (
          <>
            <EuiCallOut color="warning">You are editing a system-like alias, please be careful before you do any change to it.</EuiCallOut>
            <EuiSpacer />
          </>
        ) : null}
        <FormGenerator
          ref={formGenerateRef}
          value={{ ...props.alias }}
          formFields={[
            {
              name: "alias",
              type: "Input",
              rowProps: {
                label: "Alias name",
              },
              options: {
                props: {
                  placeholder: "Specify alias name",
                  disabled: isEdit,
                },
                rules: [
                  {
                    required: true,
                    message: "Alias name is required",
                  },
                ],
              },
            },
            {
              name: "indexArray",
              component: IndexSelect,
              rowProps: {
                label: "Specify indexes",
                helpText: "Specify one or more indexes or index patterns to be part of the alias.",
              },
              options: {
                props: {
                  placeholder: "Select one or more indexes",
                },
                rules: [
                  {
                    validator: (rule, value?: string[]) => {
                      if (!value || !value.length) {
                        return Promise.reject("At least one index should be selected.");
                      }

                      return Promise.resolve();
                    },
                  },
                ],
              },
            },
          ]}
        />
        <EuiSpacer />
      </EuiModalBody>
      <EuiModalFooter>
        <div>
          <EuiButton data-test-subj="cancelCreateAliasButton" style={{ marginRight: 20 }} onClick={props.onClose}>
            Cancel
          </EuiButton>
          <EuiButton
            fill
            color="primary"
            data-test-subj="createAliasButton"
            onClick={async () => {
              const { errors, values } = (await formGenerateRef.current?.validatePromise()) || {};
              if (errors) {
                return;
              }

              let result: { ok: boolean; error?: string };

              if (isEdit) {
                const actions = getAliasActionsByDiffArray(props.alias?.indexArray || [], values.indexArray || [], (index) => ({
                  alias: values.alias,
                  index,
                }));
                result = await services?.commonService.apiCaller({
                  endpoint: "indices.updateAliases",
                  data: {
                    body: {
                      actions,
                    },
                  },
                });
              } else {
                result = await services?.commonService.apiCaller({
                  endpoint: "indices.putAlias",
                  data: {
                    index: values.indexArray,
                    name: values.alias,
                  },
                });
              }

              if (result?.ok) {
                coreServices?.notifications.toasts.addSuccess(`${values.alias} has been successfully ${isEdit ? "updated" : "created"}`);
                props.onSuccess();
              } else {
                coreServices?.notifications.toasts.addDanger(result?.error || "");
              }
            }}
          >
            {isEdit ? "Save changes" : "Create alias"}
          </EuiButton>
        </div>
      </EuiModalFooter>
    </EuiModal>
  );
}
