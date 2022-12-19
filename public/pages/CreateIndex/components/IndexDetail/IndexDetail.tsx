/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Ref, forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import {
  EuiSpacer,
  EuiFormRow,
  EuiLink,
  EuiOverlayMask,
  EuiLoadingSpinner,
  EuiContextMenu,
  EuiButton,
  EuiCallOut,
  EuiTitle,
} from "@elastic/eui";
import { set, merge, omit, pick } from "lodash";
import flat from "flat";
import { ContentPanel } from "../../../../components/ContentPanel";
import AliasSelect, { AliasSelectProps } from "../AliasSelect";
import IndexMapping from "../IndexMapping";
import { IndexItem, IndexItemRemote } from "../../../../../models/interfaces";
import { ServerResponse } from "../../../../../server/models/types";
import {
  INDEX_IMPORT_SETTINGS,
  INDEX_DYNAMIC_SETTINGS,
  IndicesUpdateMode,
  INDEX_NAMING_MESSAGE,
  REPLICA_NUMBER_MESSAGE,
} from "../../../../utils/constants";
import { Modal } from "../../../../components/Modal";
import FormGenerator, { IField, IFormGeneratorRef } from "../../../../components/FormGenerator";
import EuiToolTipWrapper from "../../../../components/EuiToolTipWrapper";
import { IIndexMappingsRef, transformArrayToObject, transformObjectToArray } from "../IndexMapping";
import { IFieldComponentProps } from "../../../../components/FormGenerator";
import SimplePopover from "../../../../components/SimplePopover";
import { SimpleEuiToast } from "../../../../components/Toast";
import { filterByMinimatch } from "../../../../../utils/helper";
import { SYSTEM_INDEX } from "../../../../../utils/constants";

const WrappedAliasSelect = EuiToolTipWrapper(AliasSelect as any, {
  disabledKey: "isDisabled",
});

export const defaultIndexSettings = {
  index: "",
  settings: {
    "index.number_of_shards": 1,
    "index.number_of_replicas": 1,
    "index.refresh_interval": "1s",
  },
  mappings: {},
};

export interface IndexDetailProps {
  value?: Partial<IndexItem>;
  oldValue?: Partial<IndexItem>;
  onChange: (value: IndexDetailProps["value"]) => void;
  isEdit?: boolean;
  readonly?: boolean;
  refreshOptions: AliasSelectProps["refreshOptions"];
  mode?: IndicesUpdateMode;
  onSimulateIndexTemplate?: (indexName: string) => Promise<ServerResponse<IndexItemRemote>>;
  onGetIndexDetail?: (indexName: string) => Promise<IndexItemRemote>;
  sourceIndices?: string[];
}

export interface IIndexDetailRef {
  validate: () => Promise<boolean>;
}

const getOrderedJson = (json: Record<string, any>) => {
  const entries = Object.entries(json);
  entries.sort((a, b) => (a[0] < b[0] ? -1 : 1));
  return entries.reduce((total, [key, value]) => ({ ...total, [key]: value }), {});
};

const TemplateInfoCallout = (props: { visible: boolean }) => {
  return props.visible ? (
    <EuiCallOut title="The index name matches one or more index templates">
      Index alias, settings, and mappings are automatically inherited from matching index templates.
    </EuiCallOut>
  ) : null;
};

const IndexDetail = (
  {
    value,
    onChange,
    isEdit,
    readonly,
    oldValue,
    refreshOptions,
    mode,
    onSimulateIndexTemplate,
    sourceIndices = [],
    onGetIndexDetail,
  }: IndexDetailProps,
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
  const destroyRef = useRef<boolean>(false);
  const [templateSimulateLoading, setTemplateSimulateLoading] = useState(false);
  const [isMatchingTemplate, setIsMatchingTemplate] = useState(false);
  const finalValue = value || {};
  const aliasesRef = useRef<IFormGeneratorRef>(null);
  const settingsRef = useRef<IFormGeneratorRef>(null);
  const mappingsRef = useRef<IIndexMappingsRef>(null);
  useImperativeHandle(ref, () => ({
    validate: async () => {
      const result = await Promise.all([
        aliasesRef.current?.validatePromise().then((result) => result.errors),
        mappingsRef.current?.validate(),
        settingsRef.current?.validatePromise().then((result) => result.errors),
      ]);
      return result.every((item) => !item);
    },
  }));
  const onIndexInputBlur = useCallback(async () => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    if (destroyRef.current) {
      return;
    }
    if (finalValue.index && onSimulateIndexTemplate) {
      setTemplateSimulateLoading(true);
      const result = await onSimulateIndexTemplate(finalValue.index);
      if (destroyRef.current) {
        return;
      }
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
                cancel: "Merge your changes with template",
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
          setIsMatchingTemplate(true);
        });
      } else {
        setIsMatchingTemplate(false);
      }
    }
  }, [finalValue.index, onSimulateIndexTemplate]);
  const onImportSettings = async ({ index }: { index: string }) => {
    if (onGetIndexDetail) {
      const indexDetail: IndexItemRemote = await new Promise((resolve) => {
        if (hasEdit.current) {
          Modal.show({
            type: "confirm",
            title: "Confirm",
            content: "We find that you made some changes to this draft, what action do you want to make?",
            locale: {
              confirm: "Overwrite",
              cancel: "do not import",
            },
            onOk: async () => onGetIndexDetail(index).then(resolve),
          });
        } else {
          onGetIndexDetail(index).then(resolve);
        }
      });

      onChange({
        // omit alias
        ...omit(indexDetail, ["aliases", "data_stream"]),
        mappings: {
          properties: transformObjectToArray(indexDetail?.mappings?.properties || {}),
        },
        // pick some metadata in index
        settings: pick(indexDetail?.settings || {}, INDEX_IMPORT_SETTINGS),
      });
      SimpleEuiToast.addSuccess(`Settings and mappings of [${index}] have been import successfully`);
      hasEdit.current = false;
    }
  };
  const formFields: IField[] = useMemo(() => {
    return [
      {
        rowProps: {
          label: "Number of primary shards",
          helpText: (
            <>
              <p>Specify the number of primary shards for the index. Default is 1. </p>
              <p>The number of primary shards cannot be changed after the index is created.</p>
            </>
          ),
        },
        name: "index.number_of_shards",
        type: readonly || (isEdit && !INDEX_DYNAMIC_SETTINGS.includes("index.number_of_shards")) ? "Text" : "Number",
        options: {
          rules: [
            {
              min: 1,
              message: "Number of primary shards can not smaller than 1",
            },
            {
              validator(rule, value, values) {
                if (Number(value) !== parseInt(value)) {
                  return Promise.reject("Number of primary shards must be an integer");
                }

                return Promise.resolve();
              },
            },
          ],
          props: {
            placeholder: "The number of primary shards in the index. Default is 1.",
          },
        },
      },
      {
        rowProps: {
          label: "Number of replicas",
          helpText: REPLICA_NUMBER_MESSAGE,
        },
        name: "index.number_of_replicas",
        type: readonly || (isEdit && !INDEX_DYNAMIC_SETTINGS.includes("index.number_of_replicas")) ? "Text" : "Number",
        options: {
          rules: [
            {
              min: 0,
              message: "Number of replicas can not smaller than 0",
            },
            {
              validator(rule, value, values) {
                if (Number(value) !== parseInt(value)) {
                  return Promise.reject("Number of replicas must be an integer");
                }

                return Promise.resolve();
              },
            },
          ],
          props: {
            placeholder: "The number of replica shards each primary shard should have.",
          },
        },
      },
      {
        rowProps: {
          label: "Refresh interval",
          helpText:
            "Specify how often the index should refresh, which publishes the most recent changes and make them available for search. Default is 1 second.",
        },
        name: "index.refresh_interval",
        type: readonly ? "Text" : "Input",
        options: {
          props: {
            placeholder: "Can be set to -1 to disable refreshing.",
          },
        },
      },
    ] as IField[];
  }, [isEdit, finalValue.index, templateSimulateLoading]);
  useEffect(() => {
    return () => {
      destroyRef.current = true;
    };
  }, []);
  return (
    <>
      {isEdit && !readonly && filterByMinimatch(value?.index as string, SYSTEM_INDEX) ? (
        <>
          <EuiCallOut color="warning">You are editing a system-like index, please be careful before you do any change to it.</EuiCallOut>
          <EuiSpacer />
        </>
      ) : null}
      {isEdit && mode && mode !== IndicesUpdateMode.alias
        ? null
        : (() => {
            const content = (
              <FormGenerator
                ref={aliasesRef}
                formFields={[
                  {
                    name: "index",
                    rowProps: {
                      label: "Index name",
                      helpText: <div>{INDEX_NAMING_MESSAGE}</div>,
                      position: "bottom",
                    },
                    type: readonly || isEdit ? "Text" : "Input",
                    options: {
                      props: {
                        placeholder: "Please enter the name for your index",
                        onBlur: onIndexInputBlur,
                        isLoading: templateSimulateLoading,
                      },
                      rules: [
                        {
                          required: true,
                          message: "Index name can not be null.",
                        },
                        {
                          pattern: /^[^A-Z-_"*+/\\|?#<>][^A-Z"*+/\\|?#<>]*$/,
                          message: "Invalid index name",
                        },
                      ],
                    },
                  },
                  {
                    name: "templateMessage",
                    rowProps: {
                      fullWidth: true,
                    },
                    component: () => <TemplateInfoCallout visible={!isEdit && isMatchingTemplate} />,
                  },
                  {
                    name: "aliases",
                    rowProps: {
                      label: "Index alias - optional",
                      helpText: "Allow this index to be referenced by existing aliases or specify a new alias.",
                    },
                    options: {
                      props: {
                        refreshOptions: refreshOptions,
                      },
                    },
                    component: WrappedAliasSelect as React.ComponentType<IFieldComponentProps>,
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
            );
            if (mode && mode === IndicesUpdateMode.alias) {
              return content;
            }
            return (
              <>
                <ContentPanel title="Define index" titleSize="s">
                  {content}
                </ContentPanel>
                <EuiSpacer />
              </>
            );
          })()}
      {sourceIndices.length ? (
        <>
          <SimplePopover
            data-test-subj="moreAction"
            panelPaddingSize="none"
            button={
              <EuiButton iconType="arrowDown" iconSide="right" data-test-subj="importSettingMappingBtn">
                Import settings and mappings
              </EuiButton>
            }
          >
            <EuiContextMenu
              initialPanelId={0}
              // The EuiContextMenu has bug when testing in jest
              // the props change won't make it rerender
              key={sourceIndices.join(",")}
              panels={[
                {
                  id: 0,
                  items: sourceIndices.map((sourceIndex) => ({
                    name: sourceIndex,
                    "data-test-subj": `import-settings-${sourceIndex}`,
                    onClick: () => onImportSettings({ index: sourceIndex }),
                  })),
                },
              ]}
            />
          </SimplePopover>
          <EuiSpacer />
        </>
      ) : null}
      {isEdit && mode && mode !== IndicesUpdateMode.settings
        ? null
        : (() => {
            const content = (
              <FormGenerator
                ref={settingsRef}
                value={{ ...finalValue.settings }}
                onChange={(totalValue, name, val) => {
                  if (name) {
                    onValueChange(["settings", name as string], val);
                  } else {
                    onValueChange("settings", val);
                  }
                }}
                formFields={formFields}
                hasAdvancedSettings
                resetValuesWhenPropsValueChange
                advancedSettingsProps={{
                  editorProps: {
                    mode: isEdit && !readonly ? "diff" : "json",
                    disabled: readonly,
                    original: JSON.stringify(getOrderedJson(oldValue?.settings || {}), null, 2),
                    width: "100%",
                    formatValue: flat,
                  },
                  accordionProps: {
                    initialIsOpen: false,
                    id: "accordionForCreateIndexSettings",
                    buttonContent: <h4>Advanced settings</h4>,
                  },
                  rowProps: {
                    label: "Specify advanced index settings",
                    fullWidth: true,
                    helpText: (
                      <>
                        <p>
                          Specify a comma-delimited list of settings.
                          <EuiLink
                            external
                            href="https://opensearch.org/docs/latest/api-reference/index-apis/create-index#index-settings"
                            target="_blank"
                          >
                            View index settings.
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
                  },
                }}
              />
            );
            if (mode && mode === IndicesUpdateMode.settings) {
              return content;
            }

            return (
              <>
                <ContentPanel title="Index settings" titleSize="s">
                  {content}
                </ContentPanel>
                <EuiSpacer />
              </>
            );
          })()}
      {isEdit && mode && mode !== IndicesUpdateMode.mappings
        ? null
        : (() => {
            const content = (
              <EuiFormRow fullWidth>
                <IndexMapping
                  isEdit={isEdit}
                  value={finalValue?.mappings}
                  oldValue={oldValue?.mappings}
                  onChange={(val) => onValueChange("mappings", val)}
                  ref={mappingsRef}
                  readonly={readonly}
                />
              </EuiFormRow>
            );

            if (mode && mode === IndicesUpdateMode.mappings) {
              return content;
            }

            return (
              <ContentPanel
                title={
                  <>
                    <EuiTitle size="s">
                      <div>Index mapping - optional</div>
                    </EuiTitle>
                    <EuiFormRow
                      fullWidth
                      helpText={
                        <div>
                          Define how documents and their fields are stored and indexed.
                          <EuiLink target="_blank" external href="https://opensearch.org/docs/latest/opensearch/mappings/">
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
                {content}
              </ContentPanel>
            );
          })()}
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
