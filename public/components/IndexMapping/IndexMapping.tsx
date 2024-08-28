/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { forwardRef, useCallback, useState, Ref, useRef, useMemo, useImperativeHandle } from "react";
import {
  EuiTreeView,
  EuiIcon,
  EuiTreeViewProps,
  EuiSmallButton,
  EuiButton,
  EuiSpacer,
  EuiButtonGroup,
  EuiLink,
  EuiCallOut,
  EuiText,
} from "@elastic/eui";
import { set, get, isEmpty } from "lodash";
import MonacoJSONEditor, { IJSONEditorRef } from "../MonacoJSONEditor";
import { Modal } from "../Modal";
import { MappingsProperties } from "../../../models/interfaces";
import CustomFormRow from "../CustomFormRow";
import MappingLabel, { IMappingLabelRef } from "../MappingLabel";
import { transformObjectToArray, transformArrayToObject, countNodesInTree, noAdditionalPropertiesValidator } from "./helper";
import { IndexMappingsObjectAll, IndexMappingProps, EDITOR_MODE, IIndexMappingsRef } from "./interfaces";
import { IndexMappingsJSONEditorSchema, schemaId } from "../../utils/JSON_schemas/index_mappings";
import "./IndexMapping.scss";

export * from "./helper";
export * from "./interfaces";

const IndexMapping = (
  { value: propsValue, onChange: propsOnChange, isEdit, oldValue, readonly, docVersion, useNewUx }: IndexMappingProps,
  ref: Ref<IIndexMappingsRef>
) => {
  const value = propsValue?.properties || [];
  const onChange = (val: MappingsProperties) => {
    propsOnChange({
      ...propsValue,
      properties: val,
    });
  };
  const allFieldsRef = useRef<Record<string, IMappingLabelRef>>({});
  const JSONEditorRef = useRef<IJSONEditorRef>(null);
  useImperativeHandle(ref, () => ({
    validate: async () => {
      const values = await Promise.all(Object.values(allFieldsRef.current).map((item) => item.validate()));
      const JSONEditorValidateResult = await JSONEditorRef.current?.validate();
      return values.some((item) => item) || JSONEditorValidateResult ? "with error" : "";
    },
    getJSONEditorValue: () => JSONEditorRef.current?.getValue() || "",
  }));
  const [editorMode, setEditorMode] = useState<EDITOR_MODE>(EDITOR_MODE.VISUAL);
  const addField = useCallback(
    (pos, fieldSettings?: Partial<MappingsProperties[number]>) => {
      const newValue = [...(value || [])];
      const nowProperties = ((pos ? get(newValue, pos) : (newValue as MappingsProperties)) || []) as MappingsProperties;
      nowProperties.push({
        fieldName: fieldSettings?.fieldName || "",
        type: "text",
        ...fieldSettings,
      });
      if (pos) {
        set(newValue, pos, nowProperties);
      }
      onChange(newValue);
    },
    [onChange, value]
  );
  const deleteField = useCallback(
    (pos) => {
      const newValue = [...(value || [])];
      const splittedArray = pos.split(".");
      const index = splittedArray[splittedArray.length - 1];
      const prefix = splittedArray.slice(0, -1);
      const prefixPos = prefix.join(".");
      const nowProperties = ((prefixPos ? get(newValue, prefixPos) : (newValue as MappingsProperties)) || []) as MappingsProperties;
      nowProperties.splice(index, 1);

      if (prefixPos) {
        set(newValue, prefixPos, nowProperties);
      }

      onChange(newValue);
    },
    [onChange, value]
  );
  const transformValueToTreeItems = (formValue: MappingsProperties, pos: string = ""): EuiTreeViewProps["items"] => {
    let isFirstEditableField = false;
    return (formValue || []).map((item, index) => {
      const { fieldName, ...fieldSettings } = item;
      const id = [pos, index].filter((item) => item !== "").join(".properties.");
      const readonlyFlag = readonly || (isEdit && !!get(oldValue?.properties, id));
      let shouldShowLabel = false;
      if (!readonlyFlag && !isFirstEditableField) {
        isFirstEditableField = true;
        shouldShowLabel = true;
      }
      const payload: EuiTreeViewProps["items"][number] = {
        label: (
          <MappingLabel
            shouldShowLabel={shouldShowLabel}
            ref={(ref) => {
              if (ref) {
                allFieldsRef.current[id] = ref;
              } else {
                delete allFieldsRef.current[id];
              }
            }}
            readonly={readonlyFlag}
            value={item}
            id={`mapping-visual-editor-${id}`}
            onFieldNameCheck={(fieldName) => {
              const hasDuplicateName = (formValue || [])
                .filter((sibItem, sibIndex) => sibIndex < index)
                .some((sibItem) => sibItem.fieldName === fieldName);
              if (hasDuplicateName) {
                return `Duplicate field name [${fieldName}], please change your field name`;
              }

              return "";
            }}
            onChange={(val, key, v) => {
              const newValue = [...(value || [])];
              set(newValue, id, val);
              onChange(newValue);
            }}
            onDeleteField={() => {
              deleteField(id);
            }}
            onAddSubField={() => {
              addField(`${id}.properties`);
            }}
            onAddSubObject={() => {
              addField(`${id}.properties`, {
                type: "object",
              });
            }}
          />
        ),
        id: `mapping-visual-editor-${id}`,
        icon: <EuiIcon type="arrowRight" style={{ visibility: "hidden" }} />,
        iconWhenExpanded: <EuiIcon type="arrowDown" style={{ visibility: "hidden" }} />,
      };
      if (fieldSettings.properties) {
        (payload.icon = <EuiIcon type="arrowRight" />),
          (payload.iconWhenExpanded = <EuiIcon type="arrowDown" />),
          (payload.children = transformValueToTreeItems(fieldSettings.properties, id));
      }

      return payload;
    });
  };
  const transformedTreeItems = useMemo(() => transformValueToTreeItems(value), [value]);
  const newValue = useMemo(() => {
    const oldValueKeys = (oldValue?.properties || []).map((item) => item.fieldName);
    return value?.filter((item, index) => index >= oldValueKeys.length) || [];
  }, [oldValue?.properties, value]);
  const renderKey = useMemo(() => {
    return countNodesInTree(value || []);
  }, [value]);
  return (
    <>
      <EuiButtonGroup
        type="single"
        idSelected={editorMode as string}
        onChange={(id) => setEditorMode(id as EDITOR_MODE)}
        legend="Editor Type"
        buttonSize="s"
        options={[
          {
            label: readonly ? "Tree view" : "Visual Editor",
            id: EDITOR_MODE.VISUAL,
            "data-test-subj": "editorTypeVisualEditor",
          },
          {
            label: readonly ? "JSON" : "JSON Editor",
            id: EDITOR_MODE.JSON,
            "data-test-subj": "editorTypeJsonEditor",
          },
        ]}
      />
      <EuiSpacer />
      {editorMode === EDITOR_MODE.VISUAL ? (
        <>
          {noAdditionalPropertiesValidator(transformArrayToObject(newValue)) ? null : (
            <>
              <EuiCallOut color="warning" title="You have advanced configurations not supported by the visual editor" size="s">
                To view or modify all of your configurations, switch to the JSON editor.
              </EuiCallOut>
              <EuiSpacer />
            </>
          )}
          {transformedTreeItems.length ? (
            <EuiTreeView
              key={renderKey}
              expandByDefault={!readonly}
              className="index-mapping-tree"
              aria-labelledby="label"
              items={transformValueToTreeItems(value)}
            />
          ) : (
            <EuiText size="s">
              <p>You have no field mappings.</p>
            </EuiText>
          )}
          {readonly ? null : (
            <>
              <EuiSpacer />
              <EuiSmallButton style={{ marginRight: 8 }} data-test-subj="createIndexAddFieldButton" onClick={() => addField("")}>
                Add new field
              </EuiSmallButton>
              <EuiSmallButton
                data-test-subj="createIndexAddObjectFieldButton"
                onClick={() =>
                  addField("", {
                    type: "object",
                  })
                }
              >
                Add new object
              </EuiSmallButton>
            </>
          )}
        </>
      ) : (
        <>
          {isEdit && !readonly && !isEmpty(oldValue) ? (
            <>
              <EuiButton
                size="s"
                data-test-subj="previousMappingsJsonButton"
                onClick={() => {
                  Modal.show({
                    style: {
                      width: "70vw",
                    },
                    title: "Previous mappings",
                    content: (
                      <MonacoJSONEditor
                        readOnly
                        value={JSON.stringify(
                          {
                            ...oldValue,
                            properties: transformArrayToObject(oldValue?.properties || []),
                          },
                          null,
                          2
                        )}
                      />
                    ),
                    "data-test-subj": "previousMappingsJsonModal",
                    onOk: () => {},
                  });
                }}
              >
                See previous mappings
              </EuiButton>
              <EuiSpacer />
            </>
          ) : null}
          {readonly ? (
            <MonacoJSONEditor
              ref={JSONEditorRef}
              value={JSON.stringify(
                {
                  ...propsValue,
                  properties: transformArrayToObject(value || []),
                },
                null,
                2
              )}
              disabled={readonly}
              readOnly={readonly}
              width="100%"
            />
          ) : (
            <CustomFormRow
              data-test-subj="mappingsJsonEditorFormRow"
              label="Specify index mapping"
              helpText={
                <>
                  Specify mapping in JSON format.{" "}
                  <EuiLink
                    external
                    target="_blank"
                    href={`https://opensearch.org/docs/${docVersion}/opensearch/mappings/#mapping-example-usage`}
                  >
                    View mapping example.
                  </EuiLink>
                </>
              }
              fullWidth
            >
              <MonacoJSONEditor
                value={JSON.stringify(
                  {
                    ...propsValue,
                    properties: transformArrayToObject(newValue || []),
                  },
                  null,
                  2
                )}
                onChange={(val) => {
                  const result: IndexMappingsObjectAll = JSON.parse(val);
                  propsOnChange({
                    ...result,
                    properties: [...(oldValue?.properties || []), ...transformObjectToArray(result?.properties || {})],
                  });
                }}
                path={`index-mappings-${Date.now()}.json`}
                diagnosticsOptions={{
                  validate: true,
                  schemas: [
                    {
                      fileMatch: ["index-mappings-*.json"],
                      schema: {
                        title: "Index mappings",
                        description: "Index mappings",
                        type: "object",
                        properties: {
                          properties: {
                            $ref: schemaId,
                          },
                        },
                      },
                      uri: "ISMIndexMappings",
                    },
                    {
                      schema: IndexMappingsJSONEditorSchema,
                      uri: schemaId,
                    },
                  ],
                }}
                width="100%"
                ref={JSONEditorRef}
              />
            </CustomFormRow>
          )}
        </>
      )}
    </>
  );
};

export default forwardRef(IndexMapping);
