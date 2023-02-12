import React, { useContext } from "react";
import { EuiSpacer } from "@elastic/eui";
import AliasSelect from "../../../CreateIndex/components/AliasSelect";
import CustomFormRow from "../../../../components/CustomFormRow";
import { ServicesContext } from "../../../../services";
import { BrowserServices } from "../../../../models/interfaces";
import { ALIAS_SELECT_RULE, INDEX_NAMING_MESSAGE, INDEX_NAMING_PATTERN } from "../../../../utils/constants";
import { getCommonFormRowProps } from "../../hooks";
import { SubDetailProps } from "../../interface";
import { AllBuiltInComponents } from "../../../../components/FormGenerator";

export default function IndexAlias(props: SubDetailProps) {
  const { field, writingIndex } = props;
  const services = useContext(ServicesContext) as BrowserServices;
  return (
    <>
      <CustomFormRow
        label="Index name"
        {...getCommonFormRowProps(["targetIndex", "index"], field)}
        helpText={<div>{INDEX_NAMING_MESSAGE}</div>}
        position="bottom"
      >
        <AllBuiltInComponents.Input
          {...field.registerField({
            name: ["targetIndex", "index"],
            rules: [
              {
                validator(rule, value: string) {
                  if (!value) {
                    if (writingIndex?.match(/-\d{6}$/)) {
                      return Promise.resolve("");
                    } else {
                      return Promise.reject("Index name is required.");
                    }
                  } else if (!value.match(INDEX_NAMING_PATTERN)) {
                    return Promise.reject("Invalid index name");
                  }

                  return Promise.resolve("");
                },
              },
            ],
          })}
          placeholder="Specify a name for the new index."
        />
      </CustomFormRow>
      <EuiSpacer size="s" />
      <CustomFormRow
        fullWidth
        {...getCommonFormRowProps(["targetIndex", "aliases"], field)}
        label="Index alias"
        helpText="Select existing aliases or specify a new alias."
      >
        <AliasSelect
          {...field.registerField({
            name: ["targetIndex", "aliases"],
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
  );
}
