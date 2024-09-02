/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import React from "react";
import {
  EuiCallOut,
  EuiCheckableCard,
  EuiFlexGroup,
  EuiFlexItem,
  EuiPanel,
  EuiSpacer,
  EuiText,
  EuiTextColor,
  EuiHorizontalRule,
} from "@elastic/eui";
import { FLOW_ENUM, SubDetailProps } from "../../interface";
import CustomFormRow from "../../../../components/CustomFormRow";
import { AllBuiltInComponents } from "../../../../components/FormGenerator";
import RemoteSelect from "../../../../components/RemoteSelect";
import { TEMPLATE_NAMING_MESSAGE, TEMPLATE_NAMING_PATTERN } from "../../../../utils/constants";
import TemplateType from "../TemplateType";
import { getCommonFormRowProps } from "../../hooks";
import { filterByMinimatch } from "../../../../../utils/helper";
import { TemplateItem } from "../../../../../models/interfaces";

export default function DefineTemplate(props: SubDetailProps) {
  const { readonly, field, isEdit } = props;
  const values: TemplateItem = field.getValues();
  const Component = isEdit ? AllBuiltInComponents.Text : AllBuiltInComponents.Input;
  const matchSystemIndex = filterByMinimatch(".kibana", values.index_patterns || []);
  const registeredFlowField = field.registerField({
    name: ["_meta", "flow"],
  });
  return readonly ? null : (
    <EuiPanel>
      <EuiText size="s">
        <h2>Template settings</h2>
      </EuiText>
      <EuiHorizontalRule margin="xs" />
      <EuiSpacer size="s" />
      {isEdit ? null : (
        <>
          <CustomFormRow
            {...getCommonFormRowProps("name", field)}
            label={
              <EuiText size="s">
                <h3>Template name</h3>
              </EuiText>
            }
            direction="ver"
            helpText={<div>Template name cannot be changed after the template is created.</div>}
          >
            <Component
              {...field.registerField({
                name: "name",
                rules: [
                  {
                    pattern: TEMPLATE_NAMING_PATTERN,
                    message: "Invalid template name.",
                  },
                ],
              })}
            />
          </CustomFormRow>
          <CustomFormRow helpText={<div>{TEMPLATE_NAMING_MESSAGE}</div>}>
            <></>
          </CustomFormRow>
          <EuiSpacer />
        </>
      )}
      <CustomFormRow
        direction={isEdit ? "hoz" : "ver"}
        {...getCommonFormRowProps("data_stream", field)}
        label={
          <EuiText size="s">
            <h3>Template type</h3>
          </EuiText>
        }
      >
        <TemplateType
          {...field.registerField({
            name: "data_stream",
          })}
        />
      </CustomFormRow>
      <EuiSpacer />
      <CustomFormRow
        {...getCommonFormRowProps("index_patterns", field)}
        label={
          <EuiText size="s">
            <h3>Index patterns</h3>
          </EuiText>
        }
        direction={isEdit ? "hoz" : "ver"}
        helpText="Specify the index patterns or wildcards. Add a comma to separate each value. Settings in this template will be applied to indexes with names matching index patterns or wildcards."
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

                  return Promise.resolve("");
                },
              },
            ],
          })}
          delimiter=","
          noSuggestions
          async={false}
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
      {matchSystemIndex ? (
        <>
          <CustomFormRow>
            <EuiCallOut color="warning" title="Index patterns may contain system indexes">
              This template may apply to new system indexes and may affect your ability to access OpenSearch. We recommend narrowing your
              index patterns.
            </EuiCallOut>
          </CustomFormRow>
          <EuiSpacer />
        </>
      ) : null}
      <CustomFormRow
        direction={isEdit ? "hoz" : "ver"}
        {...getCommonFormRowProps("priority", field)}
        label={
          <EuiText size="s">
            <h3>Priority</h3>
          </EuiText>
        }
        helpText="Specify the priority of this template. If the index name matches more than one template, the template with the highest priority will be applied to the index."
      >
        <AllBuiltInComponents.Number
          {...field.registerField({
            name: "priority",
            rules: [
              {
                min: 0,
                message: "Priority cannot be smaller than 0.",
              },
              {
                validator(rule, value) {
                  if (Number(value) !== parseInt(value)) {
                    return Promise.reject("Priority must be an integer.");
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
        {...getCommonFormRowProps(["_meta", "flow"], field)}
        fullWidth
        label={
          <EuiText size="s">
            <h3>Choose a method to define your templates</h3>
          </EuiText>
        }
      >
        <EuiFlexGroup>
          <EuiFlexItem style={{ width: 350 }} grow={false}>
            <EuiCheckableCard
              className="eui-fullHeight"
              label={
                <>
                  <div className="euiCheckableCard__label" style={{ paddingRight: 0 }}>
                    <EuiText size="s">
                      <h4>Simple template</h4>
                    </EuiText>
                  </div>
                  <EuiText size="xs" className="euiCheckableCard__children">
                    <EuiTextColor color="subdued">Define an index template with index aliases, settings, and mappings.</EuiTextColor>
                  </EuiText>
                </>
              }
              id="checkboxForIndexTemplateFlowSimple"
              onChange={() => {
                registeredFlowField.onChange(FLOW_ENUM.SIMPLE);
              }}
              checked={registeredFlowField.value === FLOW_ENUM.SIMPLE}
            />
          </EuiFlexItem>
          <EuiFlexItem style={{ width: 350 }} grow={false}>
            <EuiCheckableCard
              className="eui-fullHeight"
              label={
                <>
                  <div className="euiCheckableCard__label" style={{ paddingRight: 0 }}>
                    <EuiText size="s">
                      <h4>Component template</h4>
                    </EuiText>
                  </div>
                  <EuiText size="xs" className="euiCheckableCard__children">
                    <EuiTextColor color="subdued">
                      Define an index template by associating component templates containing index configurations.
                    </EuiTextColor>
                  </EuiText>
                </>
              }
              id="checkboxForIndexTemplateFlowComponents"
              onChange={() => registeredFlowField.onChange(FLOW_ENUM.COMPONENTS)}
              checked={registeredFlowField.value === FLOW_ENUM.COMPONENTS}
            />
          </EuiFlexItem>
        </EuiFlexGroup>
      </CustomFormRow>
    </EuiPanel>
  );
}
