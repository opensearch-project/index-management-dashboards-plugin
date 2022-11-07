/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiAccordion,
  EuiButton,
  EuiText,
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
  EuiLink,
  EuiSpacer,
  EuiCodeEditor,
  EuiTitle,
} from "@elastic/eui";
import React, { Component } from "react";

import { CatIndex } from "../../../../../server/models/interfaces";
import { CoreServicesContext } from "../../../../components/core_services";
import FlyoutFooter from "../../../VisualCreatePolicy/components/FlyoutFooter";
import CustomFormRow from "../../../../components/CustomFormRow";
import { SHRINK_DOCUMENTATION_URL, INDEX_SETTINGS_URL } from "../../../../utils/constants";
import {
  DEDAULT_ADVANCED_INDEX_SETTINGS,
  INDEX_NUMBER_OF_SHARDS_SETTING,
  INDEX_BLOCKS_WRITE_SETTING,
  INDEX_BLOCKS_READONLY_SETTING,
  INDEX_BLOCKS_METADATA_SETTING,
  INDEX_ROUTING_ALLOCATION_SETTING,
  TARGET_INDEX_NAME_REQUIRED_MESSAGE,
} from "./constants";
import _ from "lodash";

interface ShrinkIndexProps {
  sourceIndex: CatIndex;
  onClose: () => void;
  onConfirm: (sourceIndexName: string, targetIndexName: string, indexSettings: {}) => void;
  getIndexSettings: (indexName: string, flat: boolean) => Promise<Object>;
}

interface ShrinkIndexState {
  targetIndexName: string;
  numberOfShards: number;
  advancedIndexSettingsString: string;
  targetIndexNameError: string;
  numberOfShardsError: string;
  sourceIndexCannotShrinkErrors: string[];
  sourceIndexNotReadyReasons: string[];
}

export default class ShrinkIndexFlyout extends Component<ShrinkIndexProps, ShrinkIndexState> {
  static contextType = CoreServicesContext;
  constructor(props: ShrinkIndexProps) {
    super(props);

    this.state = {
      targetIndexName: "",
      numberOfShards: 1,
      advancedIndexSettingsString: JSON.stringify(DEDAULT_ADVANCED_INDEX_SETTINGS, null, 4),
      targetIndexNameError: TARGET_INDEX_NAME_REQUIRED_MESSAGE,
      numberOfShardsError: "",
      sourceIndexCannotShrinkErrors: [],
      sourceIndexNotReadyReasons: [],
    };
  }

  async componentDidMount() {
    await this.isSourceIndexReady();
  }

  onClickAction = () => {
    const { sourceIndex, onConfirm } = this.props;
    const { targetIndexName, targetIndexNameError, numberOfShards, numberOfShardsError, advancedIndexSettingsString } = this.state;
    if (!!targetIndexNameError || !!numberOfShardsError) {
      return;
    }

    let indexSettings = {};
    try {
      if (!!advancedIndexSettingsString) {
        indexSettings = JSON.parse(advancedIndexSettingsString);
      }
      indexSettings[INDEX_NUMBER_OF_SHARDS_SETTING] = numberOfShards;
    } catch (err) {
      this.context.notifications.toasts.addDanger("Invalid advanced settings JSON");
      return;
    }
    onConfirm(sourceIndex.index, targetIndexName, indexSettings);
  };

  isSourceIndexReady = async () => {
    const { sourceIndex, getIndexSettings } = this.props;
    const sourceIndexCannotShrinkErrors = [];
    let reason = "";

    // Show danger errors and disable the Shrink button if the source index is red or closed, or only has one primary shard.
    if (sourceIndex.health == "red") {
      sourceIndexCannotShrinkErrors.push("The index's health status is [red]!");
    }
    if (sourceIndex.pri == "1") {
      sourceIndexCannotShrinkErrors.push("The index has only one primary shard!");
    }
    if (sourceIndex.status == "close") {
      sourceIndexCannotShrinkErrors.push("The index is closed!");
    }
    if (sourceIndexCannotShrinkErrors.length > 0) {
      this.setState({
        sourceIndexCannotShrinkErrors: sourceIndexCannotShrinkErrors,
      });
      return;
    }

    const sourceIndexNotReadyReasons = [];
    const indexSettings = await getIndexSettings(sourceIndex.index, true);

    // Check whether `index.blocks.read_only` or `index.blocks.metadata` is set firstly,
    // because shrink operation will timeout and then the new shrunkend index's shards cannot be allocated.
    if (!!indexSettings && indexSettings.hasOwnProperty(sourceIndex.index)) {
      if (
        !!indexSettings[sourceIndex.index]["settings"][INDEX_BLOCKS_READONLY_SETTING] ||
        !!indexSettings[sourceIndex.index]["settings"][INDEX_BLOCKS_METADATA_SETTING]
      ) {
        reason =
          "Index setting [" +
          INDEX_BLOCKS_READONLY_SETTING +
          "] or [" +
          INDEX_BLOCKS_METADATA_SETTING +
          "] is [true], this will cause the new shrunken index's shards to be unassigned.";
        sourceIndexNotReadyReasons.push(reason);
      }
    }

    // It's better to do shrink when the source index is green.
    if (sourceIndex.health != "green") {
      reason = "The index's health is not green.";
      sourceIndexNotReadyReasons.push(reason);
    }

    // `index.blocks.write` setting is required.
    if (
      !!indexSettings &&
      indexSettings.hasOwnProperty(sourceIndex.index) &&
      !indexSettings[sourceIndex.index]["settings"][INDEX_BLOCKS_WRITE_SETTING]
    ) {
      reason = "Index setting [index.blocks.write] is not [true].";
      sourceIndexNotReadyReasons.push(reason);
    }

    // This check may not be correct in the following situations:
    // 1. the cluster only has one node, so the source index's shards are allocated to the same node.
    // 2. the primary shards of the source index are just allocated to the same node, not manually.
    // 3. the user set `index.routing.rebalance.enable` to `none` and then manually move one copy of every shards to one node.
    // In the above situations, the source index does not have a `index.routing.allocation.require._*` setting which can
    // rellocate one copy of every shard to one node, but it can also execute shrinking successfully if other conditions are met.
    // But in most cases, source index always have many shards distributed on different node,
    // so index.routing.allocation.require._*` setting is required.
    // In above, we just show a warning in the page, it does not affect any button or form.
    if (!!indexSettings && indexSettings.hasOwnProperty(sourceIndex.index)) {
      let shardsAllocatedToOneNode = false;
      const settings = indexSettings[sourceIndex.index]["settings"];
      for (let settingKey in settings) {
        if (settingKey.startsWith(INDEX_ROUTING_ALLOCATION_SETTING)) {
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
        sourceIndexNotReadyReasons: sourceIndexNotReadyReasons,
      });
    }
  };

  onTargetIndexNameChange = (value: string) => {
    let err = "";
    if (!value.trim()) {
      err = TARGET_INDEX_NAME_REQUIRED_MESSAGE;
    }
    this.setState({
      targetIndexName: value,
      targetIndexNameError: err,
    });
  };

  checkNumberOfShardsValid = (sourceShardsNum: number, targetShardsNum: number): string => {
    let err = "";
    if (targetShardsNum <= 0 || sourceShardsNum % targetShardsNum != 0) {
      err = "The number of new primary shards must be a positive factor of the number of primary shards in the source index.";
    }
    return err;
  };

  onNumberOfShardsChange = (value: number) => {
    const { sourceIndex } = this.props;
    const { advancedIndexSettingsString } = this.state;
    const shardsNumErr = this.checkNumberOfShardsValid(sourceIndex.pri, value);

    let indexSettings;
    try {
      indexSettings = JSON.parse(advancedIndexSettingsString);
      indexSettings[INDEX_NUMBER_OF_SHARDS_SETTING] = value;
      this.setState({
        numberOfShards: value,
        numberOfShardsError: shardsNumErr,
        advancedIndexSettingsString: JSON.stringify(indexSettings, null, 4),
      });
    } catch (err) {
      this.setState({
        numberOfShards: value,
        numberOfShardsError: shardsNumErr,
      });
    }
  };

  onAdvancedIndexSettingsChange = (value: string) => {
    const { sourceIndex } = this.props;
    const { numberOfShards } = this.state;
    let indexSettings;
    try {
      indexSettings = JSON.parse(value);
      const newNumberOfShards = indexSettings[INDEX_NUMBER_OF_SHARDS_SETTING];
      if (!!newNumberOfShards && newNumberOfShards != numberOfShards) {
        const err = this.checkNumberOfShardsValid(sourceIndex.pri, newNumberOfShards);
        this.setState({
          numberOfShards: newNumberOfShards,
          numberOfShardsError: err,
          advancedIndexSettingsString: value,
        });
      } else {
        this.setState({
          advancedIndexSettingsString: value,
        });
      }
    } catch (err) {
      this.setState({
        advancedIndexSettingsString: value,
      });
    }
  };

  render() {
    const { onClose } = this.props;
    const {
      targetIndexName,
      numberOfShards,
      advancedIndexSettingsString,
      targetIndexNameError,
      numberOfShardsError,
      sourceIndexCannotShrinkErrors,
      sourceIndexNotReadyReasons,
    } = this.state;

    return (
      <EuiFlyout ownFocus={true} onClose={() => {}} maxWidth={600} size="m" hideCloseButton>
        <EuiFlyoutHeader hasBorder>
          <EuiTitle size="m">
            <h2 id="flyoutTitle"> Shrink index</h2>
          </EuiTitle>
        </EuiFlyoutHeader>
        <EuiFlyoutBody>
          <EuiCallOut color="danger" hidden={sourceIndexCannotShrinkErrors.length == 0}>
            <div style={{ lineHeight: 1.5 }}>
              <p>The source index cannot shrink, due to the following reasons:</p>
              <ul>
                {sourceIndexCannotShrinkErrors.map((reason) => (
                  <li key={reason}>{reason}</li>
                ))}
              </ul>
              <EuiLink href={SHRINK_DOCUMENTATION_URL} target="_blank" rel="noopener noreferrer">
                Learn more
              </EuiLink>
            </div>
          </EuiCallOut>
          <EuiCallOut color="warning" hidden={sourceIndexCannotShrinkErrors.length != 0 || sourceIndexNotReadyReasons.length == 0}>
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
          <EuiSpacer size="m" />
          <CustomFormRow label="Source index">
            <EuiFieldText value={this.props.sourceIndex.index} data-test-subj="sourceIndexForm" readOnly />
          </CustomFormRow>
          <EuiSpacer size="m" />
          <CustomFormRow
            label="Target index"
            helpText={"The name of the new shrunken index."}
            isInvalid={!!targetIndexNameError}
            error={targetIndexNameError}
          >
            <EuiFieldText
              value={targetIndexName}
              onChange={(e) => {
                this.onTargetIndexNameChange(e.target.value);
              }}
              isInvalid={!!targetIndexNameError}
              data-test-subj="targetIndexNameInput"
            />
          </CustomFormRow>
          <EuiSpacer size="m" />
          <CustomFormRow
            label="Number of shards"
            helpText={"The number of primary shards in the new shrunken index."}
            isInvalid={!!numberOfShardsError}
            error={numberOfShardsError}
          >
            <EuiFieldNumber
              value={numberOfShards}
              onChange={(e) => {
                this.onNumberOfShardsChange(e.target.value);
              }}
              min={1}
              max={Number(this.props.sourceIndex.pri)}
              isInvalid={!!numberOfShardsError}
              data-test-subj="numberOfShardsInput"
            />
          </CustomFormRow>
          <EuiSpacer size="m" />
          <EuiAccordion id="shrink_index_advanced_settings" buttonContent="Advanced settings">
            <EuiSpacer size="s" />
            <EuiText color="subdued" size="xs" style={{ padding: "5px 0px" }}>
              <p style={{ fontWeight: 200 }}>
                Specify more index settings for the target index.{" "}
                <EuiLink href={INDEX_SETTINGS_URL} target="_blank" rel="noopener noreferrer">
                  Learn more
                </EuiLink>
              </p>
            </EuiText>
            <EuiCodeEditor
              mode="json"
              width="90%"
              height="250px"
              value={advancedIndexSettingsString}
              onChange={(str) => {
                this.onAdvancedIndexSettingsChange(str);
              }}
              setOptions={{ fontSize: "14px" }}
            />
          </EuiAccordion>
        </EuiFlyoutBody>
        <EuiFlyoutFooter>
          <EuiFlexGroup justifyContent="flexEnd">
            <EuiFlexItem grow={false}>
              <EuiButtonEmpty onClick={onClose} flush="left" data-test-subj="shrinkIndexCloseButton">
                Cancel
              </EuiButtonEmpty>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiButton
                onClick={this.onClickAction}
                fill
                data-test-subj="shrinkIndexConfirmButton"
                disabled={sourceIndexCannotShrinkErrors.length != 0}
              >
                Shrink index
              </EuiButton>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlyoutFooter>
      </EuiFlyout>
    );
  }
}
