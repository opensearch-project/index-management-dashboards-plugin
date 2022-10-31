/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiAccordion,
  EuiButton,
  EuiButtonEmpty,
  EuiCallOut,
  EuiFieldNumber,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutFooter,
  EuiFlyoutHeader,
  EuiFormRow,
  EuiLink,
  EuiSpacer,
  EuiTitle,
} from "@elastic/eui";
import React, { Component } from "react";

import { CatIndex } from "../../../../../server/models/interfaces";
import EuiFormCustomLabel from "../../../VisualCreatePolicy/components/EuiFormCustomLabel";
import FlyoutFooter from "../../../VisualCreatePolicy/components/FlyoutFooter";
import { SHRINK_DOCUMENTATION_URL } from "../../../../utils/constants";
import _ from "lodash";

interface ShrinkIndexProps {
  sourceIndex: CatIndex;
  onClose: () => void;
  onConfirm: (sourceIndexName: string, targetIndexName: string) => void;
  getIndexSettings: (indexName: string, flat: boolean) => Promise<Object>;
}

interface ShrinkIndexState {
  targetIndexName: string;
  numberOfShards: number;
  alias: string;
  targetIndexNameError: string;
  numberOfShardsError: string;
  sourceIndexReady: boolean;
  sourceIndexNotReadyReasons: string[];
}

export default class ShrinkIndexFlyout extends Component<ShrinkIndexProps, ShrinkIndexState> {
  constructor(props: ShrinkIndexProps) {
    super(props);

    this.state = {
      targetIndexName: "",
      numberOfShards: 1,
      alias: "",
      targetIndexNameError: "",
      numberOfShardsError: "",
      sourceIndexReady: true,
      sourceIndexNotReadyReasons: [],
    };
  }

  async componentDidMount() {
    await this.isSourceIndexReady();
  }

  onClickAction = () => {
    const { sourceIndex, onConfirm } = this.props;
    const { targetIndexName, numberOfShards, alias } = this.state;
    let targetIndexNameError = "";
    if (!targetIndexName.trim()) {
      this.setState({ targetIndexNameError: "Name of the target index required" });
      return;
    }
    onConfirm(sourceIndex.index, targetIndexName, numberOfShards, alias);
  };

  isSourceIndexReady = async () => {
    const { sourceIndex, getIndexSettings } = this.props;
    const sourceIndexNotReadyReasons = [];
    let reason = "";
    if (sourceIndex.health != "green") {
      reason = "The source index's health is not green.";
      sourceIndexNotReadyReasons.push(reason);
    }

    const indexSettings = await getIndexSettings(sourceIndex.index, true);
    if (!!indexSettings && !indexSettings[sourceIndex.index]["settings"]["index.blocks.write"]) {
      reason = "Index setting `index.blocks.write` is not `true`.";
      sourceIndexNotReadyReasons.push(reason);
    }

    if (!!indexSettings) {
      let shardsAllocatedToOneNode = false;
      const settings = indexSettings[sourceIndex.index]["settings"];
      for (let settingKey in settings) {
        if (settingKey.startsWith("index.routing.allocation.require")) {
          shardsAllocatedToOneNode = true;
          break;
        }
      }
      if (!shardsAllocatedToOneNode) {
        reason = "One copy of every shard should be allocated to one node.";
        sourceIndexNotReadyReasons.push(reason);
      }
    }

    if (sourceIndexNotReadyReasons.length > 0) {
      this.setState({
        sourceIndexReady: false,
        sourceIndexNotReadyReasons: sourceIndexNotReadyReasons,
      });
    }
  };

  isValidNumberOfShards = () => {
    const { sourceIndex } = this.props;
    const { numberOfShards } = this.state;
    return numberOfShards > 0 && sourceIndex.pri % numberOfShards == 0;
  };

  render() {
    const { onClose } = this.props;
    const {
      targetIndexName,
      numberOfShards,
      alias,
      targetIndexNameError,
      numberOfShardsError,
      sourceIndexReady,
      sourceIndexNotReadyReasons,
    } = this.state;

    return (
      <EuiFlyout ownFocus={false} onClose={onClose} maxWidth={600} size="m" hideCloseButton>
        <EuiFlyoutHeader hasBorder>
          <EuiTitle size="m">
            <h2 id="flyoutTitle"> Shrink index</h2>
          </EuiTitle>
        </EuiFlyoutHeader>
        <EuiFlyoutBody>
          <EuiCallOut color="warning" hidden={sourceIndexReady}>
            <div style={{ lineHeight: 1.5 }}>
              <p>The source index is not ready to shrink, may due to the following reasons:</p>
              <ul>
                {sourceIndexNotReadyReasons.map((reason) => (
                  <li key={reason}>{reason}</li>
                ))}
              </ul>
              <EuiLink href={SHRINK_DOCUMENTATION_URL} target="_blank" rel="noopener noreferrer">
                Learn more
              </EuiLink>
            </div>
          </EuiCallOut>
          <EuiFormCustomLabel title="Source index" />
          <EuiFormRow>
            <EuiFieldText value={this.props.sourceIndex.index} data-test-subj="sourceIndexForm" readOnly />
          </EuiFormRow>
          <EuiSpacer size="m" />
          <EuiFormCustomLabel title="Target index" helpText={"The name of the new shrunken index."} isInvalid={!!targetIndexNameError} />
          <EuiFormRow isInvalid={!!targetIndexNameError} error={targetIndexNameError}>
            <EuiFieldText
              value={targetIndexName}
              onChange={(e) => {
                this.setState({ targetIndexName: e.target.value });
              }}
              data-test-subj="targetIndexNameInput"
            />
          </EuiFormRow>
          <EuiSpacer size="m" />
          <EuiFormCustomLabel
            title="Number of shards"
            helpText={"The number of primary shards in the new shrunken index."}
            isInvalid={!this.isValidNumberOfShards()}
          />
          <EuiFormRow isInvalid={!this.isValidNumberOfShards()} error={numberOfShardsError}>
            <EuiFieldNumber
              value={numberOfShards}
              onChange={(e) => {
                let err = "";
                if (e.target.value <= 0 || this.props.sourceIndex.pri % e.target.value != 0) {
                  err = "The number of new primary shards must be a positive factor of the number of primary shards in the source index.";
                }
                this.setState({
                  numberOfShards: e.target.value,
                  numberOfShardsError: err,
                });
              }}
              min={1}
              max={Number(this.props.sourceIndex.pri)}
              data-test-subj="numberOfShardsInput"
            />
          </EuiFormRow>
          <EuiSpacer size="m" />
          <EuiFormCustomLabel title="Alias" helpText={"The alias to be applied to the new shrunken index."} isOptional={true} />
          <EuiFormRow>
            <EuiFieldText
              value={alias}
              onChange={(e) => {
                this.setState({ alias: e.target.value });
              }}
              data-test-subj="aliasInput"
            />
          </EuiFormRow>
        </EuiFlyoutBody>
        <EuiFlyoutFooter>
          <EuiFlexGroup justifyContent="flexEnd">
            <EuiFlexItem grow={false}>
              <EuiButtonEmpty onClick={onClose} flush="left" data-test-subj="flyout-footer-cancel-button">
                Cancel
              </EuiButtonEmpty>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiButton onClick={this.onClickAction} fill data-test-subj="flyout-footer-action-button">
                Shrink index
              </EuiButton>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlyoutFooter>
      </EuiFlyout>
    );
  }
}
