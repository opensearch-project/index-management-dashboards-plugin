/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { Component } from "react";
import { EuiCallOut, EuiFlyoutFooter, EuiLink } from "@elastic/eui";
import FormGenerator, { IField, IFormGeneratorRef } from "../../../../components/FormGenerator";
import { IndexItem } from "../../../../../models/interfaces";
import FlyoutFooter from "../../../VisualCreatePolicy/components/FlyoutFooter";
import IndexDetail from "../../../../containers/IndexDetail";
import ContentPanel from "../../../../components/ContentPanel/ContentPanel";
import { IFieldComponentProps } from "../../../../components/FormGenerator";
import AliasSelect from "../../../CreateIndex/components/AliasSelect";
import EuiToolTipWrapper from "../../../../components/EuiToolTipWrapper";
import { getAlias } from "../../../Indices/utils/helpers";

const WrappedAliasSelect = EuiToolTipWrapper(AliasSelect, {
  disabledKey: "isDisabled",
});

interface SplitIndexComponentProps {
  sourceIndex: string;
  onCancel: () => void;
  reasons: React.ReactChild[];
  shardsSelectOptions: [];
  onSplitIndex: (targetIndex: string, settingsPayload: IndexItem["settings"]) => void;
}

export default class SplitIndexFlyout extends Component<SplitIndexComponentProps> {
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
    this.props.onSplitIndex(targetIndex, others);
  };

  render() {
    const { sourceIndex, onCancel, reasons } = this.props;
    const blockNameList = ["targetIndex"];

    const formFields: IField[] = [
      {
        rowProps: {
          label: "Target Index Name",
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
          label: "Number of shards",
          helpText: "The number of primary shards in the target index",
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
          helpText: "The number of replica shards each primary shard should have.",
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
          helpText: "Select existing aliases or specify a new alias",
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
      <ContentPanel title="Source index" titleSize="s">
        <IndexDetail indices={[sourceIndex]}>
          <EuiCallOut color="danger" hidden={readyForSplit} data-test-subj="Source Index Warning">
            <div style={{ lineHeight: 3 }}>
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
                Learn more
              </EuiLink>
            </div>
          </EuiCallOut>
        </IndexDetail>
      </ContentPanel>
      /*
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

      <EuiFlyoutFooter>
        <FlyoutFooter
          action=""
          text="Split"
          edit={false}
          disabledAction={!readyForSplit}
          onClickAction={this.onSubmit}
          onClickCancel={onCancel}
        />
      </EuiFlyoutFooter>

 */
    );
  }
}
