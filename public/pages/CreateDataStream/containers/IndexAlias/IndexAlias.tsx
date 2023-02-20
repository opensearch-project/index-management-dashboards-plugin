import React, { useContext } from "react";
import { EuiSpacer, EuiTitle } from "@elastic/eui";
import AliasSelect from "../../../CreateIndex/components/AliasSelect";
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
  return (
    <>
      <EuiTitle size="s">
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
      </EuiTitle>
      {!isEdit ? (
        <>
          <EuiSpacer size="s" />
          <DescriptionListHoz
            listItems={[
              {
                title: "Alias names",
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
            {...getCommonFormRowProps(["template", "aliases"], field)}
            label="Index alias"
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
