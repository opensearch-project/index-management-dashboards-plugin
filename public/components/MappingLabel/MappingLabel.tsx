/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { forwardRef, useCallback, useRef, useImperativeHandle } from "react";
import {
  EuiIcon,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiToolTip,
  EuiBadge,
  EuiText,
  EuiContextMenu,
  EuiFormRowProps,
} from "@elastic/eui";
import { set, pick, isEqual } from "lodash";
import { MappingsProperties } from "../../../models/interfaces";
import { AllBuiltInComponents } from "../FormGenerator";
import useField, { transformNameToString } from "../../lib/field";
import { INDEX_MAPPING_TYPES, INDEX_MAPPING_TYPES_WITH_CHILDREN } from "../../utils/constants";
import SimplePopover from "../SimplePopover";
import { useEffect } from "react";

interface IMappingLabel {
  value: MappingsProperties[number];
  onChange: (val: IMappingLabel["value"], key: string, value: string) => void | string;
  onFieldNameCheck: (val: string) => string;
  onAddSubField: () => void;
  onAddSubObject: () => void;
  onDeleteField: () => void;
  readonly?: boolean;
  id: string;
  shouldShowLabel?: boolean;
}

export interface IMappingLabelRef {
  validate: () => Promise<string>;
}

const FormRow = (props: EuiFormRowProps & Pick<IMappingLabel, "shouldShowLabel">) => {
  const { shouldShowLabel, label, ...others } = props;
  return <EuiFormRow {...others} label={shouldShowLabel ? label : undefined} />;
};

export const MappingLabel = forwardRef((props: IMappingLabel, forwardedRef: React.Ref<IMappingLabelRef>) => {
  const { onFieldNameCheck, onAddSubField, onAddSubObject, onDeleteField, id, readonly, shouldShowLabel } = props;
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
              [transformNameToString(current.name)]: current.initValue,
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
  useEffect(() => {
    if (!isEqual(propsRef.current.value, field.getValues())) {
      field.resetValues(propsRef.current.value);
    }
  }, [propsRef.current.value]);
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

  if (readonly) {
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
            <EuiBadge key={transformNameToString(extraField.name)} color="hollow" title={field.getValue(extraField.name)}>
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
        <FormRow
          shouldShowLabel={shouldShowLabel}
          isInvalid={!!field.getError("fieldName")}
          error={field.getError("fieldName")}
          label="Field name"
          display="rowCompressed"
        >
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
            compressed
            data-test-subj={`${id}-field-name`}
          />
        </FormRow>
      </EuiFlexItem>
      <EuiFlexItem grow={false} style={{ width: 100 }}>
        <FormRow shouldShowLabel={shouldShowLabel} label="Field type" display="rowCompressed">
          <AllBuiltInComponents.Select
            compressed
            {...field.registerField({
              name: "type",
            })}
            data-test-subj={`${id}-field-type`}
            options={(() => {
              const allOptions = INDEX_MAPPING_TYPES.map((item) => ({ text: item.label, value: item.label }));
              const typeValue = field.getValue("type");
              if (!allOptions.find((item) => item.value === typeValue)) {
                allOptions.push({
                  text: typeValue,
                  value: typeValue,
                });
              }
              return allOptions;
            })()}
          />
        </FormRow>
      </EuiFlexItem>
      {moreFields.map((item) => {
        const { label, type, ...others } = item;
        const RenderComponent = AllBuiltInComponents[type];
        return (
          <EuiFlexItem grow={false} key={transformNameToString(others.name)} style={{ width: 100 }}>
            <EuiFormRow label={label} display="rowCompressed" isInvalid={!!field.getError(others.name)} error={field.getError(others.name)}>
              <RenderComponent {...field.registerField(others)} compressed />
            </EuiFormRow>
          </EuiFlexItem>
        );
      })}
      {readonly ? null : (
        <EuiFlexItem grow={false}>
          <FormRow shouldShowLabel={shouldShowLabel} label="Actions" display="rowCompressed">
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
          </FormRow>
        </EuiFlexItem>
      )}
    </EuiFlexGroup>
  );
});

export default MappingLabel;
