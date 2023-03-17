import React from "react";
import { EuiSpacer } from "@elastic/eui";
import { SubDetailProps } from "../../interface";
import { ContentPanel } from "../../../../components/ContentPanel";
import CustomFormRow from "../../../../components/CustomFormRow";
import { AllBuiltInComponents } from "../../../../components/FormGenerator";
import { TEMPLATE_NAMING_MESSAGE, TEMPLATE_NAMING_PATTERN } from "../../../../utils/constants";
import { getCommonFormRowProps } from "../../hooks";

export default function DefineTemplate(props: SubDetailProps) {
  const { field, isEdit } = props;
  const Component = isEdit ? AllBuiltInComponents.Text : AllBuiltInComponents.Input;
  return (
    <ContentPanel title="Define template component" titleSize="s">
      <EuiSpacer size="s" />
      {isEdit ? null : (
        <>
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
        </>
      )}
      <CustomFormRow
        {...getCommonFormRowProps(["_meta", "description"], field)}
        label="Descriptions - optional"
        helpText="Describe the purpose or contents to help you identify this component."
        position="bottom"
        direction={isEdit ? "hoz" : "ver"}
      >
        <AllBuiltInComponents.Input
          {...field.registerField({
            name: ["_meta", "description"],
          })}
        />
      </CustomFormRow>
    </ContentPanel>
  );
}
