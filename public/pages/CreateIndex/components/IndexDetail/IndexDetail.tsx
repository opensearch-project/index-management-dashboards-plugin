/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { forwardRef, useCallback, useImperativeHandle, useMemo, useRef, useState } from "react";
import { EuiSpacer, EuiFormRow, EuiFieldText, EuiLink } from "@elastic/eui";
import { set, merge } from "lodash";
import { ContentPanel } from "../../../../components/ContentPanel";
import AliasSelect, { AliasSelectProps } from "../AliasSelect";
import IndexMapping from "../IndexMapping";
import { IndexItem, IndexItemRemote } from "../../../../../models/interfaces";
import { ServerResponse } from "../../../../../server/models/types";
import { Ref } from "react";
import { INDEX_DYNAMIC_SETTINGS, IndicesUpdateMode } from "../../../../utils/constants";
import { Modal } from "../../../../components/Modal";
import FormGenerator, { IField, IFormGeneratorRef } from "../../../../components/FormGenerator";
import { transformArrayToObject, transformObjectToArray } from "../IndexMapping/IndexMapping";

export interface IndexDetailProps {
  value?: Partial<IndexItem>;
  oldValue?: Partial<IndexItem>;
  onChange: (value: IndexDetailProps["value"]) => void;
  isEdit?: boolean;
  refreshOptions: AliasSelectProps["refreshOptions"];
  mode?: IndicesUpdateMode;
  onSimulateIndexTemplate?: (indexName: string) => Promise<ServerResponse<IndexItemRemote>>;
}

export interface IIndexDetailRef {
  validate: () => Promise<boolean>;
}

const IndexDetail = (
  { value, onChange, isEdit, oldValue, refreshOptions, mode, onSimulateIndexTemplate }: IndexDetailProps,
  ref: Ref<IIndexDetailRef>
) => {
  const hasEdit = useRef(false);
  const onValueChange = useCallback(
    (name: string, val) => {
      let finalValue = value || {};
      set(finalValue, name, val);
      onChange({ ...finalValue });
      if (name !== "index") {
        hasEdit.current = true;
      }
    },
    [onChange, value]
  );
  const [errors, setErrors] = useState({} as Record<string, string>);
  const [templateSimulateLoading, setTemplateSimulateLoading] = useState(false);
  const finalValue = value || {};
  const settingsRef = useRef<IFormGeneratorRef>(null);
  useImperativeHandle(ref, () => ({
    validate: async () => {
      const result = await settingsRef.current?.validatePromise();
      if (result?.errors) {
        return false;
      }
      if (!value?.index) {
        setErrors({
          index: "Index name can not be null.",
        });
        return false;
      }
      setErrors({});
      return true;
    },
  }));
  const onIndexInputBlur = useCallback(async () => {
    if (finalValue.index && onSimulateIndexTemplate) {
      setTemplateSimulateLoading(true);
      const result = await onSimulateIndexTemplate(finalValue.index);
      if (result && result.ok) {
        let onChangePromise: Promise<IndexItemRemote>;
        if (hasEdit.current) {
          onChangePromise = new Promise((resolve) => {
            Modal.show({
              title: "Confirm",
              content: "The index name has matched one or more index templates, please choose which way to go on",
              locale: {
                ok: "Overwrite",
                cancel: "Merge the template",
              },
              type: "confirm",
              onOk: () => resolve(result.response),
              onCancel: () => {
                const formatValue: IndexItemRemote = {
                  index: "",
                  ...finalValue,
                  mappings: {
                    properties: transformArrayToObject(finalValue.mappings?.properties || []),
                  },
                };
                const mergedValue: IndexItemRemote = {
                  index: finalValue.index || "",
                };
                merge(mergedValue, result.response, formatValue);
                resolve(mergedValue);
              },
            });
          });
        } else {
          onChangePromise = Promise.resolve(result.response);
        }
        onChangePromise.then((data) => {
          onChange({
            ...data,
            mappings: {
              properties: transformObjectToArray(data?.mappings?.properties || {}),
            },
          });
          hasEdit.current = false;
        });
      }
      setTemplateSimulateLoading(false);
    }
  }, [finalValue.index, onSimulateIndexTemplate]);
  const formFields: IField[] = useMemo(() => {
    return [
      {
        rowProps: {
          label: "Number of shards",
          helpText: "The number of primary shards in the index. Default is 1.",
        },
        name: "number_of_shards",
        type: "Number",
        options: {
          rules: [
            {
              required: true,
            },
          ],
          props: {
            disabled: (isEdit && !INDEX_DYNAMIC_SETTINGS.includes("index.number_of_shards")) || templateSimulateLoading,
            placeholder: "The number of primary shards in the index. Default is 1.",
          },
        },
      },
      {
        rowProps: {
          label: "Number of replicas",
          helpText: "The number of replica shards each primary shard should have.",
        },
        name: "number_of_replicas",
        type: "Number",
        options: {
          rules: [
            {
              required: true,
            },
          ],
          props: {
            disabled: (isEdit && !INDEX_DYNAMIC_SETTINGS.includes("index.number_of_replicas")) || templateSimulateLoading,
            placeholder: "The number of replica shards each primary shard should have.",
          },
        },
      },
    ] as IField[];
  }, [isEdit]);
  return (
    <>
      {isEdit && mode && mode !== IndicesUpdateMode.alias ? null : (
        <>
          <ContentPanel title="Define index" titleSize="s">
            <div style={{ paddingLeft: "10px" }}>
              <EuiFormRow
                label="Index name"
                helpText="Some reestrictrion text on domain"
                isInvalid={!!errors["index"]}
                error={errors["index"]}
              >
                <EuiFieldText
                  placeholder="Please enter the name for your index"
                  value={finalValue.index}
                  onChange={(e) => onValueChange("index", e.target.value)}
                  onBlur={onIndexInputBlur}
                  isLoading={templateSimulateLoading}
                  disabled={isEdit || templateSimulateLoading}
                />
              </EuiFormRow>
              <EuiFormRow label="Index alias  - optional" helpText="Select existing aliases or specify a new alias">
                <AliasSelect
                  refreshOptions={refreshOptions}
                  value={finalValue.aliases}
                  onChange={(value) => onValueChange("aliases", value)}
                />
              </EuiFormRow>
            </div>
          </ContentPanel>
          <EuiSpacer />
        </>
      )}
      {isEdit && mode && mode !== IndicesUpdateMode.settings ? null : (
        <>
          <ContentPanel title="Index settings" titleSize="s">
            <div style={{ paddingLeft: "10px" }}>
              <FormGenerator
                ref={settingsRef}
                value={{ ...finalValue.settings?.index }}
                onChange={(totalValue, name, val) => {
                  if (name) {
                    onValueChange(`settings.index.${name}`, val);
                  } else {
                    onValueChange("settings.index", val);
                  }
                }}
                formFields={formFields}
                hasAdvancedSettings
                advancedSettingsProps={{
                  accordionProps: {
                    initialIsOpen: false,
                    id: "accordion_for_create_index_settings",
                    buttonContent: <h4>Advanced settings</h4>,
                  },
                  rowProps: {
                    label: "Specify advanced index settings",
                    helpText: (
                      <>
                        Specify a comma-delimited list of settings.
                        <EuiLink
                          href="https://opensearch.org/docs/latest/api-reference/index-apis/create-index#index-settings"
                          target="_blank"
                        >
                          View index settings
                        </EuiLink>
                      </>
                    ),
                  },
                }}
              />
            </div>
          </ContentPanel>
          <EuiSpacer />
        </>
      )}
      {isEdit && mode && mode !== IndicesUpdateMode.mappings ? null : (
        <ContentPanel title="Index mappings - optional" titleSize="s">
          <div style={{ paddingLeft: "10px" }}>
            <EuiFormRow fullWidth>
              <IndexMapping
                isEdit={isEdit}
                value={finalValue?.mappings?.properties}
                oldValue={oldValue?.mappings?.properties}
                onChange={(val) => onValueChange("mappings.properties", val)}
              />
            </EuiFormRow>
          </div>
        </ContentPanel>
      )}
    </>
  );
};

// @ts-ignore
export default forwardRef(IndexDetail);
