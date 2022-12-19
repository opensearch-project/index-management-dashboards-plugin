/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { Component } from "react";
import { EuiCallOut, EuiSpacer, EuiLink, EuiFlexItem, EuiFlexGroup, EuiButton, EuiButtonEmpty } from "@elastic/eui";
import FormGenerator, { IField, IFormGeneratorRef } from "../../../../components/FormGenerator";
import { IndexItem } from "../../../../../models/interfaces";
import IndexDetail from "../../../../containers/IndexDetail";
import ContentPanel from "../../../../components/ContentPanel/ContentPanel";
import { IFieldComponentProps } from "../../../../components/FormGenerator";
import AliasSelect, { AliasSelectProps } from "../../../CreateIndex/components/AliasSelect";
import EuiToolTipWrapper from "../../../../components/EuiToolTipWrapper";
import { INDEX_NAMING_MESSAGE, REPLICA_NUMBER_MESSAGE } from "../../../../utils/constants";

const WrappedAliasSelect = EuiToolTipWrapper(AliasSelect, {
  disabledKey: "isDisabled",
});

interface SplitIndexComponentProps {
  sourceIndex: string;
  reasons: React.ReactChild[];
  shardsSelectOptions: { label: string }[];
  onSplitIndex: (targetIndex: string, settingsPayload: Required<IndexItem>["settings"]) => Promise<void>;
  onCancel: () => void;
  getAlias: AliasSelectProps["refreshOptions"];
}

export default class SplitIndexForm extends Component<SplitIndexComponentProps> {
  state = {
    settings: {} as Required<IndexItem>["settings"],
    sourceIndexSettings: {} as IndexItem,
  };

  formRef: IFormGeneratorRef | null = null;
  onSubmit = async () => {
    // trigger the validation manually here
    const validateResult = await this.formRef?.validatePromise();
    const { targetIndex, ...others } = this.state.settings;
    const { errors } = validateResult || {};
    if (errors) {
      return;
    }
    await this.props.onSplitIndex(targetIndex, others);
    this.props.onCancel();
  };

  render() {
    const { sourceIndex, reasons, getAlias } = this.props;
    const blockNameList = ["targetIndex"];

    const formFields: IField[] = [
      {
        rowProps: {
          label: "Target Index Name",
          helpText: INDEX_NAMING_MESSAGE,
        },
        name: "targetIndex",
        type: "Input",
        options: {
          rules: [
            {
              trigger: "onBlur",
              validator: (rule, value) => {
                if (!value || value === "") {
                  // do not pass the validation
                  // return a rejected promise with error message
                  return Promise.reject("Target Index Name is required");
                }
                // pass the validation, return a resolved promise
                return Promise.resolve();
              },
            },
          ],
          props: {
            "data-test-subj": "targetIndexNameInput",
          },
        },
      },
      {
        rowProps: {
          label: "Number of primary shards",
          helpText: "Specify the number of primary shards for the new split index.",
        },
        name: "index.number_of_shards",
        type: "ComboBoxSingle",
        options: {
          rules: [
            {
              trigger: "onBlur",
              validator: (rule, value) => {
                if (!value || value === "") {
                  // do not pass the validation
                  // return a rejected promise with error message
                  return Promise.reject("Number of shards is required");
                }
                // pass the validation, return a resolved promise
                return Promise.resolve();
              },
            },
          ],
          props: {
            "data-test-subj": "numberOfShardsInput",
            options: this.props.shardsSelectOptions,
          },
        },
      },
      {
        rowProps: {
          label: "Number of replicas",
          helpText: REPLICA_NUMBER_MESSAGE,
        },
        name: "index.number_of_replicas",
        type: "Number",
        options: {
          props: {
            "data-test-subj": "numberOfReplicasInput",
            min: 0,
          },
        },
      },
      {
        name: "aliases",
        rowProps: {
          label: "Index alias  - optional",
          helpText: "Allow this index to be referenced by existing aliases or specify a new alias.",
        },
        options: {
          props: {
            refreshOptions: getAlias,
          },
        },
        component: WrappedAliasSelect as React.ComponentType<IFieldComponentProps>,
      },
    ];

    const readyForSplit = reasons.length === 0;
    return (
      <div>
        <ContentPanel title="Source index" titleSize="s">
          <IndexDetail indices={[sourceIndex]}>
            <EuiCallOut color="danger" hidden={readyForSplit} data-test-subj="Source Index Warning">
              <div style={{ lineHeight: 3 }}>
                Source index cannot currently be split <br />
                To split the index:
                <ul>
                  {reasons.map((reason, reasonIndex) => (
                    <li key={reasonIndex}>{reason}</li>
                  ))}
                </ul>
                <EuiLink
                  href={"https://opensearch.org/docs/latest/api-reference/index-apis/split/"}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Learn more.
                </EuiLink>
              </div>
            </EuiCallOut>
          </IndexDetail>
        </ContentPanel>
        <EuiSpacer />

        {readyForSplit && (
          <ContentPanel title="Configure target index" titleSize="s">
            <FormGenerator
              onChange={(totalValue) =>
                this.setState({
                  settings: totalValue,
                })
              }
              formFields={formFields}
              ref={(ref) => (this.formRef = ref)}
              hasAdvancedSettings={true}
              advancedSettingsProps={{
                accordionProps: {
                  initialIsOpen: false,
                  id: "accordion_for_create_index_settings",
                  buttonContent: <h4>Advanced settings</h4>,
                },
                blockedNameList: blockNameList,
                rowProps: {
                  label: "Specify advanced index settings",
                  helpText: (
                    <>
                      Specify a comma-delimited list of settings.
                      <EuiLink
                        href="https://opensearch.org/docs/latest/api-reference/index-apis/create-index#index-settings"
                        target="_blank"
                      >
                        View index settings
                      </EuiLink>
                    </>
                  ),
                },
              }}
            />
          </ContentPanel>
        )}
        <EuiSpacer />

        <EuiFlexGroup alignItems="center" justifyContent="flexEnd">
          <EuiFlexItem grow={false}>
            <EuiButtonEmpty onClick={this.props.onCancel} data-test-subj="splitCancelButton">
              Cancel
            </EuiButtonEmpty>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButton fill onClick={this.onSubmit} data-test-subj="splitButton" isDisabled={!readyForSplit}>
              Split
            </EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup>
      </div>
    );
  }
}
