import React, { useState } from "react";
import { EuiBadge, EuiLink, EuiSpacer } from "@elastic/eui";
import { flatten } from "flat";
import { get, set } from "lodash";
import { transformObjectToArray } from "../../../../components/IndexMapping";
import { SubDetailProps } from "../../interface";
import { ContentPanel } from "../../../../components/ContentPanel";
import CustomFormRow from "../../../../components/CustomFormRow";
import { AllBuiltInComponents } from "../../../../components/FormGenerator";
import DescriptionListHoz from "../../../../components/DescriptionListHoz";
import { INDEX_NAMING_MESSAGE, INDEX_NAMING_PATTERN, ROUTES } from "../../../../utils/constants";
import { TemplateConvert } from "../../components/TemplateType";
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
  const { readonly, field, isEdit, allDataStreamTemplates } = props;
  const [searchValue, setSearchValue] = useState("");
  const values = field.getValues();
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
            title: "Template type",
            description: TemplateConvert({
              value: values.data_stream,
            }),
          },
          {
            title: "Index patterns",
            description: values.index_patterns?.join(","),
          },
          {
            title: "Priority",
            description: values.priority,
          },
        ]}
      />
    </ContentPanel>
  ) : (
    <ContentPanel title="Define data stream" titleSize="s">
      <EuiSpacer size="s" />
      <CustomFormRow
        {...getCommonFormRowProps("name", field)}
        label="Data stream name"
        position="bottom"
        helpText={
          <>
            <div>{INDEX_NAMING_MESSAGE}</div>
          </>
        }
      >
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
          async={true}
          {...suggestionRegister}
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
          <></>
        )}
      </CustomFormRow>
    </ContentPanel>
  );
}
