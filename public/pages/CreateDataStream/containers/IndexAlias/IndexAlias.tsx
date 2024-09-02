/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useContext } from "react";
import { EuiSpacer, EuiTitle, EuiText, EuiFlexGrid, EuiFlexItem } from "@elastic/eui";
import AliasSelect from "../../../../components/AliasSelect";
import CustomFormRow from "../../../../components/CustomFormRow";
import { ServicesContext } from "../../../../services";
import { BrowserServices } from "../../../../models/interfaces";
import DescriptionListHoz from "../../../../components/DescriptionListHoz";
import { getCommonFormRowProps } from "../../hooks";
import { SubDetailProps } from "../../interface";

export default function IndexAlias(props: SubDetailProps) {
  const { isEdit, field } = props;
  const values = field.getValues();
  const services = useContext(ServicesContext) as BrowserServices;

  const listItems = [
    {
      title: "Alias names",
      description: Object.keys(values?.template?.aliases || {}).join(",") || "-",
    },
  ];

  return (
    <>
      <CustomFormRow
        fullWidth
        label={
          <EuiText size="s">
            <h3>Index alias</h3>
          </EuiText>
        }
        helpText="Allow the new indexes to be referenced by existing aliases or specify a new alias."
      >
        <></>
      </CustomFormRow>
      {!isEdit ? (
        <>
          <EuiSpacer size="s" />
          <EuiFlexGrid columns={4}>
            {listItems.map((item) => (
              <EuiFlexItem key={`${item.title}#${item.description}`}>
                <EuiText size="s">
                  <dt>{item.title}</dt>
                  <dd>{item.description}</dd>
                </EuiText>
              </EuiFlexItem>
            ))}
          </EuiFlexGrid>
        </>
      ) : (
        <>
          <EuiSpacer size="s" />
          <CustomFormRow
            fullWidth
            {...getCommonFormRowProps(["template", "aliases"], field)}
            label={
              <EuiText size="s">
                {" "}
                <h3>Index alias</h3>{" "}
              </EuiText>
            }
            helpText="Select existing aliases or specify a new alias."
          >
            <AliasSelect
              isDisabled
              {...field.registerField({
                name: ["template", "aliases"],
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
