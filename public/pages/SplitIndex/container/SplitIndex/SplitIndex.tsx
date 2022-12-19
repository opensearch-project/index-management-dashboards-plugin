/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { Component } from "react";
import { EuiSpacer, EuiTitle, EuiButton, EuiLink, EuiText } from "@elastic/eui";
import { get } from "lodash";

import { CatIndex } from "../../../../../server/models/interfaces";
import { BrowserServices, RecoveryJobMetaData } from "../../../../models/interfaces";
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
  getAlias,
} from "../../../Indices/utils/helpers";

import { CommonService, ServicesContext } from "../../../../services";
import { CoreStart } from "opensearch-dashboards/public";
import { useContext } from "react";
import { CoreServicesContext } from "../../../../components/core_services";
import { BREADCRUMBS, ROUTES } from "../../../../utils/constants";

interface SplitIndexProps extends RouteComponentProps {
  commonService: CommonService;
  coreService: CoreStart;
}

export class SplitIndex extends Component<SplitIndexProps> {
  static contextType = CoreServicesContext;
  state = {
    reasons: [] as React.ReactChild[],
    shardsSelectOptions: [] as { label: string }[],
    sourceIndex: {} as CatIndex,
    splitIndexFlyoutVisible: false,
  };

  async componentDidMount() {
    this.context.chrome.setBreadcrumbs([
      BREADCRUMBS.INDEX_MANAGEMENT,
      BREADCRUMBS.INDICES,
      { ...BREADCRUMBS.SPLIT_INDEX, href: `#${ROUTES.SPLIT_INDEX}${this.props.location.search}` },
    ]);
    await this.isSourceIndexReady();
    this.calculateShardsOption();
    this.setState({
      splitIndexFlyoutVisible: true,
    });
  }

  isSourceIndexReady = async () => {
    const source = queryString.parse(this.props.location.search) as { source: string };
    const sourceIndex = await getSingleIndice({
      indexName: source.source as string,
      commonService: this.props.commonService,
      coreServices: this.props.coreService,
    });
    if (!sourceIndex) {
      return null;
    }
    this.setState({
      sourceIndex,
    });

    const sourceIndexSettings = await getIndexSettings({
      indexName: sourceIndex.index,
      flat: true,
      commonService: this.props.commonService,
      coreServices: this.props.coreService,
    });
    const reasons = [];
    const sourceSettings = get(sourceIndexSettings, [sourceIndex.index, "settings"]);
    const blocksWriteValue = get(sourceSettings, ["index.blocks.write"]);

    if (sourceIndex.health === "red") {
      reasons.push(
        <>
          <b style={{ color: "red", fontSize: 18 }}>The source index must not have a Red health status.</b>
        </>
      );
    }

    if (sourceIndex.status === "close") {
      reasons.push(
        <>
          <p>
            <b style={{ color: "red", fontSize: 18 }}>The source index must be open.</b>
            <br />
            You must first open the index before splitting it. Depending on the size of the source index, this may take additional time to
            complete. The index will be in the Red state while the index is opening.
          </p>
          <p>
            <EuiButton
              fill
              onClick={async () => {
                await openIndices({
                  commonService: this.props.commonService,
                  indices: [source.source],
                  coreServices: this.props.coreService,
                });
                await this.isSourceIndexReady();
              }}
              data-test-subj={"open-index-button"}
            >
              Open index
            </EuiButton>
          </p>
        </>
      );
    }

    if (sourceSettings && (!blocksWriteValue || (blocksWriteValue !== "true" && blocksWriteValue !== true))) {
      const flat = true;
      const blocksWriteSetting = { "index.blocks.write": "true" };
      reasons.push(
        <>
          <p>
            <b style={{ color: "red", fontSize: 18 }}>The source index must be read-only before splitting.</b>
            <br />
            In order to split an existing index, you must first set it to read-only.
          </p>
          <EuiButton
            fill
            onClick={async () => {
              await setIndexSettings({
                indexName: sourceIndex.index,
                flat,
                settings: blocksWriteSetting,
                commonService: this.props.commonService,
                coreServices: this.props.coreService,
              });
              await this.isSourceIndexReady();
            }}
            data-test-subj={"set-indexsetting-button"}
          >
            Set to read-only
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

  onSplitIndex = async (targetIndex: string, settingsPayload: Required<IndexItem>["settings"]): Promise<void> => {
    const { sourceIndex } = this.state;
    const result = await splitIndex({
      sourceIndex: sourceIndex.index,
      targetIndex,
      settingsPayload,
      commonService: this.props.commonService,
      coreServices: this.props.coreService,
    });
    if (result && result.ok) {
      await jobSchedulerInstance.addJob({
        interval: 30000,
        extras: {
          sourceIndex: sourceIndex.index,
          destIndex: targetIndex,
        },
        type: "split",
      } as RecoveryJobMetaData);
    }
  };

  onCancel = () => {
    this.props.history.push(ROUTES.INDICES);
  };

  render() {
    const { sourceIndex, splitIndexFlyoutVisible, reasons, shardsSelectOptions } = this.state;
    return (
      <div style={{ padding: "0px 50px" }}>
        <EuiTitle size="l">
          <h1>Split index</h1>
        </EuiTitle>

        <EuiText color="subdued" size="s" style={{ padding: "5px 0px" }}>
          <p style={{ fontWeight: 200 }}>
            Split an existing read-only index into a new index with more primary shards{" "}
            <EuiLink href={"https://opensearch.org/docs/latest/api-reference/index-apis/split/"} target="_blank" rel="noopener noreferrer">
              Learn more.
            </EuiLink>
          </p>
        </EuiText>

        <EuiSpacer />

        {splitIndexFlyoutVisible && (
          <SplitIndexFlyout
            sourceIndex={sourceIndex.index}
            onSplitIndex={this.onSplitIndex}
            shardsSelectOptions={shardsSelectOptions}
            reasons={reasons}
            onCancel={this.onCancel}
            getAlias={(aliasName) =>
              getAlias({
                aliasName,
                commonService: this.props.commonService,
              })
            }
          />
        )}
      </div>
    );
  }
}

export default function SplitIndexWrapper(props: Omit<SplitIndexProps, "commonService" | "coreService">) {
  const services = useContext(ServicesContext) as BrowserServices;
  const coreService = useContext(CoreServicesContext) as CoreStart;
  return <SplitIndex {...props} commonService={services.commonService} coreService={coreService} />;
}
