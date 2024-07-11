/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useContext, useEffect, useRef } from "react";
import {
  EuiSmallButton,
  EuiCallOut,
  EuiModal,
  EuiModalHeader,
  EuiModalBody,
  EuiModalFooter,
  EuiSpacer,
  EuiModalHeaderTitle,
} from "@elastic/eui";
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
import { INDEX_NAMING_MESSAGE, INDEX_NAMING_PATTERN } from "../../../../utils/constants";

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
      placeholder="Select indexes"
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
    <EuiModal onClose={props.onClose}>
      <EuiModalHeader>
        <EuiModalHeaderTitle>
          <h1>{isEdit ? "Update" : "Create"} alias</h1>
        </EuiModalHeaderTitle>
      </EuiModalHeader>
      <EuiModalBody>
        {isEdit && filterByMinimatch(props.alias?.alias || "", SYSTEM_ALIAS) ? (
          <>
            <EuiCallOut color="warning">
              This alias may contain critical system data. Changing system aliases may break OpenSearch.
            </EuiCallOut>
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
                position: "bottom",
                helpText: INDEX_NAMING_MESSAGE,
              },
              options: {
                props: {
                  placeholder: "Specify alias name",
                  disabled: isEdit,
                },
                rules: [
                  {
                    pattern: INDEX_NAMING_PATTERN,
                    message: "Invalid alias name.",
                  },
                ],
              },
            },
            {
              name: "indexArray",
              component: IndexSelect,
              rowProps: {
                label: "Indexes or index patterns",
                helpText: "Specify one or more indexes or index patterns to be part of the alias.",
              },
              options: {
                props: {
                  placeholder: "Select indexes or input index patterns.",
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
          <EuiSmallButton data-test-subj="cancelCreateAliasButton" style={{ marginRight: 20 }} onClick={props.onClose}>
            Cancel
          </EuiSmallButton>
          <EuiSmallButton
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
                if (actions.length === 0) {
                  result = {
                    ok: true,
                  };
                } else {
                  result = await services?.commonService.apiCaller({
                    endpoint: "indices.updateAliases",
                    data: {
                      body: {
                        actions,
                      },
                    },
                  });
                }
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
          </EuiSmallButton>
        </div>
      </EuiModalFooter>
    </EuiModal>
  );
}
