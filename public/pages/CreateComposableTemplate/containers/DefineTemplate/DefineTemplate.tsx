import React, { useCallback, useContext } from "react";
import { EuiFlexGroup, EuiHorizontalRule, EuiPanel, EuiSpacer, EuiText } from "@elastic/eui";
import { SubDetailProps } from "../../interface";
import { ContentPanel } from "../../../../components/ContentPanel";
import CustomFormRow from "../../../../components/CustomFormRow";
import { AllBuiltInComponents } from "../../../../components/FormGenerator";
import { TEMPLATE_NAMING_MESSAGE, TEMPLATE_NAMING_PATTERN } from "../../../../utils/constants";
import { getCommonFormRowProps, getTemplate } from "../../hooks";
import { BrowserServices } from "../../../../models/interfaces";
import { ServicesContext } from "../../../../services";

function debouncePromise<T extends (...args: any) => any>(func: T, wait: number) {
  let timestamp: number;
  return function (...rest: any): ReturnType<T> {
    return new Promise((resolve, reject) => {
      timestamp = Date.now();
      const funcTimestamp = timestamp;
      setTimeout(() => {
        if (funcTimestamp === timestamp) {
          func.apply(null, rest).then(resolve, reject);
        }
      }, wait);
    }) as ReturnType<T>;
  };
}

export default function DefineTemplate(props: SubDetailProps) {
  const { field, isEdit, noPanel } = props;
  const services = useContext(ServicesContext) as BrowserServices;
  const Component = isEdit ? AllBuiltInComponents.Text : AllBuiltInComponents.Input;
  const validateRemoteComponentName = useCallback(
    debouncePromise(async (rule, value): Promise<string> => {
      if (!value || isEdit) {
        return Promise.resolve("");
      }
      try {
        const templateResult = await getTemplate({
          commonService: services.commonService,
          templateName: value,
        });
        if (templateResult) {
          return Promise.reject(`The component template ${value} already exists, please change the name.`);
        }
      } catch (e) {
        return Promise.resolve("");
      }

      return Promise.resolve("");
    }, 500),
    []
  );
  const content = (
    <>
      {isEdit ? null : (
        <>
          <CustomFormRow
            {...getCommonFormRowProps("name", field)}
            label={
              <EuiText size="s">
                <h3>Name</h3>
              </EuiText>
            }
            helpText={<div>Name cannot be changed after the component template is created.</div>}
          >
            <Component
              {...field.registerField({
                name: "name",
                rules: [
                  {
                    pattern: TEMPLATE_NAMING_PATTERN,
                    message: "Invalid template name.",
                  },
                  {
                    validator: validateRemoteComponentName,
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
        {...getCommonFormRowProps(["_meta", "description"], field)}
        label={
          <EuiText size="s">
            <h3>
              Description - <i>optional</i>
            </h3>
          </EuiText>
        }
        helpText="Describe the purpose or contents to help you identify this component."
        direction={isEdit ? "hoz" : "ver"}
      >
        <AllBuiltInComponents.Input
          {...field.registerField({
            name: ["_meta", "description"],
          })}
        />
      </CustomFormRow>
    </>
  );
  if (noPanel) {
    return content;
  }

  return (
    <EuiPanel>
      <EuiFlexGroup gutterSize="xs" alignItems="center">
        <EuiText size="s">
          <h2>{`Define component template`}</h2>
        </EuiText>
      </EuiFlexGroup>
      <EuiHorizontalRule margin={"xs"} />
      {content}
    </EuiPanel>
  );
}
