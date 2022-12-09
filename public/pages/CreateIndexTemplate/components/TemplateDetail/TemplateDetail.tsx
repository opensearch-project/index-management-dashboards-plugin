/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { forwardRef, useCallback, useContext, useEffect, useImperativeHandle, useRef } from "react";
import { EuiFormRow, EuiFormRowProps, EuiLink, EuiSpacer } from "@elastic/eui";
import { set } from "lodash";
import { ContentPanel } from "../../../../components/ContentPanel";
import AliasSelect, { AliasSelectProps } from "../../../CreateIndex/components/AliasSelect";
import IndexMapping, { IIndexMappingsRef } from "../../../CreateIndex/components/IndexMapping";
import { TemplateItem } from "../../../../../models/interfaces";
import { Ref } from "react";
import useField from "../../../../lib/field";
import CustomFormRow from "../../../../components/CustomFormRow";
import { AllBuiltInComponents } from "../../../../components/FormGenerator";
import RemoteSelect from "../../../../components/RemoteSelect";
import { ServicesContext } from "../../../../services";
import { BrowserServices } from "../../../../models/interfaces";
import AdvancedSettings from "../../../../components/AdvancedSettings";

export interface TemplateDetailProps {
  value?: Partial<TemplateItem>;
  oldValue?: Partial<TemplateItem>;
  onChange: (value: TemplateDetailProps["value"]) => void;
  isEdit?: boolean;
  readonly?: boolean;
  refreshOptions: AliasSelectProps["refreshOptions"];
}

export interface ITemplateDetailRef {
  validate: () => Promise<boolean>;
}

const TemplateDetail = (
  { value, onChange, isEdit, readonly, oldValue, refreshOptions }: TemplateDetailProps,
  ref: Ref<ITemplateDetailRef>
) => {
  const services = useContext(ServicesContext) as BrowserServices;
  const field = useField();
  const getCommonFormRowProps = useCallback(
    (name: string | string[]): Partial<EuiFormRowProps> => {
      return {
        isInvalid: !!field.getError(name),
        error: field.getError(name),
      };
    },
    [field]
  );
  const onValueChange = useCallback(
    (name: string | string[], val) => {
      let finalValue = value || {};
      set(finalValue, name, val);
      onChange({ ...finalValue });
    },
    [onChange, value]
  );
  const destroyRef = useRef<boolean>(false);
  const finalValue = value || {};
  const mappingsRef = useRef<IIndexMappingsRef>(null);
  useImperativeHandle(ref, () => ({
    validate: async () => {
      const { errors } = await field.validatePromise();
      if (errors) {
        return false;
      }
      const mappingsValidateResult = await mappingsRef.current?.validate();
      if (mappingsValidateResult) {
        return false;
      }

      return true;
    },
  }));
  useEffect(() => {
    return () => {
      destroyRef.current = true;
    };
  }, []);
  console.log(field.getValues());
  return (
    <>
      <ContentPanel title="Define template" titleSize="s">
        <div style={{ paddingLeft: "10px" }}>
          <CustomFormRow {...getCommonFormRowProps("name")} label="Template name">
            <AllBuiltInComponents.Input
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
        </div>
      </ContentPanel>
      <EuiSpacer />
      <ContentPanel title="Index alias" titleSize="s">
        <div style={{ paddingLeft: "10px" }}>
          <CustomFormRow {...getCommonFormRowProps("aliases")} label="Index alias">
            <AliasSelect
              {...field.registerField({
                name: "aliases",
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
        </div>
      </ContentPanel>
      <EuiSpacer />
      <ContentPanel title="Index settings" titleSize="s">
        <div style={{ paddingLeft: "10px" }}>
          <CustomFormRow
            label="Number of shards"
            helpText="The number of primary shards in the index. Default is 1."
            {...getCommonFormRowProps(["settings", "index.number_of_shards"])}
          >
            <AllBuiltInComponents.Number
              {...field.registerField({
                name: ["settings", "index.number_of_shards"],
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
            {...getCommonFormRowProps(["settings", "index.number_of_replicas"])}
          >
            <AllBuiltInComponents.Number
              {...field.registerField({
                name: ["settings", "index.number_of_replicas"],
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
            {...getCommonFormRowProps(["settings", "index.refresh_interval"])}
          >
            <AllBuiltInComponents.Input
              {...field.registerField({
                name: ["settings", "index.refresh_interval"],
              })}
            />
          </CustomFormRow>
          <EuiSpacer />
          <AdvancedSettings
            value={field.getValues().settings}
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
        </div>
      </ContentPanel>
      <EuiSpacer />
      <ContentPanel title="Index mapping" titleSize="s">
        <div style={{ paddingLeft: "10px" }}>
          <EuiFormRow fullWidth>
            <IndexMapping
              isEdit={isEdit}
              value={finalValue?.mappings?.properties}
              oldValue={oldValue?.mappings?.properties}
              onChange={(val) => onValueChange("mappings.properties", val)}
              ref={mappingsRef}
              readonly={readonly}
            />
          </EuiFormRow>
        </div>
      </ContentPanel>
    </>
  );
};

// @ts-ignore
export default forwardRef(TemplateDetail);
