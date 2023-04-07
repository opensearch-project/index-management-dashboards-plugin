/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import React from "react";
import { EuiCallOut, EuiCheckableCard, EuiFlexGroup, EuiFlexItem, EuiLink, EuiSpacer, EuiText, EuiTextColor } from "@elastic/eui";
import { FLOW_ENUM, SubDetailProps } from "../../interface";
import { ContentPanel } from "../../../../components/ContentPanel";
import CustomFormRow from "../../../../components/CustomFormRow";
import { AllBuiltInComponents } from "../../../../components/FormGenerator";
import RemoteSelect from "../../../../components/RemoteSelect";
import DescriptionListHoz from "../../../../components/DescriptionListHoz";
import { ROUTES, TEMPLATE_NAMING_MESSAGE, TEMPLATE_NAMING_PATTERN } from "../../../../utils/constants";
import TemplateType, { TemplateConvert } from "../TemplateType";
import { getCommonFormRowProps } from "../../hooks";
import { filterByMinimatch } from "../../../../../utils/helper";
import { TemplateItem } from "../../../../../models/interfaces";

export default function DefineTemplate(props: SubDetailProps) {
  const { readonly, field, isEdit, withoutPanel, columns } = props;
  const values: TemplateItem = field.getValues();
  const Component = isEdit ? AllBuiltInComponents.Text : AllBuiltInComponents.Input;
  const matchSystemIndex = filterByMinimatch(".kibana", values.index_patterns || []);
  const content = (
    <>
      <EuiSpacer size="s" />
      <DescriptionListHoz
        columns={columns}
        listItems={[
          {
            title: "Template type",
            description: TemplateConvert({
              value: values.data_stream,
            }),
          },
          {
            title: "Index patterns",
            description: values.index_patterns?.join(", "),
          },
          {
            title: "Priority",
            description: values.priority,
          },
          {
            title: "Associated component templates",
            description: (values.composed_of || []).length
              ? (values.composed_of || []).map((item) => (
                  <div key={item}>
                    <EuiLink external={false} target="_blank" href={`#${ROUTES.CREATE_COMPOSABLE_TEMPLATE}/${item}`}>
                      {item}
                    </EuiLink>
                  </div>
                ))
              : "-",
          },
        ]}
      />
    </>
  );
  const registeredFlowField = field.registerField({
    name: ["_meta", "flow"],
  });
  return readonly ? (
    withoutPanel ? (
      content
    ) : (
      <ContentPanel title="Overview" titleSize="s">
        {content}
      </ContentPanel>
    )
  ) : (
    <ContentPanel title="Template settings" titleSize="s">
      <EuiSpacer size="s" />
      {isEdit ? null : (
        <>
          <CustomFormRow
            {...getCommonFormRowProps("name", field)}
            label="Template name"
            direction={isEdit ? "hoz" : "ver"}
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
      <CustomFormRow direction={isEdit ? "hoz" : "ver"} {...getCommonFormRowProps("data_stream", field)} label="Template type">
        <TemplateType
          {...field.registerField({
            name: "data_stream",
          })}
        />
      </CustomFormRow>
      <EuiSpacer />
      <CustomFormRow
        {...getCommonFormRowProps("index_patterns", field)}
        label="Index patterns"
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

                  return Promise.reject("");
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
        label="Priority"
        helpText="Specify the priority of this template. If the index name matches more than one template, the template with the highest priority will be applied to the index"
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
      <CustomFormRow {...getCommonFormRowProps(["_meta", "flow"], field)} fullWidth label="Choose a method to define your template">
        <EuiFlexGroup>
          <EuiFlexItem style={{ width: 350 }} grow={false}>
            <EuiCheckableCard
              className="eui-fullHeight"
              label={
                <>
                  <div className="euiCheckableCard__label" style={{ paddingRight: 0 }}>
                    Simple template
                  </div>
                  <EuiText size="xs" className="euiCheckableCard__children">
                    <EuiTextColor color="subdued">Define an index template with index alias, settings, mappings.</EuiTextColor>
                  </EuiText>
                </>
              }
              id="checkboxForIndexTemplateFlowSimple"
              onChange={() => registeredFlowField.onChange(FLOW_ENUM.SIMPLE)}
              checked={registeredFlowField.value === FLOW_ENUM.SIMPLE}
            />
          </EuiFlexItem>
          <EuiFlexItem style={{ width: 350 }} grow={false}>
            <EuiCheckableCard
              className="eui-fullHeight"
              label={
                <>
                  <div className="euiCheckableCard__label" style={{ paddingRight: 0 }}>
                    Component template
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
    </ContentPanel>
  );
}
