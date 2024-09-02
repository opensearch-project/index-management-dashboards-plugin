/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useContext } from "react";
import { EuiSpacer, EuiText, EuiTitle } from "@elastic/eui";
import AliasSelect from "../../../../components/AliasSelect";
import CustomFormRow from "../../../../components/CustomFormRow";
import { ServicesContext } from "../../../../services";
import { BrowserServices } from "../../../../models/interfaces";
import DescriptionListHoz from "../../../../components/DescriptionListHoz";
import { ALIAS_SELECT_RULE } from "../../../../utils/constants";
import { getCommonFormRowProps } from "../../hooks";
import { SubDetailProps } from "../../interface";

export default function IndexAlias(props: SubDetailProps) {
  const { readonly, field, isEdit } = props;
  const values = field.getValues();
  const services = useContext(ServicesContext) as BrowserServices;
  return (
    <>
      <CustomFormRow
        label={
          <EuiText size="s">
            <h3>Index alias</h3>
          </EuiText>
        }
        fullWidth
        helpText="Allow the new indexes to be referenced by existing aliases or specify a new alias."
      >
        <></>
      </CustomFormRow>
      {readonly ? (
        <>
          <EuiSpacer size="s" />
          <DescriptionListHoz
            compressed
            listItems={[
              {
                title: (
                  <EuiText size="s">
                    <h4>Alias names</h4>
                  </EuiText>
                ),
                description: Object.keys(values?.template?.aliases || {}).join(",") || "-",
              },
            ]}
          />
        </>
      ) : (
        <>
          <EuiSpacer size="s" />
          <CustomFormRow
            fullWidth
            direction={isEdit ? "hoz" : "ver"}
            {...getCommonFormRowProps(["template", "aliases"], field)}
            label={
              <EuiText size="s">
                <h4>Index alias</h4>
              </EuiText>
            }
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
        </>
      )}
    </>
  );
}
