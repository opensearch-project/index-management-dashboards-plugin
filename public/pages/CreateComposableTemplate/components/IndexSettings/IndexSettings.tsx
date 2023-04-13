import React from "react";
import { EuiLink, EuiSpacer } from "@elastic/eui";
import flat from "flat";
import { ContentPanel } from "../../../../components/ContentPanel";
import CustomFormRow from "../../../../components/CustomFormRow";
import { AllBuiltInComponents, IFieldComponentProps } from "../../../../components/FormGenerator";
import AdvancedSettings from "../../../../components/AdvancedSettings";
import { INDEX_SETTINGS_URL, IndicesUpdateMode } from "../../../../utils/constants";
import { SubDetailProps } from "../../interface";
import { getCommonFormRowProps } from "../../hooks";

const WrappedNumber = ({ onChange, ...others }: IFieldComponentProps) => {
  return (
    <AllBuiltInComponents.Number
      {...others}
      onChange={(val) => {
        if (val === "") {
          onChange(undefined);
          return;
        }

        onChange(val);
      }}
    />
  );
};

export default function IndexSettings(props: SubDetailProps) {
  const { field, isEdit, noPanel } = props;
  const values = field.getValues();
  return (
    <ContentPanel
      color={noPanel ? "ghost" : undefined}
      title="Index settings"
      noExtraPadding
      actions={
        <div>
          <AllBuiltInComponents.Switch
            {...field.registerField({
              name: ["includes", IndicesUpdateMode.settings],
            })}
            label="Use configuration"
            showLabel
          />
        </div>
      }
      titleSize="s"
    >
      {values.includes?.[IndicesUpdateMode.settings] ? (
        <>
          <EuiSpacer />
          <CustomFormRow
            label="Number of primary shards"
            helpText="Specify the number of primary shards in the index. Default is 1."
            direction={isEdit ? "hoz" : "ver"}
            {...getCommonFormRowProps(["template", "settings", "index.number_of_shards"], field)}
          >
            <WrappedNumber
              removeWhenEmpty
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
            label="Number of replicas"
            helpText="Specify the number of replicas each primary shard should have. Default is 1."
            direction={isEdit ? "hoz" : "ver"}
            {...getCommonFormRowProps(["template", "settings", "index.number_of_replicas"], field)}
          >
            <WrappedNumber
              removeWhenEmpty
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
            label="Refresh interval"
            helpText="Specify how often the index should refresh, which publishes its most recent changes and makes them available for search. Default is 1s."
            direction={isEdit ? "hoz" : "ver"}
            {...getCommonFormRowProps(["template", "settings", "index.refresh_interval"], field)}
          >
            <AllBuiltInComponents.Input
              removeWhenEmpty
              {...field.registerField({
                name: ["template", "settings", "index.refresh_interval"],
              })}
            />
          </CustomFormRow>
          <EuiSpacer />
          <AdvancedSettings
            value={field.getValues().template.settings || {}}
            onChange={(totalValue) => {
              field.setValue(["template", "settings"], totalValue);
              field.validatePromise();
            }}
            accordionProps={{
              initialIsOpen: false,
              id: "accordionForCreateComposableTemplateSettings",
              buttonContent: <h4>Advanced settings</h4>,
            }}
            editorProps={{
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
          <EuiSpacer />
        </>
      ) : null}
    </ContentPanel>
  );
}
