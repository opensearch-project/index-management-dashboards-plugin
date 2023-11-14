/*
 *   Copyright OpenSearch Contributors
 *
 *   Licensed under the Apache License, Version 2.0 (the "License").
 *   You may not use this file except in compliance with the License.
 *   A copy of the License is located at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   or in the "license" file accompanying this file. This file is distributed
 *   on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 *   express or implied. See the License for the specific language governing
 *   permissions and limitations under the License.
 */

import React, { useCallback, useContext } from "react";
import { EuiSpacer } from "@elastic/eui";
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
            label="Name"
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
          <div>
            Description - <i>optional</i>
          </div>
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
    <ContentPanel title="Define component template" titleSize="s">
      <EuiSpacer size="s" />
      {content}
    </ContentPanel>
  );
}
