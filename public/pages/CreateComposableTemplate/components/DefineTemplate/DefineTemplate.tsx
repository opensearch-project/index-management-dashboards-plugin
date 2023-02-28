import React from "react";
import { EuiSpacer } from "@elastic/eui";
import { SubDetailProps } from "../../interface";
import { ContentPanel } from "../../../../components/ContentPanel";
import CustomFormRow from "../../../../components/CustomFormRow";
import { AllBuiltInComponents } from "../../../../components/FormGenerator";
import DescriptionListHoz from "../../../../components/DescriptionListHoz";
import { IndicesUpdateMode, TEMPLATE_NAMING_MESSAGE, TEMPLATE_NAMING_PATTERN } from "../../../../utils/constants";
import { getCommonFormRowProps } from "../../hooks";
import { IComposableTemplate } from "../../../../../models/interfaces";

export default function DefineTemplate(props: SubDetailProps) {
  const { readonly, field, isEdit } = props;
  const values: IComposableTemplate & { name: string } = field.getValues();
  const Component = isEdit ? AllBuiltInComponents.Text : AllBuiltInComponents.Input;
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
            title: "Descriptions",
            description: values._meta?.description || "-",
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
      <CustomFormRow {...getCommonFormRowProps(["_meta", "description"], field)} label="Descriptions" position="bottom">
        <AllBuiltInComponents.Input
          {...field.registerField({
            name: ["_meta", "description"],
          })}
        />
      </CustomFormRow>
      <EuiSpacer />
      <CustomFormRow {...getCommonFormRowProps(["includes", IndicesUpdateMode.alias], field)} label="Includes">
        <>
          <AllBuiltInComponents.CheckBox
            label="Index alias"
            {...field.registerField({
              name: ["includes", IndicesUpdateMode.alias],
            })}
          />
          <AllBuiltInComponents.CheckBox
            label="Index settings"
            {...field.registerField({
              name: ["includes", IndicesUpdateMode.settings],
            })}
          />
          <AllBuiltInComponents.CheckBox
            label="Index mappings"
            {...field.registerField({
              name: ["includes", IndicesUpdateMode.mappings],
            })}
          />
        </>
      </CustomFormRow>
    </ContentPanel>
  );
}
