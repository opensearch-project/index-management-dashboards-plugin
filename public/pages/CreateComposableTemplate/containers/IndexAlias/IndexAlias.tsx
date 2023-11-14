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

import React, { useContext } from "react";
import { EuiSpacer, EuiTitle } from "@elastic/eui";
import { ContentPanel } from "../../../../components/ContentPanel";
import AliasSelect from "../../../../components/AliasSelect";
import CustomFormRow from "../../../../components/CustomFormRow";
import { ServicesContext } from "../../../../services";
import { BrowserServices } from "../../../../models/interfaces";
import { ALIAS_SELECT_RULE, IndicesUpdateMode } from "../../../../utils/constants";
import { getCommonFormRowProps } from "../../hooks";
import { SubDetailProps } from "../../interface";
import { AllBuiltInComponents } from "../../../../components/FormGenerator";

export default function IndexAlias(props: SubDetailProps) {
  const { field, isEdit, noPanel } = props;
  const values = field.getValues();
  const services = useContext(ServicesContext) as BrowserServices;
  return (
    <ContentPanel
      color={noPanel ? "ghost" : undefined}
      noExtraPadding
      title={
        <>
          <CustomFormRow
            fullWidth
            label={
              <EuiTitle size="s">
                <div>Index alias</div>
              </EuiTitle>
            }
            helpText="Allow the new indexes to be referenced by existing aliases or specify a new alias."
          >
            <></>
          </CustomFormRow>
        </>
      }
      actions={
        <div>
          <AllBuiltInComponents.Switch
            {...field.registerField({
              name: ["includes", IndicesUpdateMode.alias],
            })}
            label="Use configuration"
            showLabel
          />
        </div>
      }
      titleSize="s"
    >
      {values.includes?.[IndicesUpdateMode.alias] ? (
        <>
          <EuiSpacer />
          <CustomFormRow
            fullWidth
            {...getCommonFormRowProps(["template", "aliases"], field)}
            direction={isEdit ? "hoz" : "ver"}
            label="Index alias"
            helpText="Select existing aliases or specify a new alias."
          >
            <AliasSelect
              {...field.registerField({
                name: ["template", "aliases"],
                rules: [...ALIAS_SELECT_RULE],
              })}
              refreshOptions={(aliasName) =>
                services?.commonService.apiCaller({
                  endpoint: "cat.aliases",
                  method: "GET",
                  data: {
                    format: "json",
                    name: `*${aliasName || ""}*`,
                    s: "alias:desc",
                  },
                })
              }
            />
          </CustomFormRow>
          <EuiSpacer />
        </>
      ) : null}
    </ContentPanel>
  );
}
