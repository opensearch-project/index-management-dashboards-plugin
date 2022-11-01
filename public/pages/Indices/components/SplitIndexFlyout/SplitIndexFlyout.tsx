/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { Component } from "react";
import {
  EuiButtonEmpty,
  EuiButton,
  EuiFieldNumber,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutFooter,
  EuiFlyoutHeader,
  EuiFormRow,
  EuiTitle,
} from "@elastic/eui";
import CustomLabel from "../../../../components/CustomLabel";

interface SplitIndexProps {
  onCloseFlyout: () => void;
  onSplitIndex: (targetIndex: string, numberOfShards: number) => void;
}

export default class SplitIndexFlyout extends Component<SplitIndexProps> {
  state = {
    targetIndex: "",
    numberOfShards: 0,
  };

  render() {
    const { onSplitIndex, onCloseFlyout } = this.props;

    return (
      <EuiFlyout ownFocus={false} onClose={onCloseFlyout} maxWidth={600} size="m" hideCloseButton>
        <EuiFlyoutHeader hasBorder>
          <EuiTitle size="m">
            <h2 id="flyoutTitle"> Split Index</h2>
          </EuiTitle>
        </EuiFlyoutHeader>

        <EuiFlyoutBody>
          <CustomLabel title="New Index Name" />
          <EuiFormRow>
            <EuiFieldText
              value={this.state.targetIndex}
              onChange={(e) => {
                this.setState({ targetIndex: e.target.value });
              }}
              data-test-subj="New Index Name"
            />
          </EuiFormRow>
        </EuiFlyoutBody>

        <EuiFlyoutBody>
          <CustomLabel title="Number of shards" />
          <EuiFormRow>
            <EuiFieldNumber
              value={this.state.numberOfShards}
              min={2}
              onChange={(e) => {
                this.setState({ numberOfShards: e.target.value });
              }}
              data-test-subj="Number of shards"
            />
          </EuiFormRow>
        </EuiFlyoutBody>

        <EuiFlyoutFooter>
          <EuiFlexGroup justifyContent="spaceEvenly">
            <EuiButtonEmpty onClick={onCloseFlyout}>Cancel</EuiButtonEmpty>
            <EuiButton
              data-test-subj="Split Index Confirm"
              onClick={() => onSplitIndex(this.state.targetIndex, this.state.numberOfShards)}
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
