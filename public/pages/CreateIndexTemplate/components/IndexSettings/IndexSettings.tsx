/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import React from "react";
import { EuiLink, EuiSpacer, EuiTitle } from "@elastic/eui";
import flat from "flat";
import CustomFormRow from "../../../../components/CustomFormRow";
import { AllBuiltInComponents } from "../../../../components/FormGenerator";
import AdvancedSettings from "../../../../components/AdvancedSettings";
import DescriptionListHoz from "../../../../components/DescriptionListHoz";
import { INDEX_SETTINGS_URL } from "../../../../utils/constants";
import { SubDetailProps } from "../../interface";
import { getCommonFormRowProps } from "../../hooks";

export default function IndexSettings(props: SubDetailProps) {
  const { readonly, field, columns, isEdit } = props;
  const values = field.getValues();
  return (
    <>
      <EuiTitle size="s">
        <span>Index settings</span>
      </EuiTitle>
      <EuiSpacer size="s" />
      {readonly ? (
        <DescriptionListHoz
          columns={columns}
          listItems={[
            {
              title: "Number of primary shards",
              description: values.template?.settings?.["index.number_of_shards"] || "-",
            },
            {
              title: "Number of replicas",
              description: values.template?.settings?.["index.number_of_replicas"] || "-",
            },
            {
              title: "Refresh interval",
              description: values.template?.settings?.["index.refresh_interval"] || "-",
            },
          ]}
        />
      ) : (
        <>
          <CustomFormRow
            direction={isEdit ? "hoz" : "ver"}
            label="Number of primary shards"
            helpText="Specify the number of primary shards in the index. Default is 1."
            {...getCommonFormRowProps(["template", "settings", "index.number_of_shards"], field)}
          >
            <AllBuiltInComponents.Number
              {...field.registerField({
                name: ["template", "settings", "index.number_of_shards"],
                rules: [
                  {
                    min: 1,
                    message: "Number of shards cannot be smaller than 1.",
                  },
                  {
                    validator(rule, value) {
                      if (!value) {
                        return Promise.resolve("");
                      }
                      if (Number(value) !== parseInt(value)) {
                        return Promise.reject("Number of primary shards must be an integer.");
                      }

                      return Promise.resolve("");
                    },
                  },
                ],
              })}
            />
          </CustomFormRow>
          <EuiSpacer />
          <CustomFormRow
            fullWidth
            direction={isEdit ? "hoz" : "ver"}
            label="Number of replicas"
            helpText="Specify the number of replicas each primary shard should have. Default is 1."
            {...getCommonFormRowProps(["template", "settings", "index.number_of_replicas"], field)}
          >
            <AllBuiltInComponents.Number
              {...field.registerField({
                name: ["template", "settings", "index.number_of_replicas"],
                rules: [
                  {
                    min: 0,
                    message: "Number of replicas cannot be smaller than 0.",
                  },
                  {
                    validator(rule, value) {
                      if (!value) {
                        return Promise.resolve("");
                      }
                      if (Number(value) !== parseInt(value)) {
                        return Promise.reject("Number of replicas must be an integer");
                      }

                      return Promise.resolve("");
                    },
                  },
                ],
              })}
            />
          </CustomFormRow>
          <EuiSpacer />
          <CustomFormRow
            direction={isEdit ? "hoz" : "ver"}
            label="Refresh interval"
            helpText="Specify how often the index should refresh, which publishes its most recent changes and makes them available for search. Default is 1s."
            {...getCommonFormRowProps(["template", "settings", "index.refresh_interval"], field)}
          >
            <AllBuiltInComponents.Input
              {...field.registerField({
                name: ["template", "settings", "index.refresh_interval"],
              })}
            />
          </CustomFormRow>
        </>
      )}
      <EuiSpacer />
      <AdvancedSettings
        value={field.getValues().template.settings || {}}
        onChange={(totalValue) => {
          field.setValue(["template", "settings"], totalValue);
          field.validatePromise();
        }}
        accordionProps={{
          initialIsOpen: false,
          id: "accordionForCreateIndexTemplateSettings",
          buttonContent: <h4>Advanced settings</h4>,
        }}
        editorProps={{
          disabled: readonly,
          width: "100%",
          formatValue: flat,
        }}
        rowProps={{
          fullWidth: true,
          label: "Specify advanced index settings",
          helpText: (
            <>
              <p>
                Specify a comma-delimited list of settings.{" "}
                <EuiLink href={INDEX_SETTINGS_URL} target="_blank" external>
                  View index settings
                </EuiLink>
              </p>
              <p>
                All the settings will be handled in flat structure.{" "}
                <EuiLink
                  href="https://opensearch.org/docs/latest/api-reference/index-apis/get-index/#url-parameters"
                  external
                  target="_blank"
                >
                  Learn more
                </EuiLink>
              </p>
            </>
          ),
        }}
      />
    </>
  );
}
