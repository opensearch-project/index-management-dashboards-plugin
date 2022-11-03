/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { Component } from "react";
import {
  EuiButtonEmpty,
  EuiButton,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutFooter,
  EuiFlyoutHeader,
  EuiFormRow,
  EuiLink,
  EuiSpacer,
  EuiTitle,
} from "@elastic/eui";
import FormGenerator, { IField } from "../../../../components/FormGenerator";

interface SplitIndexProps {
  onCloseFlyout: () => void;
  onSplitIndex: (targetIndex: string, numberOfShards: number) => void;
}

export default class SplitIndexFlyout extends Component<SplitIndexProps> {
  state = {
    targetIndex: "",
    value: {},
  };

  render() {
    const { onSplitIndex, onCloseFlyout } = this.props;

    const formFields: IField[] = [
      {
        rowProps: {
          label: "Number of shards",
        },
        name: "number_of_shards",
        type: "Number",
        options: {
          rules: [
            {
              required: true,
            },
          ],
          props: {
            placeholder: "Should be N times of the original index.",
          },
        },
      },
    ];

    return (
      <EuiFlyout ownFocus={false} onClose={onCloseFlyout} maxWidth={600} size="m" hideCloseButton>
        <EuiFlyoutHeader hasBorder>
          <EuiTitle size="m">
            <h2 id="flyoutTitle"> Split Index</h2>
          </EuiTitle>
        </EuiFlyoutHeader>

        <EuiFlyoutBody>
          <EuiFormRow label="Target Index Name">
            <EuiFieldText
              value={this.state.targetIndex}
              onChange={(e) => {
                this.setState({ targetIndex: e.target.value });
              }}
              required={true}
              data-test-subj={"Target Index Name"}
            />
          </EuiFormRow>
          <EuiSpacer />
          <FormGenerator
            value={this.state.value}
            onChange={(totalValue) =>
              this.setState({
                value: totalValue,
              })
            }
            formFields={formFields}
            hasAdvancedSettings
            advancedSettingsProps={{
              accordionProps: {
                initialIsOpen: false,
                id: "accordion_for_create_index_settings",
                buttonContent: <h4>Advanced settings</h4>,
              },
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
          <EuiFlexGroup justifyContent="spaceEvenly">
            <EuiButtonEmpty onClick={onCloseFlyout}>Cancel</EuiButtonEmpty>
            <EuiButton
              data-test-subj="Split Index Confirm"
              onClick={() => onSplitIndex(this.state.targetIndex, this.state.value)}
              fill
              isDisabled={this.state.targetIndex === ""}
            >
              Split
            </EuiButton>
          </EuiFlexGroup>
        </EuiFlyoutFooter>
      </EuiFlyout>
    );
  }
}
