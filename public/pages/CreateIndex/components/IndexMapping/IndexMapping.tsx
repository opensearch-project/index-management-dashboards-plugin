/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { forwardRef, useCallback, useState, Ref, useRef, useMemo, useImperativeHandle } from "react";
import {
  EuiTreeView,
  EuiIcon,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiTreeViewProps,
  EuiButton,
  EuiSpacer,
  EuiButtonGroup,
  EuiToolTip,
  EuiCode,
  EuiBadge,
  EuiText,
  EuiContextMenu,
} from "@elastic/eui";
import { set, get, pick } from "lodash";
import JSONEditor from "../../../../components/JSONEditor";
import JSONDiffEditor from "../../../../components/JSONDiffEditor";
import { AllBuiltInComponents } from "../../../../components/FormGenerator";
import useField from "../../../../lib/field";
import { Modal } from "../../../../components/Modal";
import { MappingsProperties, MappingsPropertiesObject } from "../../../../../models/interfaces";
import { INDEX_MAPPING_TYPES, INDEX_MAPPING_TYPES_WITH_CHILDREN } from "../../../../utils/constants";
import "./IndexMapping.scss";
import SimplePopover from "../../../../components/SimplePopover";

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

const countNodesInTree = (array: MappingsProperties) => {
  return array.reduce((total, current) => {
    total = total + 1;
    const { properties } = current;
    if (properties) {
      total = total + countNodesInTree(properties);
    }
    return total;
  }, 0);
};

export interface IndexMappingProps {
  value?: MappingsProperties;
  oldValue?: MappingsProperties;
  onChange: (value: IndexMappingProps["value"]) => void;
  isEdit?: boolean;
  readonly?: boolean;
}

export interface IIndexMappingsRef {
  validate: () => Promise<string>;
}

export enum EDITOR_MODE {
  JSON = "JSON",
  VISUAL = "VISUAL",
}

interface IMappingLabel {
  value: MappingsProperties[number];
  onChange: (val: IMappingLabel["value"], key: string, value: string) => void | string;
  onFieldNameCheck: (val: string) => string;
  onAddSubField: () => void;
  onAddSubObject: () => void;
  onDeleteField: () => void;
  disabled?: boolean;
  readonly?: boolean;
  id: string;
}

const OLD_VALUE_DISABLED_REASON = "Old mappings can not be modified";

const MappingLabel = forwardRef((props: IMappingLabel, forwardedRef: React.Ref<IIndexMappingsRef>) => {
  const { onFieldNameCheck, disabled, onAddSubField, onAddSubObject, onDeleteField, id, readonly } = props;
  const propsRef = useRef(props);
  propsRef.current = props;
  const onFieldChange = useCallback(
    (k, v) => {
      let newValue = { ...propsRef.current.value };
      set(newValue, k, v);
      if (k === "type") {
        newValue = pick(newValue, ["fieldName", "type"]);
        const findItem = INDEX_MAPPING_TYPES.find((item) => item.label === v);
        const initValues = (findItem?.options?.fields || []).reduce((total, current) => {
          if (current && current.initValue !== undefined) {
            return {
              ...total,
              [current.name]: current.initValue,
            };
          }

          return total;
        }, {});
        newValue = {
          ...newValue,
          ...initValues,
        };
        field.setValues(newValue);
      }
      return propsRef.current.onChange(newValue, k, v);
    },
    [propsRef.current.value, propsRef.current.onChange]
  );
  const field = useField({
    values: {
      ...propsRef.current.value,
      type: propsRef.current.value.type || "object",
    },
    onChange: onFieldChange,
    unmountComponent: true,
  });
  const value = field.getValues();
  const type = value.type;
  useImperativeHandle(forwardedRef, () => ({
    validate: async () => {
      const { errors } = await field.validatePromise();
      if (errors) {
        return "Validate Error";
      } else {
        return "";
      }
    },
  }));

  const findItem = INDEX_MAPPING_TYPES.find((item) => item.label === type);
  const moreFields = findItem?.options?.fields || [];

  if (readonly || disabled) {
    return (
      <EuiText>
        <li className="ism-index-mappings-field-line">
          <EuiIcon type="dot" size="s" />
          <span data-test-subj={`${id}-field-name`} title={field.getValue("fieldName")}>
            {field.getValue("fieldName")}
          </span>
          <EuiBadge color="hollow" title={type} data-test-subj={`${id}-field-type`}>
            {type}
          </EuiBadge>
          {moreFields.map((extraField) => (
            <EuiBadge key={extraField.name} color="hollow" title={field.getValue(extraField.name)}>
              {extraField.label}: {field.getValue(extraField.name)}
            </EuiBadge>
          ))}
        </li>
      </EuiText>
    );
  }

  return (
    <EuiFlexGroup onClick={(e) => e.stopPropagation()}>
      <EuiFlexItem grow={false} style={{ width: 300 }}>
        <EuiFormRow
          isInvalid={!!field.getError("fieldName")}
          error={field.getError("fieldName")}
          label="Field name"
          display="rowCompressed"
        >
          {readonly ? (
            <EuiCode>{field.getValue("fieldName")}</EuiCode>
          ) : (
            <AllBuiltInComponents.Input
              {...field.registerField({
                name: "fieldName",
                rules: [
                  {
                    required: true,
                    message: "Field name is required, please input",
                  },
                  {
                    validator: (rule, value) => {
                      const checkResult = onFieldNameCheck(value);
                      if (checkResult) {
                        return Promise.reject(checkResult);
                      }

                      return Promise.resolve("");
                    },
                  },
                ],
              })}
              disabled={readonly || disabled}
              disabledReason={readonly ? "" : OLD_VALUE_DISABLED_REASON}
              compressed
              data-test-subj={`${id}-field-name`}
            />
          )}
        </EuiFormRow>
      </EuiFlexItem>
      <EuiFlexItem grow={false} style={{ width: 100 }}>
        <EuiFormRow label="Field type" display="rowCompressed">
          {readonly ? (
            <EuiCode>{type}</EuiCode>
          ) : (
            <AllBuiltInComponents.Select
              disabled={readonly || disabled}
              disabledReason={readonly ? "" : OLD_VALUE_DISABLED_REASON}
              compressed
              {...field.registerField({
                name: "type",
              })}
              data-test-subj={`${id}-field-type`}
              options={INDEX_MAPPING_TYPES.map((item) => ({ text: item.label, value: item.label }))}
            />
          )}
        </EuiFormRow>
      </EuiFlexItem>
      {moreFields.map((item) => {
        const { label, type, ...others } = item;
        const RenderComponent = readonly ? AllBuiltInComponents.Text : AllBuiltInComponents[type];
        return (
          <EuiFlexItem grow={false} key={others.name} style={{ width: 100 }}>
            <EuiFormRow label={label} display="rowCompressed" isInvalid={!!field.getError(others.name)} error={field.getError(others.name)}>
              <RenderComponent
                {...field.registerField(others)}
                disabled={readonly || disabled}
                disabledReason={readonly ? "" : OLD_VALUE_DISABLED_REASON}
                compressed
              />
            </EuiFormRow>
          </EuiFlexItem>
        );
      })}
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
                <SimplePopover
                  triggerType="hover"
                  panelPaddingSize="none"
                  button={
                    <span
                      className="euiButtonIcon euiButtonIcon--primary euiButtonIcon--empty euiButtonIcon--medium"
                      data-test-subj={`${id}-add-sub-field`}
                      aria-label="Delete current field"
                      onClick={onAddSubField}
                    >
                      <EuiIcon type="plusInCircleFilled" />
                    </span>
                  }
                >
                  <EuiContextMenu
                    initialPanelId={0}
                    panels={[
                      {
                        id: 0,
                        title: "",
                        items: [
                          {
                            name: "Add nested field",
                            onClick: onAddSubField,
                          },
                          {
                            name: "Add nested object",
                            onClick: onAddSubObject,
                          },
                        ],
                      },
                    ]}
                  />
                </SimplePopover>
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
});

const IndexMapping = ({ value, onChange, isEdit, oldValue, readonly }: IndexMappingProps, ref: Ref<IIndexMappingsRef>) => {
  const allFieldsRef = useRef<Record<string, IIndexMappingsRef>>({});
  useImperativeHandle(ref, () => ({
    validate: async () => {
      const values = await Promise.all(Object.values(allFieldsRef.current).map((item) => item.validate()));
      return values.some((item) => item) ? "with error" : "";
    },
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
  const transformValueToTreeItems = (formValue: IndexMappingProps["value"], pos: string = ""): EuiTreeViewProps["items"] => {
    return (formValue || []).map((item, index) => {
      const { fieldName, ...fieldSettings } = item;
      const id = [pos, index].filter((item) => item !== "").join(".properties.");
      const payload: EuiTreeViewProps["items"][number] = {
        label: (
          <MappingLabel
            ref={(ref) => {
              if (ref) {
                allFieldsRef.current[id] = ref;
              } else {
                delete allFieldsRef.current[id];
              }
            }}
            readonly={readonly}
            disabled={isEdit && !!get(oldValue, id)}
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
                type: "",
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
    const oldValueKeys = (oldValue || []).map((item) => item.fieldName);
    return value?.filter((item) => !oldValueKeys.includes(item.fieldName)) || [];
  }, [oldValue, value]);
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
              key={renderKey}
              expandByDefault={!readonly}
              className="index-mapping-tree"
              aria-labelledby="label"
              items={transformValueToTreeItems(value)}
            />
          ) : (
            <p>You have no field mappings.</p>
          )}
          {readonly ? null : (
            <>
              <EuiSpacer />
              <EuiButton style={{ marginRight: 8 }} data-test-subj="createIndexAddFieldButton" onClick={() => addField("")}>
                Add new field
              </EuiButton>
              <EuiButton
                data-test-subj="createIndexAddObjectFieldButton"
                onClick={() =>
                  addField("", {
                    type: "",
                  })
                }
              >
                Add new object
              </EuiButton>
            </>
          )}
        </>
      ) : (
        <>
          {isEdit && !readonly ? (
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
          {readonly ? (
            <JSONEditor value={JSON.stringify(transformArrayToObject(oldValue || []), null, 2)} readOnly={readonly} />
          ) : (
            <JSONDiffEditor
              original={JSON.stringify({}, null, 2)}
              value={JSON.stringify(transformArrayToObject(newValue || []), null, 2)}
              onChange={(val) => onChange([...(oldValue || []), ...transformObjectToArray(JSON.parse(val))])}
            />
          )}
        </>
      )}
    </>
  );
};

// @ts-ignore
export default forwardRef(IndexMapping);
