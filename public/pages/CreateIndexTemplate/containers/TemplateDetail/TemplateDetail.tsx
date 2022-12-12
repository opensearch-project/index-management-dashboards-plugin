/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { forwardRef, useCallback, useContext, useEffect, useImperativeHandle, useRef, Ref, useState } from "react";
import { EuiButton, EuiButtonEmpty, EuiFlexGroup, EuiFlexItem, EuiFormRow, EuiFormRowProps, EuiLink, EuiSpacer } from "@elastic/eui";
import { ContentPanel } from "../../../../components/ContentPanel";
import AliasSelect from "../../../CreateIndex/components/AliasSelect";
import IndexMapping, { IIndexMappingsRef } from "../../../CreateIndex/components/IndexMapping";
import { TemplateItem } from "../../../../../models/interfaces";
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

export interface TemplateDetailProps {
  templateName?: string;
  onCancel?: () => void;
  onSubmitSuccess?: (templateName: string) => void;
}

const TemplateDetail = ({ templateName, onCancel, onSubmitSuccess }: TemplateDetailProps, ref: Ref<FieldInstance>) => {
  const isEdit = !!templateName;
  const services = useContext(ServicesContext) as BrowserServices;
  const coreServices = useContext(CoreServicesContext) as CoreStart;
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
      coreServices.notifications.toasts.addSuccess(`[${templateDetail.name}] has been successfully ${isEdit ? "updated" : "created"}.`);
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
  const Component = isEdit ? AllBuiltInComponents.Text : AllBuiltInComponents.Input;
  return (
    <>
      <ContentPanel title="Define template" titleSize="s">
        <CustomFormRow {...getCommonFormRowProps("name")} label="Template name">
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
          label="Index patterns or wildcards"
          helpText="Specify the index patterns or index wildcard. Settings in this template
            will be applied to indexes with names matching index patterns or wildcards."
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
        <CustomFormRow {...getCommonFormRowProps("priority")} label="Priority">
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
      <EuiSpacer />
      <ContentPanel title="Index alias" titleSize="s">
        <CustomFormRow {...getCommonFormRowProps(["template", "aliases"])} label="Index alias">
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
                  expand_wildcards: "open",
                },
              })
            }
          />
        </CustomFormRow>
      </ContentPanel>
      <EuiSpacer />
      <ContentPanel title="Index settings" titleSize="s">
        <CustomFormRow
          label="Number of shards"
          helpText="The number of primary shards in the index. Default is 1."
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
                      return Promise.reject("Number of shards must be an integer");
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
          label="Number of replicas"
          helpText="The number of replica shards each primary shard should have."
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
          label="Refresh interval of index"
          helpText="How often the index should refresh, which publishes its most recent changes and makes them available for searching."
          {...getCommonFormRowProps(["template", "settings", "index.refresh_interval"])}
        >
          <AllBuiltInComponents.Input
            {...field.registerField({
              name: ["template", "settings", "index.refresh_interval"],
            })}
          />
        </CustomFormRow>
        <EuiSpacer />
        <AdvancedSettings
          value={field.getValues().template.settings || {}}
          onChange={(totalValue) => field.setValue(["template", "settings"], totalValue)}
          accordionProps={{
            initialIsOpen: false,
            id: "accordion_for_create_index_template_settings",
            buttonContent: <h4>Advanced settings</h4>,
          }}
          rowProps={{
            label: "Specify advanced index settings",
            style: {
              maxWidth: "800px",
            },
            helpText: (
              <>
                Specify a comma-delimited list of settings.
                <EuiLink
                  href="https://opensearch.org/docs/latest/api-reference/index-apis/create-index#index-settings"
                  target="_blank"
                  external
                >
                  View index settings
                </EuiLink>
              </>
            ),
          }}
        />
      </ContentPanel>
      <EuiSpacer />
      <ContentPanel title="Index mapping" titleSize="s">
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
            isEdit={isEdit}
            originalValue={oldValue.current?.template?.mappings?.properties}
            ref={mappingsRef}
          />
        </EuiFormRow>
      </ContentPanel>
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
            {isEdit ? "Update" : "Create"}
          </EuiButton>
        </EuiFlexItem>
      </EuiFlexGroup>
    </>
  );
};

// @ts-ignore
export default forwardRef(TemplateDetail);
