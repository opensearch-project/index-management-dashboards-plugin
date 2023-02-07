import React, { useState } from "react";
import { EuiBadge, EuiLink, EuiSpacer } from "@elastic/eui";
import { flatten } from "flat";
import { get, set } from "lodash";
import { transformObjectToArray } from "../../../../components/IndexMapping";
import { DataStreamInEdit, SubDetailProps } from "../../interface";
import { ContentPanel } from "../../../../components/ContentPanel";
import CustomFormRow from "../../../../components/CustomFormRow";
import { AllBuiltInComponents } from "../../../../components/FormGenerator";
import DescriptionListHoz from "../../../../components/DescriptionListHoz";
import { INDEX_NAMING_MESSAGE, INDEX_NAMING_PATTERN, ROUTES } from "../../../../utils/constants";
import { getCommonFormRowProps } from "../../hooks";
import { filterByMinimatch } from "../../../../../utils/helper";
import { TemplateItemRemote } from "../../../../../models/interfaces";

export default function DefineTemplate(
  props: SubDetailProps & {
    allDataStreamTemplates: {
      name: string;
      index_template: TemplateItemRemote;
    }[];
  }
) {
  const { field, isEdit, allDataStreamTemplates } = props;
  const [searchValue, setSearchValue] = useState("");
  const values: DataStreamInEdit = field.getValues();
  const Component = isEdit ? AllBuiltInComponents.Text : AllBuiltInComponents.ComboBoxSingle;
  const matchedList = allDataStreamTemplates.filter((item) => {
    if (!searchValue) {
      return false;
    }

    return filterByMinimatch(searchValue || "", item.index_template.index_patterns);
  });
  matchedList.sort((a, b) => (a.index_template.priority > b.index_template.priority ? -1 : 1));
  const suggestionRegister = field.registerField({
    name: "name",
    rules: [
      {
        pattern: INDEX_NAMING_PATTERN,
        message: "Invalid data stream name.",
      },
    ],
    props: {},
  });
  return isEdit ? (
    <ContentPanel title="Data stream details" titleSize="s">
      <EuiSpacer size="s" />
      <DescriptionListHoz
        listItems={[
          {
            title: "Name",
            description: values.name,
          },
          {
            title: "Status",
            description: values.status,
          },
          {
            title: "Template name",
            description: <EuiLink href={`#${ROUTES.CREATE_TEMPLATE}/${values.template}/readonly`}>{values.template}</EuiLink>,
          },
          {
            title: "Backing indexes",
            description: (values.indices || []).length,
          },
          {
            title: "Timefield",
            description: (values.indices || []).length,
          },
        ]}
      />
    </ContentPanel>
  ) : (
    <ContentPanel title="Define data stream" titleSize="s">
      <EuiSpacer size="s" />
      <CustomFormRow {...getCommonFormRowProps("name", field)} label="Data stream name" position="bottom" helpText={INDEX_NAMING_MESSAGE}>
        <Component
          options={matchedList.map((item) => ({
            label: searchValue,
            value: item.name,
          }))}
          renderOption={(option: { value: string }) => {
            return (
              <h1>
                Matched template: <EuiBadge color="hollow">{option.value}</EuiBadge>
              </h1>
            );
          }}
          async
          {...suggestionRegister}
          onCreateOption={undefined}
          onSearchChange={(dataStreamName: string) => {
            setSearchValue(dataStreamName);
          }}
          onChange={(value) => {
            if (!value) {
              field.resetValues({
                name: "",
              });
            } else {
              suggestionRegister.onChange(value);
              const template = matchedList[0]?.index_template?.template;
              const payload = {
                matchedTemplate: matchedList[0]?.name,
                template: {
                  ...template,
                  settings: flatten(template.settings || {}),
                },
              };

              set(payload, "template.mappings.properties", transformObjectToArray(get(payload, "template.mappings.properties", {})));

              field.setValues(payload);
            }
          }}
        />
      </CustomFormRow>
      <EuiSpacer />
      <CustomFormRow label="Matching index template">
        {values.matchedTemplate ? (
          <EuiLink external={false} target="_blank" href={`#${ROUTES.CREATE_TEMPLATE}/${values.matchedTemplate}/readonly`}>
            {values.matchedTemplate}
          </EuiLink>
        ) : (
          <>No index template matched</>
        )}
      </CustomFormRow>
    </ContentPanel>
  );
}
