import React, { useState } from "react";
import { EuiLink, EuiSpacer, EuiFlexGroup, EuiFlexItem, EuiBadge, EuiToolTip, EuiHealth } from "@elastic/eui";
import { DataStreamInEdit, SubDetailProps, TemplateItem } from "../../interface";
import { ContentPanel } from "../../../../components/ContentPanel";
import CustomFormRow from "../../../../components/CustomFormRow";
import { AllBuiltInComponents } from "../../../../components/FormGenerator";
import DescriptionListHoz from "../../../../components/DescriptionListHoz";
import { INDEX_NAMING_PATTERN, ROUTES } from "../../../../utils/constants";
import { getCommonFormRowProps, getStringBeforeStar, setMatchedTemplate } from "../../hooks";
import { filterByMinimatch } from "../../../../../utils/helper";
import { HEALTH_TO_COLOR } from "../../../DataStreams/utils/constants";
import { healthExplanation } from "../../../DataStreams/containers/DataStreams/DataStreams";

export default function DefineDataStream(
  props: SubDetailProps & {
    allDataStreamTemplates: TemplateItem[];
  }
) {
  const { field, isEdit, allDataStreamTemplates } = props;
  const [searchValue, setSearchValue] = useState("");
  const values: DataStreamInEdit = field.getValues();
  const Component = isEdit ? AllBuiltInComponents.Text : AllBuiltInComponents.ComboBoxSingle;
  const matchedList = allDataStreamTemplates.filter((item) => {
    if (!searchValue) {
      return true;
    } else if (item.index_template.index_patterns.some((item) => item.match(new RegExp(searchValue, "i")))) {
      return true;
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
      {
        validator: (rule, value) => {
          return new Promise((resolve, reject) => {
            setTimeout(() => {
              if (field.getValue("matchedTemplate")) {
                resolve("");
              } else {
                reject(`No matching index template found for data stream [${value || ""}]`);
              }
            }, 0);
          });
        },
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
            description: ((health: string) => {
              const healthLowerCase = health?.toLowerCase() as "green" | "yellow" | "red";
              const color = health ? HEALTH_TO_COLOR[healthLowerCase] : "subdued";
              const text = (health || "").toLowerCase();
              return (
                <EuiToolTip content={healthExplanation[healthLowerCase] || ""}>
                  <EuiHealth color={color} className="indices-health">
                    {text}
                  </EuiHealth>
                </EuiToolTip>
              );
            })(values.status),
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
            description: values.timestamp_field?.name || "",
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
        fullWidth
        helpText={
          <>
            Enter a data stream name. It must match an index pattern from a data stream template.{" "}
            <EuiLink href={`#${ROUTES.TEMPLATES}`} external target="_blank">
              Manage templates
            </EuiLink>
          </>
        }
      >
        <Component
          placeholder="Specify data stream name"
          options={matchedList.map((item) => ({
            label: item.name,
            value: item,
          }))}
          renderOption={(option: { value: TemplateItem; label: string }) => {
            return (
              <EuiFlexGroup style={{ overflowX: "auto" }} justifyContent="spaceBetween">
                <EuiFlexItem grow={false}>{option.value.index_template.index_patterns.join(",")}</EuiFlexItem>
                <EuiFlexItem grow={false}>
                  <EuiBadge color="hollow">{option.label}</EuiBadge>
                </EuiFlexItem>
              </EuiFlexGroup>
            );
          }}
          async
          {...suggestionRegister}
          // onCreateOption={() => {
          //   window.open(`#${ROUTES.CREATE_TEMPLATE}?values=${JSON.stringify({ data_stream: {}, index_patterns: [`${searchValue}*`] })}`);
          // }}
          onCreateOption={undefined}
          customOptionText={
            searchValue
              ? `{searchValue} doesn’t match index patterns from any templates. Specify another name or press Enter to create a data stream template.`
              : `There are no data stream templates. Press Enter to create a data stream template.`
          }
          onSearchChange={(dataStreamName: string) => {
            setSearchValue(dataStreamName);
          }}
          onChange={(value: string, selectedOption: { value: TemplateItem }) => {
            if (!value) {
              field.resetValues({
                name: "",
              });
            } else {
              const findItem = selectedOption.value;
              const { index_patterns } = findItem.index_template;
              // matched by wildcard
              const findMatchesPattern = index_patterns.find((item) => filterByMinimatch(searchValue, [item]));
              // matched by letters
              const findWordLikePattern = index_patterns.find((item) => item.match(new RegExp(searchValue, "i")));
              let setTemplatePayloadFlag = false;
              if (findMatchesPattern) {
                suggestionRegister.onChange(searchValue);
                setTemplatePayloadFlag = true;
              } else if (findWordLikePattern) {
                const finalReplaceValue = getStringBeforeStar(findWordLikePattern);
                suggestionRegister.onChange(finalReplaceValue);
                if (filterByMinimatch(finalReplaceValue, findItem.index_template.index_patterns)) {
                  setTemplatePayloadFlag = true;
                }
              }

              if (setTemplatePayloadFlag) {
                setMatchedTemplate({
                  matchedTemplate: findItem,
                  field,
                });
              } else {
                field.setValues({
                  matchedTemplate: "",
                  template: {},
                });
              }
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
