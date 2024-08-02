/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Ref, forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import {
  EuiSpacer,
  EuiCompressedFormRow,
  EuiLink,
  EuiOverlayMask,
  EuiLoadingSpinner,
  EuiContextMenu,
  EuiSmallButton,
  EuiCallOut,
  EuiTitle,
} from "@elastic/eui";
import { set, merge, omit, pick } from "lodash";
import flat from "flat";
import { ContentPanel } from "../ContentPanel";
import UnsavedChangesBottomBar from "../UnsavedChangesBottomBar";
import AliasSelect, { AliasSelectProps } from "../AliasSelect";
import IndexMapping from "../IndexMapping";
import { IndexItem, IndexItemRemote } from "../../../models/interfaces";
import { ServerResponse } from "../../../server/models/types";
import {
  INDEX_IMPORT_SETTINGS,
  INDEX_DYNAMIC_SETTINGS,
  IndicesUpdateMode,
  INDEX_NAMING_MESSAGE,
  REPLICA_NUMBER_MESSAGE,
  INDEX_SETTINGS_URL,
  INDEX_NAMING_PATTERN,
  ALIAS_SELECT_RULE,
} from "../../utils/constants";
import { Modal } from "../Modal";
import FormGenerator, { IField, IFormGeneratorRef } from "../FormGenerator";
import EuiToolTipWrapper from "../EuiToolTipWrapper";
import { IIndexMappingsRef, transformArrayToObject, transformObjectToArray } from "../IndexMapping";
import { IFieldComponentProps } from "../FormGenerator";
import SimplePopover from "../SimplePopover";
import { SimpleEuiToast } from "../Toast";
import { filterByMinimatch, getOrderedJson } from "../../../utils/helper";
import { SYSTEM_INDEX } from "../../../utils/constants";
import { diffJson } from "../../utils/helpers";
import { OptionalLabel } from "../CustomFormRow";

const WrappedAliasSelect = EuiToolTipWrapper(AliasSelect as any, {
  disabledKey: "isDisabled",
});

const formatMappings = (mappings: IndexItem["mappings"]): IndexItemRemote["mappings"] => {
  return {
    ...mappings,
    properties: transformArrayToObject(mappings?.properties || []),
  };
};

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
  onChange: (value: IndexDetailProps["value"]) => void;
  docVersion: string;
  refreshOptions: AliasSelectProps["refreshOptions"];
  value?: Partial<IndexItem>;
  oldValue?: Partial<IndexItem>;
  isEdit?: boolean;
  readonly?: boolean;
  mode?: IndicesUpdateMode;
  onSimulateIndexTemplate?: (indexName: string) => Promise<ServerResponse<IndexItemRemote>>;
  onGetIndexDetail?: (indexName: string) => Promise<IndexItemRemote>;
  sourceIndices?: string[];
  onSubmit?: () => Promise<{ ok: boolean }>;
  refreshIndex?: () => void;
  withoutPanel?: boolean;
}

export interface IIndexDetailRef {
  validate: () => Promise<boolean>;
  hasUnsavedChanges: (mode: IndicesUpdateMode) => number;
  getMappingsJSONEditorValue: () => string;
  simulateFromTemplate: () => Promise<void>;
  importSettings: (args: { index: string }) => Promise<void>;
}

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
    onSubmit,
    refreshIndex,
    docVersion,
    withoutPanel,
  }: IndexDetailProps,
  ref: Ref<IIndexDetailRef>
) => {
  const valueRef = useRef(value);
  valueRef.current = value;
  const hasEdit = useRef(false);
  const onValueChange = useCallback(
    (name: string | string[], val) => {
      let finalValue = valueRef.current || {};
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
              title: "Merge your changes with templates?",
              content:
                "The index name matches one or more index templates. Index aliases, settings, and mappings are inherited from matching templates. Do you want to merge your changes with templates?",
              locale: {
                confirm: "Merge with templates",
                cancel: "Overwrite by templates",
              },
              footer: ["cancel", "confirm"],
              type: "confirm",
              "data-test-subj": "simulate-confirm",
              onCancel: () => resolve(result.response),
              onOk: () => {
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
          ...indexDetail?.mappings,
          properties: transformObjectToArray(indexDetail?.mappings?.properties || {}),
        },
        // pick some metadata in index
        settings: pick(indexDetail?.settings || {}, INDEX_IMPORT_SETTINGS),
      });
      SimpleEuiToast.addSuccess(`Settings and mappings of [${index}] have been import successfully`);
      hasEdit.current = false;
    }
  };
  useImperativeHandle(ref, () => ({
    validate: async () => {
      const result = await Promise.all([
        aliasesRef.current?.validatePromise().then((result) => result.errors),
        mappingsRef.current?.validate(),
        settingsRef.current?.validatePromise().then((result) => result.errors),
      ]);
      return result.every((item) => !item);
    },
    hasUnsavedChanges: (mode: IndicesUpdateMode) => diffJson(oldValue?.[mode], finalValue[mode]),
    getMappingsJSONEditorValue: () => mappingsRef.current?.getJSONEditorValue() || "",
    simulateFromTemplate: onIndexInputBlur,
    importSettings: onImportSettings,
  }));
  const formFields: IField[] = useMemo(() => {
    return [
      {
        rowProps: {
          label: "Number of primary shards",
          helpText: (
            <>
              <div>Specify the number of primary shards for the index. Default is 1. </div>
              <div>The number of primary shards cannot be changed after the index is created.</div>
            </>
          ),
          direction: isEdit ? "hoz" : "ver",
        },
        name: "index.number_of_shards",
        type: readonly || (isEdit && !INDEX_DYNAMIC_SETTINGS.includes("index.number_of_shards")) ? "Text" : "Number",
        options: {
          rules: [
            {
              min: 1,
              message: "Number of primary shards cannot be smaller than 1.",
            },
            {
              validator(rule, value, values) {
                if (Number(value) !== parseInt(value)) {
                  return Promise.reject("Number of primary shards must be an integer.");
                }

                return Promise.resolve();
              },
            },
          ],
          props: {
            placeholder: "Specify primary shard count.",
            removeWhenEmpty: true,
          },
        },
      },
      {
        rowProps: {
          label: "Number of replicas",
          helpText: REPLICA_NUMBER_MESSAGE,
          direction: isEdit ? "hoz" : "ver",
        },
        name: "index.number_of_replicas",
        type: readonly || (isEdit && !INDEX_DYNAMIC_SETTINGS.includes("index.number_of_replicas")) ? "Text" : "Number",
        options: {
          rules: [
            {
              min: 0,
              message: "Number of replicas cannot be smaller than 0.",
            },
            {
              validator(rule, value, values) {
                if (Number(value) !== parseInt(value)) {
                  return Promise.reject("Number of replicas must be an integer.");
                }

                return Promise.resolve();
              },
            },
          ],
          props: {
            placeholder: "Specify number of replicas.",
            removeWhenEmpty: true,
          },
        },
      },
      {
        rowProps: {
          label: "Refresh interval",
          helpText:
            "Specify how often the index should refresh, which publishes the most recent changes and make them available for search. Default is 1 second.",
          direction: isEdit ? "hoz" : "ver",
        },
        name: "index.refresh_interval",
        type: readonly ? "Text" : "Input",
        options: {
          props: {
            placeholder: "Can be set to -1 to disable refreshing.",
            removeWhenEmpty: true,
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
          <EuiCallOut color="warning">
            This index may contain critical system data. Changing system indexes may break OpenSearch.
          </EuiCallOut>
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
                      style: isEdit ? { display: "none" } : {},
                    },
                    type: readonly || isEdit ? "Text" : "Input",
                    options: {
                      props: {
                        placeholder: "Specify a name for the new index.",
                        onBlur: onIndexInputBlur,
                        isLoading: templateSimulateLoading,
                      },
                      rules: [
                        {
                          pattern: INDEX_NAMING_PATTERN,
                          message: "Invalid index name.",
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
                      label: "Index alias",
                      helpText: "Allow this index to be referenced by existing aliases or specify a new alias.",
                      direction: isEdit ? "hoz" : "ver",
                      isOptional: true,
                    },
                    options: {
                      props: {
                        refreshOptions: refreshOptions,
                      },
                      rules: [...ALIAS_SELECT_RULE],
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

            const title = "Define index";

            if (withoutPanel) {
              return (
                <>
                  <EuiTitle size="s">
                    <span>{title}</span>
                  </EuiTitle>
                  <EuiSpacer size="s" />
                  {content}
                  <EuiSpacer />
                </>
              );
            }

            return (
              <>
                <ContentPanel title={title} titleSize="s">
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
              <EuiSmallButton iconType="arrowDown" iconSide="right" data-test-subj="importSettingMappingBtn">
                Import settings and mappings
              </EuiSmallButton>
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
                  width: 400,
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
                          Specify a comma-delimited list of settings.{" "}
                          <EuiLink external href={INDEX_SETTINGS_URL} target="_blank">
                            View index settings.
                          </EuiLink>
                        </p>
                        <p>
                          All the settings will be handled in flat structure.{" "}
                          <EuiLink
                            href={`https://opensearch.org/docs/${docVersion}/api-reference/index-apis/get-index/#url-parameters`}
                            external
                            target="_blank"
                          >
                            Learn more
                          </EuiLink>
                          .
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

            const title = "Index settings";

            if (withoutPanel) {
              return (
                <>
                  <EuiTitle size="s">
                    <h2>{title}</h2>
                  </EuiTitle>
                  <EuiSpacer size="s" />
                  {content}
                  <EuiSpacer />
                </>
              );
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
              <EuiCompressedFormRow fullWidth>
                <IndexMapping
                  isEdit={isEdit}
                  value={finalValue?.mappings}
                  oldValue={oldValue?.mappings}
                  onChange={(val) => onValueChange("mappings", val)}
                  ref={mappingsRef}
                  readonly={readonly}
                  docVersion={docVersion}
                />
              </EuiCompressedFormRow>
            );

            if (mode && mode === IndicesUpdateMode.mappings) {
              return content;
            }

            if (withoutPanel) {
              return (
                <>
                  <EuiTitle size="s">
                    <div>Index mapping</div>
                  </EuiTitle>
                  <EuiSpacer size="s" />
                  {content}
                  <EuiSpacer />
                </>
              );
            }

            return (
              <ContentPanel
                title={
                  <>
                    <EuiTitle size="s">
                      <div>
                        Index mapping
                        <OptionalLabel />
                      </div>
                    </EuiTitle>
                    <EuiCompressedFormRow
                      fullWidth
                      helpText={
                        <>
                          <div>
                            Define how documents and their fields are stored and indexed.{" "}
                            <EuiLink target="_blank" external href={`https://opensearch.org/docs/${docVersion}/opensearch/mappings/`}>
                              Learn more
                            </EuiLink>
                          </div>
                          <div>Mappings and field types cannot be changed after the index is created.</div>
                        </>
                      }
                    >
                      <></>
                    </EuiCompressedFormRow>
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
      {isEdit && mode === IndicesUpdateMode.settings && diffJson(oldValue?.settings, finalValue.settings) ? (
        <UnsavedChangesBottomBar
          submitButtonDataTestSubj="createIndexCreateButton"
          unsavedCount={diffJson(oldValue?.settings, finalValue.settings)}
          onClickCancel={async () => {
            onValueChange("settings", JSON.parse(JSON.stringify(oldValue?.settings || {})));
          }}
          onClickSubmit={async () => {
            const result = (await onSubmit?.()) || { ok: false };
            if (result.ok) {
              refreshIndex?.();
            }
          }}
        />
      ) : null}
      {isEdit &&
      mode === IndicesUpdateMode.mappings &&
      diffJson(formatMappings(oldValue?.mappings), formatMappings(finalValue.mappings)) ? (
        <UnsavedChangesBottomBar
          submitButtonDataTestSubj="createIndexCreateButton"
          unsavedCount={diffJson(formatMappings(oldValue?.mappings), formatMappings(finalValue.mappings))}
          onClickCancel={async () => {
            onValueChange("mappings", JSON.parse(JSON.stringify(oldValue?.mappings || {})));
          }}
          onClickSubmit={async () => {
            const result = (await onSubmit?.()) || { ok: false };
            if (result.ok) {
              refreshIndex?.();
            }
          }}
        />
      ) : null}
      {isEdit && mode === IndicesUpdateMode.alias && diffJson(oldValue?.aliases, finalValue.aliases) ? (
        <UnsavedChangesBottomBar
          submitButtonDataTestSubj="createIndexCreateButton"
          unsavedCount={diffJson(oldValue?.aliases, finalValue.aliases)}
          onClickCancel={async () => {
            onValueChange("aliases", JSON.parse(JSON.stringify(oldValue?.aliases || {})));
          }}
          onClickSubmit={async () => {
            const result = (await onSubmit?.()) || { ok: false };
            if (result.ok) {
              refreshIndex?.();
            }
          }}
        />
      ) : null}
    </>
  );
};

// @ts-ignore
export default forwardRef(IndexDetail);
