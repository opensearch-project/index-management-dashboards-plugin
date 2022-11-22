import React, { useContext, useRef } from "react";
import { EuiButton, EuiFlyout, EuiFlyoutBody, EuiFlyoutFooter, EuiFlyoutHeader } from "@elastic/eui";
import FormGenerator, { IFormGeneratorRef } from "../../../../components/FormGenerator";
import RemoteSelect from "../../../../components/RemoteSelect";
import { ServicesContext } from "../../../../services";
import { BrowserServices } from "../../../../models/interfaces";
import { CoreServicesContext } from "../../../../components/core_services";

export interface ICreateAliasProps {
  visible: boolean;
  onSuccess: () => void;
  onClose: () => void;
}

export function IndexSelect({ value, onChange }: { value?: string[]; onChange: (val: string[]) => void }) {
  const services = useContext(ServicesContext) as BrowserServices;
  return (
    <RemoteSelect
      placeholder="Select indices"
      onCreateOption={undefined}
      value={value}
      onChange={onChange}
      refreshOptions={({ searchValue }) => {
        const payload: { index?: string; format: string } = {
          format: "json",
        };
        if (searchValue) {
          payload.index = `${searchValue}*`;
        }
        return services.commonService
          .apiCaller<{ index: string }[]>({
            endpoint: "cat.indices",
            data: payload,
          })
          .then((res) => {
            if (res.ok) {
              return {
                ...res,
                response: res.response.map((item) => ({ label: item.index })),
              };
            } else {
              return res;
            }
          });
      }}
    />
  );
}

export default function CreateAlias(props: ICreateAliasProps) {
  const formGenerateRef = useRef<IFormGeneratorRef>(null);
  const services = useContext(ServicesContext);
  const coreServices = useContext(CoreServicesContext);
  if (!props.visible) {
    return null;
  }

  return (
    <EuiFlyout hideCloseButton onClose={() => {}}>
      <EuiFlyoutHeader>Create alias</EuiFlyoutHeader>
      <EuiFlyoutBody>
        <FormGenerator
          ref={formGenerateRef}
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
              name: "index",
              component: IndexSelect,
              rowProps: {
                label: "Specify indexes",
                helpText: "Specify one or more indexes to be a part of the alias",
              },
              options: {
                props: {
                  placeholder: "Select one or more indexes",
                },
                rules: [
                  {
                    validator: (rule, value?: string[]) => {
                      if (!value || !value.length) {
                        return Promise.reject("At least one index should be selected");
                      }

                      return Promise.resolve();
                    },
                  },
                ],
              },
            },
          ]}
        />
      </EuiFlyoutBody>
      <EuiFlyoutFooter>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <EuiButton style={{ marginRight: 20 }} onClick={props.onClose}>
            Cancel
          </EuiButton>
          <EuiButton
            fill
            color="primary"
            onClick={async () => {
              const { errors, values } = (await formGenerateRef.current?.validatePromise()) || {};
              if (errors) {
                return;
              }

              const result = await services?.commonService.apiCaller({
                endpoint: "indices.putAlias",
                data: {
                  index: values.index,
                  name: values.alias,
                },
              });
              if (result?.ok) {
                coreServices?.notifications.toasts.addSuccess(`[${values.alias}] has been successfully created`);
                props.onSuccess();
              } else {
                coreServices?.notifications.toasts.addDanger(result?.error || "");
              }
            }}
          >
            Create alias
          </EuiButton>
        </div>
      </EuiFlyoutFooter>
    </EuiFlyout>
  );
}
