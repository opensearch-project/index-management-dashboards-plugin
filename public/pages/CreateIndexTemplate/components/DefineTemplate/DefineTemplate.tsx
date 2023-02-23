/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import React from "react";
import { EuiCallOut, EuiSpacer } from "@elastic/eui";
import { SubDetailProps } from "../../interface";
import { ContentPanel } from "../../../../components/ContentPanel";
import CustomFormRow from "../../../../components/CustomFormRow";
import { AllBuiltInComponents } from "../../../../components/FormGenerator";
import RemoteSelect from "../../../../components/RemoteSelect";
import DescriptionListHoz from "../../../../components/DescriptionListHoz";
import { TEMPLATE_NAMING_MESSAGE, TEMPLATE_NAMING_PATTERN } from "../../../../utils/constants";
import TemplateType, { TemplateConvert } from "../TemplateType";
import { getCommonFormRowProps } from "../../hooks";
import { filterByMinimatch } from "../../../../../utils/helper";

export default function DefineTemplate(props: SubDetailProps) {
  const { readonly, field, isEdit } = props;
  const values = field.getValues();
  const Component = isEdit ? AllBuiltInComponents.Text : AllBuiltInComponents.Input;
  const matchSystemIndex = filterByMinimatch(".kibana", values.index_patterns || []);
  return readonly ? (
    <ContentPanel title="Template details" titleSize="s">
      <EuiSpacer size="s" />
      <DescriptionListHoz
        listItems={[
          {
            title: "Template name",
            description: values.name,
          },
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
        ]}
      />
    </ContentPanel>
  ) : (
    <ContentPanel title="Define template" titleSize="s">
      <EuiSpacer size="s" />
      <CustomFormRow
        {...getCommonFormRowProps("name", field)}
        label="Template name"
        position="bottom"
        helpText={
          <>
            <div>Template name cannot be changed after the template is created.</div>
            <div>{TEMPLATE_NAMING_MESSAGE}</div>
          </>
        }
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
      <EuiSpacer />
      <CustomFormRow {...getCommonFormRowProps("data_stream", field)} label="Template type">
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
    </ContentPanel>
  );
}
