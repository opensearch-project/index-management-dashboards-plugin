/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { forwardRef, useCallback, useContext, useEffect, useImperativeHandle, useRef, Ref, useState } from "react";
import {
  EuiButton,
  EuiButtonEmpty,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiFormRowProps,
  EuiLink,
  EuiSpacer,
  EuiTitle,
} from "@elastic/eui";
import flat from "flat";
import { ContentPanel } from "../../../../components/ContentPanel";
import AliasSelect from "../../../CreateIndex/components/AliasSelect";
import IndexMapping, { IIndexMappingsRef, transformArrayToObject } from "../../../CreateIndex/components/IndexMapping";
import { TemplateItem, TemplateItemRemote } from "../../../../../models/interfaces";
import useField, { FieldInstance, transformNameToString } from "../../../../lib/field";
import CustomFormRow from "../../../../components/CustomFormRow";
import { AllBuiltInComponents } from "../../../../components/FormGenerator";
import RemoteSelect from "../../../../components/RemoteSelect";
import { ServicesContext } from "../../../../services";
import { BrowserServices } from "../../../../models/interfaces";
import AdvancedSettings from "../../../../components/AdvancedSettings";
import { CoreServicesContext } from "../../../../components/core_services";
import { CoreStart } from "opensearch-dashboards/public";
import { submitTemplate, getTemplate } from "./hooks";
import DescriptionListHoz from "../../../../components/DescriptionListHoz";
import { Modal } from "../../../../components/Modal";
import JSONEditor from "../../../../components/JSONEditor";
import { RouteComponentProps } from "react-router-dom";
import { ROUTES } from "../../../../utils/constants";
import DeleteTemplateModal from "../../../Templates/containers/DeleteTemplatesModal";

export interface TemplateDetailProps {
  templateName?: string;
  onCancel?: () => void;
  onSubmitSuccess?: (templateName: string) => void;
  readonly?: boolean;
  history: RouteComponentProps["history"];
}

const TemplateDetail = ({ templateName, onCancel, onSubmitSuccess, readonly, history }: TemplateDetailProps, ref: Ref<FieldInstance>) => {
  const isEdit = !!templateName;
  const services = useContext(ServicesContext) as BrowserServices;
  const coreServices = useContext(CoreServicesContext) as CoreStart;
  const [visible, setVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const oldValue = useRef<TemplateItem | undefined>(undefined);
  const field = useField({
    values: {
      priority: 0,
      template: {
        settings: {
          "index.number_of_replicas": 1,
          "index.number_of_shards": 1,
          "index.refresh_interval": "1s",
        },
      },
    } as Partial<TemplateItem>,
  });
  const getCommonFormRowProps = useCallback(
    (name: string | string[]): Partial<EuiFormRowProps> => {
      return {
        isInvalid: !!field.getError(name),
        error: field.getError(name),
        "data-test-subj": `form-row-${transformNameToString(name)}`,
      };
    },
    [field]
  );
  const destroyRef = useRef<boolean>(false);
  const mappingsRef = useRef<IIndexMappingsRef>(null);
  const onSubmit = async () => {
    const { errors, values: templateDetail } = (await field.validatePromise()) || {};
    if (errors) {
      return;
    }
    setIsSubmitting(true);
    const result = await submitTemplate({
      value: templateDetail,
      commonService: services.commonService,
      isEdit,
    });
    if (result && result.ok) {
      coreServices.notifications.toasts.addSuccess(`${templateDetail.name} has been successfully ${isEdit ? "updated" : "created"}.`);
      onSubmitSuccess && onSubmitSuccess(templateDetail.name);
    } else {
      coreServices.notifications.toasts.addDanger(result.error);
    }
    if (destroyRef.current) {
      return;
    }
    setIsSubmitting(false);
  };
  useImperativeHandle(ref, () => field);
  useEffect(() => {
    if (isEdit) {
      getTemplate({
        templateName,
        coreService: coreServices,
        commonService: services.commonService,
      })
        .then((template) => {
          oldValue.current = template;
          field.resetValues(template);
        })
        .catch((e) => {
          // do nothing
        });
    }
    return () => {
      destroyRef.current = true;
    };
  }, []);
  const values: TemplateItem = field.getValues();
  const Component = isEdit ? AllBuiltInComponents.Text : AllBuiltInComponents.Input;
  return (
    <>
      <EuiFlexGroup alignItems="center">
        <EuiFlexItem>
          <EuiTitle size="l">
            {readonly ? <h1 title={values.name}>{values.name}</h1> : <h1>{isEdit ? "Edit" : "Create"} template</h1>}
          </EuiTitle>
          {readonly ? null : (
            <CustomFormRow
              fullWidth
              label=""
              helpText={
                <div>
                  Index templates let you initialize new indexes with predefined mappings and settings.
                  <EuiLink external target="_blank" href={coreServices.docLinks.links.opensearch.indexTemplates.base}>
                    Learn more.
                  </EuiLink>
                </div>
              }
            >
              <></>
            </CustomFormRow>
          )}
        </EuiFlexItem>
        {readonly ? (
          <EuiFlexItem grow={false} style={{ flexDirection: "row" }}>
            <EuiButton
              fill
              style={{ marginRight: 20 }}
              onClick={() => {
                const showValue: TemplateItemRemote = {
                  ...values,
                  template: {
                    ...values.template,
                    mappings: {
                      ...values.template.mappings,
                      properties: transformArrayToObject(values.template.mappings?.properties || []),
                    },
                  },
                };
                Modal.show({
                  "data-test-subj": "templateJSONDetailModal",
                  title: values.name,
                  content: <JSONEditor value={JSON.stringify(showValue, null, 2)} disabled />,
                });
              }}
            >
              View JSON
            </EuiButton>
            <EuiButton fill style={{ marginRight: 20 }} onClick={() => history.push(`${ROUTES.CREATE_TEMPLATE}/${values.name}`)}>
              Edit
            </EuiButton>
            <EuiButton style={{ marginRight: 20 }} onClick={() => setVisible(true)}>
              Delete
            </EuiButton>
            <DeleteTemplateModal
              visible={visible}
              selectedItems={[values.name]}
              onClose={() => {
                setVisible(false);
              }}
              onDelete={() => {
                setVisible(false);
                history.replace(ROUTES.TEMPLATES);
              }}
            />
          </EuiFlexItem>
        ) : null}
      </EuiFlexGroup>
      <EuiSpacer />
      {readonly ? (
        <ContentPanel title="Template details" titleSize="s">
          <EuiSpacer size="s" />
          <DescriptionListHoz
            listItems={[
              {
                title: "Template name",
                description: values.name,
              },
              {
                title: "Index patterns",
                description: values.index_patterns?.join(","),
              },
              {
                title: "Priority",
                description: values.priority,
              },
            ]}
          />
        </ContentPanel>
      ) : (
        <ContentPanel title="Define template" titleSize="s">
          <EuiSpacer size="s" />
          <CustomFormRow
            {...getCommonFormRowProps("name")}
            label="Template name"
            helpText="Template name cannot be changed after the index is created."
          >
            <Component
              {...field.registerField({
                name: "name",
                rules: [
                  {
                    required: true,
                    message: "Template name is required",
                  },
                ],
              })}
            />
          </CustomFormRow>
          <EuiSpacer />
          <CustomFormRow
            {...getCommonFormRowProps("index_patterns")}
            label="Index patterns"
            helpText="Specify the index patterns or wildcards. Add a comma to separate each value. 
            Settings in this template will be applied to indexes with names matching index patterns or wildcards."
          >
            <RemoteSelect
              {...field.registerField({
                name: "index_patterns",
                rules: [
                  {
                    validator(rule, value) {
                      if (!value || !value.length) {
                        return Promise.reject("Index patterns must be defined");
                      }

                      return Promise.reject("");
                    },
                  },
                ],
              })}
              delimiter=","
              noSuggestions
              async={false}
              refreshOptions={() =>
                Promise.resolve({
                  ok: true,
                  response: [],
                })
              }
              placeholder="Select index patterns or input wildcards"
            />
          </CustomFormRow>
          <EuiSpacer />
          <CustomFormRow
            {...getCommonFormRowProps("priority")}
            label="Priority"
            helpText="Specify the priority of this template. If the index name matches more than one template, the template with the highest priority will be applied to the index"
          >
            <AllBuiltInComponents.Number
              {...field.registerField({
                name: "priority",
                rules: [
                  {
                    required: true,
                    message: "Priority is required",
                  },
                  {
                    min: 0,
                    message: "Priority should not be smaller than zero",
                  },
                ],
              })}
            />
          </CustomFormRow>
        </ContentPanel>
      )}
      <EuiSpacer />
      <ContentPanel
        title={
          <>
            <CustomFormRow
              fullWidth
              label={
                <EuiTitle size="s">
                  <div>Index alias</div>
                </EuiTitle>
              }
              helpText="Allow the new indexes to be referenced by existing aliases or specify a new alias."
            >
              <></>
            </CustomFormRow>
          </>
        }
        titleSize="s"
      >
        {readonly ? (
          <>
            <EuiSpacer size="s" />
            <DescriptionListHoz
              listItems={[
                {
                  title: "Alias names",
                  description: Object.keys(values?.template?.aliases || {}).join(",") || "-",
                },
              ]}
            />
          </>
        ) : (
          <>
            <EuiSpacer size="s" />
            <CustomFormRow
              fullWidth
              {...getCommonFormRowProps(["template", "aliases"])}
              label="Index alias"
              helpText="Select existing aliases or specify a new alias."
            >
              <AliasSelect
                {...field.registerField({
                  name: ["template", "aliases"],
                })}
                refreshOptions={(aliasName) =>
                  services?.commonService.apiCaller({
                    endpoint: "cat.aliases",
                    method: "GET",
                    data: {
                      format: "json",
                      name: aliasName,
                      expand_wildcards: "all",
                    },
                  })
                }
              />
            </CustomFormRow>
          </>
        )}
      </ContentPanel>
      <EuiSpacer />
      <ContentPanel title="Index settings" titleSize="s">
        <EuiSpacer size="s" />
        {readonly ? (
          <DescriptionListHoz
            listItems={[
              {
                title: "Number of primary shards",
                description: values.template?.settings?.["index.number_of_shards"] || "-",
              },
              {
                title: "Number of replicas",
                description: values.template?.settings?.["index.number_of_replicas"] || "-",
              },
              {
                title: "Refresh interval",
                description: values.template?.settings?.["index.refresh_interval"] || "-",
              },
            ]}
          />
        ) : (
          <>
            <CustomFormRow
              label="Number of primary shards"
              helpText="Specify the number of primary shards in the index. Default is 1."
              {...getCommonFormRowProps(["template", "settings", "index.number_of_shards"])}
            >
              <AllBuiltInComponents.Number
                {...field.registerField({
                  name: ["template", "settings", "index.number_of_shards"],
                  rules: [
                    {
                      validator(rule, value) {
                        if (value === "") {
                          return Promise.resolve("");
                        }
                        if (Number(value) !== parseInt(value)) {
                          return Promise.reject("Number of primary shards must be an integer");
                        }

                        return Promise.resolve("");
                      },
                    },
                  ],
                })}
              />
            </CustomFormRow>
            <EuiSpacer />
            <CustomFormRow
              fullWidth
              label="Number of replicas"
              helpText="Specify the number of replicas each primary shard should have. Default is 1."
              {...getCommonFormRowProps(["template", "settings", "index.number_of_replicas"])}
            >
              <AllBuiltInComponents.Number
                {...field.registerField({
                  name: ["template", "settings", "index.number_of_replicas"],
                  rules: [
                    {
                      validator(rule, value) {
                        if (value === "") {
                          return Promise.resolve("");
                        }
                        if (Number(value) !== parseInt(value)) {
                          return Promise.reject("Number of replicas must be an integer");
                        }

                        return Promise.resolve("");
                      },
                    },
                  ],
                })}
              />
            </CustomFormRow>
            <EuiSpacer />
            <CustomFormRow
              label="Refresh interval"
              helpText="Specify how often the index should refresh, which publishes its most recent changes and makes them available for search. Default is 1s."
              {...getCommonFormRowProps(["template", "settings", "index.refresh_interval"])}
            >
              <AllBuiltInComponents.Input
                {...field.registerField({
                  name: ["template", "settings", "index.refresh_interval"],
                })}
              />
            </CustomFormRow>
          </>
        )}
        <AdvancedSettings
          value={field.getValues().template.settings || {}}
          onChange={(totalValue) => field.setValue(["template", "settings"], totalValue)}
          accordionProps={{
            initialIsOpen: false,
            id: "accordionForCreateIndexTemplateSettings",
            buttonContent: <h4>Advanced settings</h4>,
          }}
          editorProps={{
            disabled: readonly,
            width: "100%",
            formatValue: flat,
          }}
          rowProps={{
            fullWidth: true,
            label: "Specify advanced index settings",
            helpText: (
              <>
                <p>
                  Specify a comma-delimited list of settings.
                  <EuiLink
                    href="https://opensearch.org/docs/latest/api-reference/index-apis/create-index#index-settings"
                    target="_blank"
                    external
                  >
                    View index settings
                  </EuiLink>
                </p>
                <p>
                  All the settings will be handled in flat structure.
                  <EuiLink
                    href="https://opensearch.org/docs/latest/api-reference/index-apis/get-index/#url-parameters"
                    external
                    target="_blank"
                  >
                    Learn more.
                  </EuiLink>
                </p>
              </>
            ),
          }}
        />
      </ContentPanel>
      <EuiSpacer />
      <ContentPanel
        title={
          <>
            <EuiTitle size="s">
              <div>Index mapping</div>
            </EuiTitle>
            <EuiFormRow
              fullWidth
              helpText={
                <div>
                  Define how documents and their fields are stored and indexed.
                  <EuiLink
                    target="_blank"
                    external
                    href={`https://opensearch.org/docs/${coreServices.docLinks.DOC_LINK_VERSION}/opensearch/mappings/`}
                  >
                    Learn more.
                  </EuiLink>
                </div>
              }
            >
              <></>
            </EuiFormRow>
          </>
        }
        titleSize="s"
      >
        <EuiSpacer size="s" />
        <EuiFormRow fullWidth>
          <IndexMapping
            {...field.registerField({
              name: ["template", "mappings", "properties"],
              rules: [
                {
                  validator() {
                    return (mappingsRef.current as IIndexMappingsRef).validate()?.then((result) => {
                      if (result) {
                        return Promise.reject(result);
                      }

                      return Promise.resolve("");
                    });
                  },
                },
              ],
            })}
            readonly={readonly}
            isEdit={isEdit}
            ref={mappingsRef}
          />
        </EuiFormRow>
      </ContentPanel>
      {readonly ? null : (
        <>
          <EuiSpacer />
          <EuiSpacer />
          <EuiFlexGroup alignItems="center" justifyContent="flexEnd">
            <EuiFlexItem grow={false}>
              <EuiButtonEmpty onClick={onCancel} data-test-subj="CreateIndexTemplateCancelButton">
                Cancel
              </EuiButtonEmpty>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiButton fill onClick={onSubmit} isLoading={isSubmitting} data-test-subj="CreateIndexTemplateCreateButton">
                {isEdit ? "Save changes" : "Create template"}
              </EuiButton>
            </EuiFlexItem>
          </EuiFlexGroup>
        </>
      )}
    </>
  );
};

// @ts-ignore
export default forwardRef(TemplateDetail);
