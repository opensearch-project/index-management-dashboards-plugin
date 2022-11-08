/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { forwardRef, useCallback, useImperativeHandle, useMemo, useRef, useState } from "react";
import { EuiSpacer, EuiFormRow, EuiFieldText, EuiLink, EuiOverlayMask, EuiLoadingSpinner } from "@elastic/eui";
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
import { IIndexMappingsRef, transformArrayToObject, transformObjectToArray } from "../IndexMapping/IndexMapping";

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
    (name: string | string[], val) => {
      let finalValue = value || {};
      set(finalValue, name, val);
      onChange({ ...finalValue });
      if (name !== "index") {
        hasEdit.current = true;
      }
    },
    [onChange, value]
  );
  const [templateSimulateLoading, setTemplateSimulateLoading] = useState(false);
  const finalValue = value || {};
  const aliasesRef = useRef<IFormGeneratorRef>(null);
  const settingsRef = useRef<IFormGeneratorRef>(null);
  const mappingsRef = useRef<IIndexMappingsRef>(null);
  useImperativeHandle(ref, () => ({
    validate: async () => {
      const aliasesValidateResult = await aliasesRef.current?.validatePromise();
      if (aliasesValidateResult?.errors) {
        return false;
      }

      const mappingsValidateResult = await mappingsRef.current?.validate();
      if (mappingsValidateResult) {
        return false;
      }

      const result = await settingsRef.current?.validatePromise();
      if (result?.errors) {
        return false;
      }
      return true;
    },
  }));
  const onIndexInputBlur = useCallback(async () => {
    if (finalValue.index && onSimulateIndexTemplate) {
      setTemplateSimulateLoading(true);
      const result = await onSimulateIndexTemplate(finalValue.index);
      setTemplateSimulateLoading(false);
      if (result && result.ok) {
        let onChangePromise: Promise<IndexItemRemote>;
        if (hasEdit.current) {
          onChangePromise = new Promise((resolve) => {
            Modal.show({
              title: "Confirm",
              content: "The index name has matched one or more index templates, please choose which way to go on",
              locale: {
                confirm: "Overwrite",
                cancel: "Merge the template",
              },
              type: "confirm",
              "data-test-subj": "simulate-confirm",
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
    }
  }, [finalValue.index, onSimulateIndexTemplate]);
  const formFields: IField[] = useMemo(() => {
    return [
      {
        rowProps: {
          label: "Number of shards",
          helpText: "The number of primary shards in the index. Default is 1.",
        },
        name: "index.number_of_shards",
        type: "Number",
        options: {
          rules: [
            {
              required: true,
            },
          ],
          props: {
            disabled:
              (isEdit && !INDEX_DYNAMIC_SETTINGS.includes("index.number_of_shards")) || templateSimulateLoading || !finalValue.index,
            placeholder: "The number of primary shards in the index. Default is 1.",
          },
        },
      },
      {
        rowProps: {
          label: "Number of replicas",
          helpText: "The number of replica shards each primary shard should have.",
        },
        name: "index.number_of_replicas",
        type: "Number",
        options: {
          rules: [
            {
              required: true,
            },
          ],
          props: {
            disabled:
              (isEdit && !INDEX_DYNAMIC_SETTINGS.includes("index.number_of_replicas")) || templateSimulateLoading || !finalValue.index,
            placeholder: "The number of replica shards each primary shard should have.",
          },
        },
      },
      {
        rowProps: {
          label: "Refresh interval of index",
          helpText: "How often the index should refresh, which publishes its most recent changes and makes them available for searching.",
        },
        name: "index.refresh_interval",
        type: "Input",
        options: {
          props: {
            disabled:
              (isEdit && !INDEX_DYNAMIC_SETTINGS.includes("index.refresh_interval")) || templateSimulateLoading || !finalValue.index,
            placeholder: "Can be set to -1 to disable refreshing.",
          },
        },
      },
    ] as IField[];
  }, [isEdit, finalValue.index, templateSimulateLoading]);
  return (
    <>
      {isEdit && mode && mode !== IndicesUpdateMode.alias ? null : (
        <>
          <ContentPanel title="Define index" titleSize="s">
            <div style={{ paddingLeft: "10px" }}>
              <FormGenerator
                ref={aliasesRef}
                formFields={[
                  {
                    name: "index",
                    rowProps: {
                      label: "Index name",
                      helpText: finalValue.index
                        ? "Some restriction text on domain"
                        : "Please enter the name before moving to other fields",
                    },
                    type: "Input",
                    options: {
                      props: {
                        placeholder: "Please enter the name for your index",
                        onBlur: onIndexInputBlur,
                        isLoading: templateSimulateLoading,
                        disabled: isEdit || templateSimulateLoading,
                      },
                      rules: [
                        {
                          required: true,
                          message: "Index name can not be null.",
                        },
                      ],
                    },
                  },
                  {
                    name: "aliases",
                    rowProps: {
                      label: "Index alias  - optional",
                      helpText: "Select existing aliases or specify a new alias",
                    },
                    options: {
                      props: {
                        refreshOptions: refreshOptions,
                        isDisabled: !finalValue.index,
                      },
                    },
                    component: AliasSelect as any,
                  },
                ]}
                value={{
                  index: finalValue.index,
                  aliases: finalValue.aliases,
                }}
                onChange={(totalValue, name, val) => {
                  onValueChange(name as string, val);
                }}
              />
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
                value={{ ...finalValue.settings }}
                onChange={(totalValue, name, val) => {
                  if (name) {
                    onValueChange(["settings", name], val);
                  } else {
                    onValueChange("settings", val);
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
                ref={mappingsRef}
              />
            </EuiFormRow>
          </div>
        </ContentPanel>
      )}
      {templateSimulateLoading ? (
        <EuiOverlayMask headerZindexLocation="below">
          <EuiLoadingSpinner size="l" />
          We are simulating your template with existing templates, please wait for a second.
        </EuiOverlayMask>
      ) : null}
    </>
  );
};

// @ts-ignore
export default forwardRef(IndexDetail);
