/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { forwardRef, useCallback, useState, Ref, useEffect, useRef, useMemo } from "react";
import {
  EuiTreeView,
  EuiIcon,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiFieldText,
  EuiSelect,
  EuiTreeViewProps,
  EuiButton,
  EuiSpacer,
  EuiButtonGroup,
  EuiToolTip,
  EuiButtonIcon,
} from "@elastic/eui";
import { set, get } from "lodash";
import JSONEditor from "../../../../components/JSONEditor";
import { Modal } from "../../../../components/Modal";
import { MappingsProperties, MappingsPropertiesObject } from "../../../../../models/interfaces";
import { INDEX_MAPPING_TYPES, INDEX_MAPPING_TYPES_WITH_CHILDREN } from "../../../../utils/constants";
import "./IndexMapping.scss";

export interface IndexMappingProps {
  value?: MappingsProperties;
  oldValue?: MappingsProperties;
  onChange: (value: IndexMappingProps["value"]) => void;
  isEdit?: boolean;
}

export interface IIndexDetailRef {
  validate: () => Promise<Boolean>;
}

export enum EDITOR_MODE {
  JSON = "JSON",
  VISUAL = "VISUAL",
}

interface IMappingLabel {
  value: MappingsProperties[number];
  onChange: (val: IMappingLabel["value"], key: string, value: string) => void | string;
  // onFieldNameChange: (newFieldName: string, oldFieldName: string) => void;
  onAddSubField: () => void;
  onDeleteField: () => void;
  disabled?: boolean;
  id: string;
}

const NEW_FIELD_PREFIX = "NAME_YOUR_FIELD";

const MappingLabel = ({ value, onChange, disabled, onAddSubField, onDeleteField, id }: IMappingLabel) => {
  const { fieldName, ...fieldSettings } = value;
  const [fieldNameError, setFieldNameError] = useState("");
  const ref = useRef<any>(null);
  const type = fieldSettings.type ? fieldSettings.type : "object";
  const onFieldChange = useCallback(
    (k, v) => {
      const newValue = { ...value };
      set(newValue, k, v);
      return onChange(newValue, k, v);
    },
    [value, onChange]
  );
  const [fieldNameState, setFieldNameState] = useState(fieldName);
  useEffect(() => {
    setFieldNameState(fieldNameState);
  }, [fieldName]);
  useEffect(() => {
    if (fieldNameState) {
      setFieldNameError("");
    }
  }, [fieldNameState]);
  return (
    <EuiFlexGroup onClick={(e) => e.stopPropagation()}>
      <EuiFlexItem style={{ width: 240 }} grow={false}>
        <EuiFormRow isInvalid={!!fieldNameError} error={fieldNameError} label="Field name" display="rowCompressed">
          <>
            <EuiFieldText
              inputRef={ref}
              disabled={disabled}
              compressed
              data-test-subj={`${id}-field-name`}
              value={fieldNameState}
              onChange={(e) => setFieldNameState(e.target.value)}
              onFocus={() => {
                if (fieldNameState && fieldNameState.startsWith(NEW_FIELD_PREFIX)) {
                  setFieldNameState("");
                }
              }}
              onBlur={(e) => {
                if (!fieldNameState) {
                  setFieldNameError("Field name is required, please input");
                  ref.current.focus();
                } else {
                  const error = onFieldChange("fieldName", fieldNameState);
                  if (error) {
                    setFieldNameError(error);
                    ref.current.focus();
                  }
                }
              }}
            />
          </>
        </EuiFormRow>
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <EuiFormRow label="Field type" display="rowCompressed">
          <EuiSelect
            disabled={disabled}
            compressed
            value={type}
            data-test-subj={`${id}-field-type`}
            onChange={(e) => onFieldChange("type", e.target.value)}
            options={INDEX_MAPPING_TYPES.map((item) => ({ text: item.label, value: item.label }))}
          />
        </EuiFormRow>
      </EuiFlexItem>
      {disabled ? null : (
        <EuiFlexItem grow={false}>
          <EuiFormRow label="actions" display="rowCompressed">
            <div
              style={{ display: "flex", height: 32, alignItems: "center" }}
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              {INDEX_MAPPING_TYPES_WITH_CHILDREN.includes(type) ? (
                <EuiToolTip content="Add a sub field">
                  <span
                    className="euiButtonIcon euiButtonIcon--primary euiButtonIcon--empty euiButtonIcon--medium"
                    data-test-subj={`${id}-add-sub-field`}
                    aria-label="Delete current field"
                    onClick={onAddSubField}
                  >
                    <EuiIcon type="plusInCircleFilled" />
                  </span>
                </EuiToolTip>
              ) : null}
              <EuiToolTip content="Delete current field">
                <span
                  className="euiButtonIcon euiButtonIcon--danger euiButtonIcon--empty euiButtonIcon--medium"
                  data-test-subj={`${id}-delete-field`}
                  aria-label="Delete current field"
                  onClick={onDeleteField}
                >
                  <EuiIcon type="trash" />
                </span>
              </EuiToolTip>
            </div>
          </EuiFormRow>
        </EuiFlexItem>
      )}
    </EuiFlexGroup>
  );
};

const IndexMapping = ({ value, onChange, isEdit, oldValue }: IndexMappingProps, ref: Ref<IIndexDetailRef>) => {
  const [editorMode, setEditorMode] = useState<EDITOR_MODE>(EDITOR_MODE.VISUAL);
  const addField = useCallback(
    (pos, fieldName) => {
      const newValue = [...(value || [])];
      const nowProperties = ((pos ? get(newValue, pos) : (newValue as MappingsProperties)) || []) as MappingsProperties;
      nowProperties.push({
        fieldName,
        type: "text",
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
  const transformValueToTreeItems = (formValue: IndexMappingProps["value"], pos: string = ""): EuiTreeViewProps["items"] => {
    return (formValue || []).map((item, index) => {
      const { fieldName, ...fieldSettings } = item;
      const id = [pos, index].filter((item) => item !== "").join(".properties.");
      const payload: EuiTreeViewProps["items"][number] = {
        label: (
          <MappingLabel
            disabled={isEdit && !!get(oldValue, id)}
            value={item}
            id={`mapping-visual-editor-${id}`}
            onChange={(val, key, v) => {
              const newValue = [...(value || [])];
              if (key === "fieldName") {
                const hasDuplicateName = (formValue || [])
                  .filter((sibItem, sibIndex) => sibIndex !== index)
                  .some((sibItem) => sibItem.fieldName === v);
                if (hasDuplicateName) {
                  return `Duplicate field name [${v}], please change your field name`;
                }
              }
              set(newValue, id, val);
              onChange(newValue);
            }}
            onDeleteField={() => {
              deleteField(id);
            }}
            onAddSubField={() => {
              addField(`${id}.properties`, `${NEW_FIELD_PREFIX}-${Date.now()}`);
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
    const oldValueKeys = (oldValue || []).map((item) => item.fieldName);
    return value?.filter((item) => !oldValueKeys.includes(item.fieldName)) || [];
  }, [oldValue, value]);
  return (
    <>
      <EuiSpacer />
      <EuiButtonGroup
        type="single"
        idSelected={editorMode as string}
        onChange={(id) => setEditorMode(id as EDITOR_MODE)}
        legend="Editor Type"
        options={[
          {
            label: "Visual Editor",
            id: EDITOR_MODE.VISUAL,
            "data-test-subj": "editor-type-visual-editor",
          },
          {
            label: "JSON Editor",
            id: EDITOR_MODE.JSON,
            "data-test-subj": "editor-type-json-editor",
          },
        ]}
      />
      <EuiSpacer />
      {editorMode === EDITOR_MODE.VISUAL ? (
        <>
          {transformedTreeItems.length ? (
            <EuiTreeView
              key={JSON.stringify(value)}
              expandByDefault
              className="index-mapping-tree"
              aria-labelledby="label"
              items={transformValueToTreeItems(value)}
            />
          ) : (
            <p>You have no field mappings.</p>
          )}
          <EuiSpacer />
          <EuiButton data-test-subj="create index add field button" onClick={() => addField("", `${NEW_FIELD_PREFIX}-${Date.now()}`)}>
            Add a field
          </EuiButton>
        </>
      ) : (
        <>
          {isEdit ? (
            <>
              <EuiButton
                size="s"
                data-test-subj="previous-mappings-json-button"
                onClick={() => {
                  Modal.show({
                    title: "Previous mappings",
                    content: <JSONEditor readOnly value={JSON.stringify(transformArrayToObject(oldValue || []), null, 2)} />,
                    "data-test-subj": "previous-mappings-json-modal",
                    onOk: () => {},
                  });
                }}
              >
                See previous settings
              </EuiButton>
              <EuiSpacer />
            </>
          ) : null}
          <JSONEditor
            value={JSON.stringify(transformArrayToObject(newValue || []), null, 2)}
            onChange={(val) => onChange([...(oldValue || []), ...transformObjectToArray(JSON.parse(val))])}
          />
        </>
      )}
    </>
  );
};

// @ts-ignore
export default forwardRef(IndexMapping);

export const transformObjectToArray = (obj: MappingsPropertiesObject): MappingsProperties => {
  return Object.entries(obj).map(([fieldName, fieldSettings]) => {
    const { properties, ...others } = fieldSettings;
    const payload: MappingsProperties[number] = {
      ...others,
      fieldName,
    };
    if (properties) {
      payload.properties = transformObjectToArray(properties);
    }
    return payload;
  });
};

export const transformArrayToObject = (array: MappingsProperties): MappingsPropertiesObject => {
  return array.reduce((total, current) => {
    const { fieldName, properties, ...others } = current;
    const payload: MappingsPropertiesObject[string] = {
      ...others,
    };
    if (properties) {
      payload.properties = transformArrayToObject(properties);
    }
    return {
      ...total,
      [current.fieldName]: payload,
    };
  }, {} as MappingsPropertiesObject);
};
