/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { Component } from "react";
import { EuiSpacer, EuiLink, EuiFlexItem, EuiFlexGroup, EuiSmallButton, EuiButtonEmpty } from "@elastic/eui";
import FormGenerator, { IField, IFormGeneratorRef, IFieldComponentProps } from "../../../../components/FormGenerator";
import { IndexItem } from "../../../../../models/interfaces";
import IndexDetail from "../../../../containers/IndexDetail";
import ContentPanel from "../../../../components/ContentPanel/ContentPanel";
import AliasSelect, { AliasSelectProps } from "../../../../components/AliasSelect";
import EuiToolTipWrapper from "../../../../components/EuiToolTipWrapper";
import {
  INDEX_NAMING_PATTERN,
  INDEX_NAMING_MESSAGE,
  INDEX_SETTINGS_URL,
  REPLICA_NUMBER_MESSAGE,
  ALIAS_SELECT_RULE,
} from "../../../../utils/constants";
import NotificationConfig, { NotificationConfigRef } from "../../../../containers/NotificationConfig";
import { ServerResponse } from "../../../../../server/models/types";
import { ActionType, OperationType } from "../../../Notifications/constant";

const WrappedAliasSelect = EuiToolTipWrapper(AliasSelect, {
  disabledKey: "isDisabled",
});

interface SplitIndexComponentProps {
  sourceIndex: string;
  reasons: React.ReactChild[];
  sourceShards: string;
  shardsSelectOptions: { label: string }[];
  onSplitIndex: (targetIndex: string, settingsPayload: Required<IndexItem>["settings"]) => Promise<ServerResponse<{ task: string }>>;
  onCancel: () => void;
  getAlias: AliasSelectProps["refreshOptions"];
  loading: boolean;
}

export default class SplitIndexForm extends Component<SplitIndexComponentProps> {
  state = {
    settings: {} as Required<IndexItem>["settings"],
    sourceIndexSettings: {} as IndexItem,
  };

  formRef: IFormGeneratorRef | null = null;
  notificationRef: NotificationConfigRef | null = null;
  onSubmit = async () => {
    // trigger the validation manually here
    const validateResult = await this.formRef?.validatePromise();
    const notificationResult = await this.notificationRef?.validatePromise();
    const { targetIndex, ...others } = this.state.settings;
    const { errors } = validateResult || {};
    if (errors) {
      return;
    }
    if (notificationResult?.errors) {
      return;
    }
    try {
      const result = await this.props.onSplitIndex(targetIndex, others);
      if (result && result.ok) {
        this.notificationRef?.associateWithTask({
          taskId: result.response.task,
        });
      }
      this.props.onCancel();
    } catch (err) {
      // no need to log anything since getIndexSettings will log the error
    }
  };

  render() {
    const { sourceIndex, sourceShards, reasons, getAlias } = this.props;
    const blockNameList = ["targetIndex"];

    let shardMessage = "The number must be 2x times of the primary shard count of the source index.";
    if (sourceShards === "1") {
      shardMessage = "The number must be an integer greater than 1 but fewer or equal to 1024.";
    }

    const formFields: IField[] = [
      {
        rowProps: {
          label: "Target Index Name",
          helpText: INDEX_NAMING_MESSAGE,
          position: "bottom",
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
                  return Promise.reject("Target index name is required");
                } else if (!INDEX_NAMING_PATTERN.test(value)) {
                  return Promise.reject(`Target index name ${value} is invalid`);
                }
                // pass the validation, return a resolved promise
                return Promise.resolve();
              },
            },
          ],
          props: {
            "data-test-subj": "targetIndexNameInput",
            placeholder: "Specify a name for the new split index",
          },
        },
      },
      {
        rowProps: {
          label: "Number of primary shards",
          helpText: (
            <>
              <p>Specify the number of primary shards for the new split index.</p>
              <p>{shardMessage}</p>
            </>
          ),
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
                } else if (!this.props.shardsSelectOptions.find((item) => "" + item.label === "" + value)) {
                  return Promise.reject(`Number of shards ${value} is invalid`);
                }
                // pass the validation, return a resolved promise
                return Promise.resolve();
              },
            },
          ],
          props: {
            "data-test-subj": "numberOfShardsInput",
            options: this.props.shardsSelectOptions,
            placeholder: "Specify primary shard count",
            onCreateOption: undefined,
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
            placeholder: "Specify number of replica",
            min: 0,
          },
        },
      },
      {
        name: "aliases",
        rowProps: {
          label: "Index alias",
          isOptional: true,
          helpText: "Allow this index to be referenced by existing aliases or specify a new alias.",
        },
        options: {
          props: {
            refreshOptions: getAlias,
          },
          rules: ALIAS_SELECT_RULE,
        },
        component: WrappedAliasSelect as React.ComponentType<IFieldComponentProps>,
      },
    ];

    const readyForSplit = reasons.length === 0;
    return (
      <div>
        <IndexDetail indices={[sourceIndex]}>
          <ul>
            {reasons.map((reason, reasonIndex) => (
              <li key={reasonIndex}>{reason}</li>
            ))}
          </ul>
        </IndexDetail>
        {readyForSplit && (
          <>
            <EuiSpacer />
            <ContentPanel title="Configure target index" titleSize="s">
              <FormGenerator
                value={{ "index.number_of_replicas": "1", ...this.state.settings }}
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
                    id: "accordionForCreateIndexSettings",
                    buttonContent: <h4>Advanced settings</h4>,
                  },
                  blockedNameList: blockNameList,
                  rowProps: {
                    label: "Specify advanced index settings",
                    helpText: (
                      <>
                        Specify a comma-delimited list of settings.&nbsp;
                        <EuiLink href={INDEX_SETTINGS_URL} target="_blank">
                          View index settings
                        </EuiLink>
                      </>
                    ),
                  },
                }}
              />
            </ContentPanel>
          </>
        )}
        <NotificationConfig
          withPanel
          panelProps={{
            title: "Advanced settings",
            titleSize: "s",
          }}
          ref={(ref) => (this.notificationRef = ref)}
          actionType={ActionType.RESIZE}
          operationType={OperationType.SHRINK}
        />

        <EuiSpacer />
        <EuiFlexGroup alignItems="center" justifyContent="flexEnd">
          <EuiFlexItem grow={false}>
            <EuiButtonEmpty onClick={this.props.onCancel} data-test-subj="splitCancelButton">
              Cancel
            </EuiButtonEmpty>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiSmallButton
              fill
              onClick={this.onSubmit}
              isLoading={this.props.loading}
              disabled={this.props.loading}
              data-test-subj="splitButton"
              isDisabled={!readyForSplit}
            >
              Split
            </EuiSmallButton>
          </EuiFlexItem>
        </EuiFlexGroup>
      </div>
    );
  }
}
