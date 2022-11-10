/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { Component } from "react";
import {
  EuiCallOut,
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutFooter,
  EuiFlyoutHeader,
  EuiLink,
  EuiSpacer,
  EuiText,
  EuiTitle,
} from "@elastic/eui";
import { get } from 'lodash';
import FormGenerator, {IField, IFormGeneratorRef} from "../../../../components/FormGenerator";
import {IndexItem} from "../../../../../models/interfaces";
import FlyoutFooter from "../../../VisualCreatePolicy/components/FlyoutFooter";
import {CatIndex} from "../../../../../server/models/interfaces";
import CustomFormRow from "../../../../components/CustomFormRow";
import { CoreStart } from "opensearch-dashboards/public";

interface SplitIndexProps {
  sourceIndex: CatIndex;
  onCloseFlyout: () => void;
  onSplitIndex: (targetIndex: string, settingsPayload: IndexItem["settings"]) => void;
  getIndexSettings: (indexName: string, flat: boolean) => Promise<Record<string, IndexItem>>;
  coreServices: CoreStart
}

export default class SplitIndexFlyout extends Component<SplitIndexProps> {
  state = {
    settings: {} as Required<IndexItem>["settings"],
    sourceIndexNotReadyReasons: [],
  };

  async componentDidMount() {
    await this.isSourceIndexReady();
  }

  isSourceIndexReady = async () => {
    const { sourceIndex } = this.props;
    const reasons = [];
    let reason = "";

    if (sourceIndex.health == "red") {
      reason = "The source index's health is red.";
      reasons.push(reason);
    }

    if (sourceIndex.status !== "open") {
      reason = "The source index need to be in open status.";
      reasons.push(reason);
    }

    const { getIndexSettings } = this.props;
    const sourceIndexSettings = await getIndexSettings(sourceIndex.index, true);
    if (get(sourceIndexSettings, [sourceIndex.index, 'settings', 'index.blocks.write']) !== "true") {
      reason = "The source index's status need to set to blocks.write=true.";
      reasons.push(reason);
    }

    if (reasons.length > 0) {
      this.setState({
        sourceIndexNotReadyReasons: reasons,
      });
    }
  };

  formRef: IFormGeneratorRef | null = null;
  onSubmit = async () => {
    const { coreServices } = this.props;
    if (this.state.sourceIndexNotReadyReasons.length > 0) {
      coreServices.notifications.toasts.addDanger(this.state.sourceIndexNotReadyReasons.toString());
      return;
    }

    // trigger the validation manually here
    const validateResult = await this.formRef?.validatePromise();
    const { targetIndex, ...others } = this.state.settings;
    const { errors } = validateResult || {};
    if (errors) {
      return;
    }
    const { onSplitIndex } = this.props;
    onSplitIndex(targetIndex, others);
  };

  render() {
    const { sourceIndex, onCloseFlyout } = this.props;
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
        },
      },
      {
        rowProps: {
          label: "Number of shards",
          helpText: `Must be a multi of ${sourceIndex.pri}`
        },
        name: "index.number_of_shards",
        type: "Number",
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

                if (Number(value) < 1 ||
                  Number(value) % Number(sourceIndex.pri) != 0) {
                  return Promise.reject(`${value} must be a multiple of ${sourceIndex.pri}`);
                }

                // pass the validation, return a resolved promise
                return Promise.resolve();
              },
            },
          ],
        },
      },
    ];

    return (
      <EuiFlyout ownFocus={true} onClose={()=>{}} size="m" hideCloseButton>
        <EuiFlyoutHeader hasBorder>
          <EuiTitle size="m">
            <h2 id="flyoutTitle"> Split Index</h2>
          </EuiTitle>
        </EuiFlyoutHeader>

        <EuiCallOut color="warning"
                    hidden={this.state.sourceIndexNotReadyReasons.length == 0}
                    data-test-subj="Source Index Warning">
          <div style={{ lineHeight: 1.5 }}>
            <p>The source index is not ready to split, may due to the following reasons:</p>
            <ul>
              {this.state.sourceIndexNotReadyReasons.map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
            <EuiLink
              href={"https://opensearch.org/docs/1.2/opensearch/rest-api/index-apis/split/"}
              target="_blank"
              rel="noopener noreferrer">
              Learn more
            </EuiLink>
          </div>
        </EuiCallOut>

        <EuiFlyoutBody>
          <CustomFormRow label="Source Index Name">
            <EuiText data-test-subj="Source Index Name">
              {sourceIndex.index}
            </EuiText>
          </CustomFormRow>
          <EuiSpacer/>

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
                    <EuiLink href="https://opensearch.org/docs/latest/api-reference/index-apis/create-index#index-settings" target="_blank">
                      View index settings
                    </EuiLink>
                  </>
                ),
              },
            }}
          />
        </EuiFlyoutBody>

        <EuiFlyoutFooter>
          <FlyoutFooter
            action="Split"
            edit={false}
            onClickAction={this.onSubmit}
            onClickCancel={onCloseFlyout} />
        </EuiFlyoutFooter>
      </EuiFlyout>
    );
  }
}
