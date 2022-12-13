/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { Component } from "react";
import { EuiSpacer, EuiTitle, EuiButton } from "@elastic/eui";
import { get } from "lodash";

import { CatIndex } from "../../../../../server/models/interfaces";
import { RecoveryJobMetaData } from "../../../../models/interfaces";
import SplitIndexFlyout from "../../components/SplitIndexFlyout";
import { IndexItem } from "../../../../../models/interfaces";
import { RouteComponentProps } from "react-router-dom";
import { jobSchedulerInstance } from "../../../../context/JobSchedulerContext";
import queryString from "query-string";
import {
  openIndices,
  getIndexSettings,
  setIndexSettings,
  getSplitShardOptions,
  splitIndex,
  getSingleIndice,
} from "../../../Indices/utils/helpers";

import { CommonService, IndexService } from "../../../../services";

interface SplitIndexProps extends RouteComponentProps {
  commonService: CommonService;
  indexService: IndexService;
}

export default class SplitIndex extends Component<SplitIndexProps> {
  state = {
    reasons: {} as React.ReactChild[],
    shardsSelectOptions: [],
    sourceIndex: {} as CatIndex,
    splitIndexFlyoutVisible: false,
  };

  async componentDidMount() {
    await this.isSourceIndexReady();
    this.calculateShardsOption();
    this.setState({
      splitIndexFlyoutVisible: true,
    });
  }

  isSourceIndexReady = async () => {
    const source = queryString.parse(this.props.location.search);
    const sourceIndex = await getSingleIndice(source.source as string, this.props.indexService, this.context);
    if (!sourceIndex) {
      return null;
    }
    this.setState({
      sourceIndex,
    });

    const sourceIndexSettings = await getIndexSettings(sourceIndex.index, true, this.props.commonService, this.context);
    const reasons = [];
    const sourceSettings = get(sourceIndexSettings, [sourceIndex.index, "settings"]);
    const blocksWriteValue = get(sourceSettings, ["index.blocks.write"]);

    if (sourceIndex.health === "red") {
      reasons.push(<>Source index health must not be red.</>);
    }

    if (sourceIndex.status === "close") {
      reasons.push(
        <>
          Source index must not be in close status. &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          <EuiButton
            fill
            onClick={async () => {
              await openIndices();
              await this.isSourceIndexReady();
            }}
            data-test-subj={"open-index-button"}
          >
            Open index
          </EuiButton>
        </>
      );
    }

    if (sourceSettings && (!blocksWriteValue || (blocksWriteValue !== "true" && blocksWriteValue !== true))) {
      const flat = true;
      const blocksWriteSetting = { "index.blocks.write": "true" };
      reasons.push(
        <>
          Source index must be in block write status. &nbsp;&nbsp;
          <EuiButton
            fill
            onClick={async () => {
              await setIndexSettings(sourceIndex.index, flat, blocksWriteSetting, this.props.commonService, this.context);
              await this.isSourceIndexReady();
            }}
            data-test-subj={"set-indexsetting-button"}
          >
            Set to block write
          </EuiButton>
        </>
      );
    }

    this.setState({
      reasons,
    });
  };

  calculateShardsOption = () => {
    const { sourceIndex } = this.state;
    const sourceShards = Number(sourceIndex.pri);
    const shardsSelectOptions = getSplitShardOptions(sourceShards);
    this.setState({
      shardsSelectOptions,
    });
  };

  onSplitIndex = async (targetIndex: String, settingsPayload: Required<IndexItem>["settings"]) => {
    const { sourceIndex } = this.state;
    const result = await splitIndex(sourceIndex.index, targetIndex, settingsPayload, this.props.commonService, this.context);
    if (result && result.ok) {
      this.context.notifications.toasts.addSuccess(`Successfully submit split index request.`);
      jobSchedulerInstance.addJob({
        interval: 30000,
        extras: {
          sourceIndex: sourceIndex.index,
          destIndex: targetIndex,
        },
        type: "split",
      } as RecoveryJobMetaData);
    } else {
      this.context.notifications.toasts.addDanger(
        result?.error || "There was a problem submit split index request, please check with admin"
      );
    }
  };

  render() {
    const { sourceIndex, splitIndexFlyoutVisible, reasons, shardsSelectOptions } = this.state;
    return (
      <div style={{ padding: "0px 50px" }}>
        <EuiTitle size="l">
          <h1>Split index</h1>
        </EuiTitle>
        <EuiSpacer />

        {splitIndexFlyoutVisible && (
          <SplitIndexFlyout
            sourceIndex={sourceIndex.index}
            onCancel={this.props.onCancel}
            onSplitIndex={this.onSplitIndex}
            shardsSelectOptions={shardsSelectOptions}
            reasons={reasons}
          />
        )}
      </div>
    );
  }
}
