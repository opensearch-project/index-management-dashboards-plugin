/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { Component, useContext } from "react";
import { EuiCallOut, EuiSpacer, EuiTitle, EuiSmallButton, EuiLink, EuiCompressedFormRow, EuiText } from "@elastic/eui";
import { get } from "lodash";

import { CatIndex } from "../../../../../server/models/interfaces";
import { BrowserServices } from "../../../../models/interfaces";
import SplitIndexForm from "../../components/SplitIndexForm";
import { IndexItem } from "../../../../../models/interfaces";
import { RouteComponentProps } from "react-router-dom";
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
import { CoreServicesContext } from "../../../../components/core_services";
import { BREADCRUMBS, ROUTES } from "../../../../utils/constants";
import { EVENT_MAP, destroyListener, listenEvent } from "../../../../JobHandler";
import { ServerResponse } from "../../../../../server/models/types";
import { useUpdateUrlWithDataSourceProperties } from "../../../../components/MDSEnabledComponent";
import { getApplication, getNavigationUI, getUISettings } from "../../../../services/Services";
import { TopNavControlDescriptionData, TopNavControlLinkData } from "src/plugins/navigation/public/top_nav_menu/top_nav_control_data";

interface SplitIndexProps extends RouteComponentProps {
  commonService: CommonService;
  coreService: CoreStart;
  useUpdatedUX: boolean;
}

export class SplitIndex extends Component<SplitIndexProps> {
  static contextType = CoreServicesContext;
  state = {
    reasons: [] as React.ReactChild[],
    shardsSelectOptions: [] as { label: string }[],
    sourceIndex: {} as CatIndex,
    splitIndexFlyoutVisible: false,
    loading: false,
  };

  async componentDidMount() {
    const breadCrumbs = this.props.useUpdatedUX
      ? [BREADCRUMBS.INDICES, { ...BREADCRUMBS.SPLIT_INDEX, href: `#${ROUTES.SPLIT_INDEX}${this.props.location.search}` }]
      : [
          BREADCRUMBS.INDEX_MANAGEMENT,
          BREADCRUMBS.INDICES,
          { ...BREADCRUMBS.SPLIT_INDEX, href: `#${ROUTES.SPLIT_INDEX}${this.props.location.search}` },
        ];
    this.context.chrome.setBreadcrumbs(breadCrumbs);
    const sourceIndex = await this.isSourceIndexReady();
    if (sourceIndex) this.calculateShardsOption(sourceIndex);
    this.setState({
      splitIndexFlyoutVisible: true,
    });
    listenEvent(EVENT_MAP.OPEN_COMPLETE, this.openCompleteHandler);
  }

  componentWillUnmount(): void {
    destroyListener(EVENT_MAP.OPEN_COMPLETE, this.openCompleteHandler);
  }

  openCompleteHandler = () => {
    this.setState({
      loading: false,
    });
    this.isSourceIndexReady();
  };

  isSourceIndexReady = async () => {
    const source = queryString.parse(this.props.location.search) as { source: string };
    let sourceIndex: CatIndex;
    try {
      sourceIndex = await getSingleIndice({
        indexName: source.source,
        commonService: this.props.commonService,
        coreServices: this.props.coreService,
      });
    } catch (err) {
      // no need to log anything since getIndexSettings will log the error
      this.onCancel();
      return;
    }

    this.setState({
      sourceIndex,
    });

    let sourceIndexSettings;
    try {
      sourceIndexSettings = await getIndexSettings({
        indexName: sourceIndex.index,
        flat: true,
        commonService: this.props.commonService,
        coreServices: this.props.coreService,
      });
    } catch (err) {
      // no need to log anything since getIndexSettings will log the error
      this.onCancel();
      return;
    }
    const reasons = [];
    const sourceSettings = get(sourceIndexSettings, [sourceIndex.index, "settings"]);
    const blocksWriteValue = get(sourceSettings, ["index.blocks.write"]);

    if (sourceIndex.health === "red") {
      reasons.push(
        <>
          <EuiCallOut color="danger" iconType="alert" title="The source index must not have a Red health status." />
          <EuiSpacer />
        </>
      );
    }

    if (sourceIndex.status === "close") {
      reasons.push(
        <>
          <EuiCallOut color="danger" iconType="alert" title="The source index must be open.">
            <p>
              You must first open the index before splitting it. Depending on the size of the source index, this may take additional time to
              complete. The index will be in the Red state while the index is opening.
            </p>
            <p>
              <EuiSmallButton
                fill
                isLoading={this.state.loading}
                isDisabled={this.state.loading}
                onClick={() => {
                  this.setState({
                    loading: true,
                  });
                  openIndices({
                    commonService: this.props.commonService,
                    indices: [source.source],
                    coreServices: this.props.coreService,
                    jobConfig: {
                      firstRunTimeout: 5000,
                    },
                  });
                }}
                data-test-subj={"open-index-button"}
              >
                Open index
              </EuiSmallButton>
            </p>
          </EuiCallOut>
          <EuiSpacer />
        </>
      );
    }

    if (sourceSettings && blocksWriteValue !== "true" && blocksWriteValue !== true) {
      const flat = true;
      const blocksWriteSetting = { "index.blocks.write": "true" };
      reasons.push(
        <>
          <EuiCallOut color="danger" iconType="alert" title="The source index must block write operations before splitting.">
            <p>In order to split an existing index, you must first set the index to block write operations.</p>
            <EuiSmallButton
              fill
              onClick={async () => {
                try {
                  await setIndexSettings({
                    indexName: sourceIndex.index,
                    flat,
                    settings: blocksWriteSetting,
                    commonService: this.props.commonService,
                    coreServices: this.props.coreService,
                  });
                  await this.isSourceIndexReady();
                } catch (err) {
                  // no need to log anything since getIndexSettings will log the error
                }
              }}
              data-test-subj={"set-indexsetting-button"}
            >
              Block write operations
            </EuiSmallButton>
          </EuiCallOut>
          <EuiSpacer />
        </>
      );
    }

    this.setState({
      reasons,
    });
    return sourceIndex;
  };

  calculateShardsOption = (sourceIndex: CatIndex) => {
    const sourceShards = Number(sourceIndex.pri);
    const shardsSelectOptions = getSplitShardOptions(sourceShards);
    this.setState({
      shardsSelectOptions,
    });
  };

  onSplitIndex = async (
    targetIndex: string,
    settingsPayload: Required<IndexItem>["settings"]
  ): Promise<ServerResponse<{ task: string }>> => {
    const { sourceIndex } = this.state;
    return await splitIndex({
      sourceIndex: sourceIndex.index,
      targetIndex,
      settingsPayload,
      commonService: this.props.commonService,
      coreServices: this.props.coreService,
    });
  };

  onCancel = () => {
    this.props.history.push(ROUTES.INDICES);
  };

  render() {
    const { sourceIndex, splitIndexFlyoutVisible, reasons, shardsSelectOptions } = this.state;

    const { HeaderControl } = getNavigationUI();
    const { setAppDescriptionControls } = getApplication();

    const descriptionData = [
      {
        description: "Split an existing read-only index into a new index with more primary shards.",
        links: {
          label: "Learn more",
          href: "https://opensearch.org/docs/latest/api-reference/index-apis/split/",
          iconType: "popout",
          iconSide: "right",
          controlType: "link",
        } as TopNavControlLinkData,
      } as TopNavControlDescriptionData,
    ];

    const Common = () => {
      return (
        <>
          {splitIndexFlyoutVisible && (
            <SplitIndexForm
              sourceIndex={sourceIndex.index}
              onSplitIndex={this.onSplitIndex}
              shardsSelectOptions={shardsSelectOptions}
              reasons={reasons}
              onCancel={this.onCancel}
              sourceShards={sourceIndex.pri}
              loading={this.state.loading}
              getAlias={(aliasName) =>
                getAlias({
                  aliasName,
                  commonService: this.props.commonService,
                })
              }
            />
          )}
        </>
      );
    };

    return this.props.useUpdatedUX ? (
      <div style={{ padding: "0px" }}>
        <HeaderControl controls={descriptionData} setMountPoint={setAppDescriptionControls} />
        {Common()}
      </div>
    ) : (
      <div style={{ padding: "0px 50px" }}>
        <EuiText size="s">
          <h1>Split index</h1>
        </EuiText>

        <EuiCompressedFormRow
          fullWidth
          helpText={
            <div>
              Split an existing read-only index into a new index with more primary shards.&nbsp;
              <EuiLink
                href={"https://opensearch.org/docs/latest/api-reference/index-apis/split/"}
                target="_blank"
                rel="noopener noreferrer"
              >
                Learn more
              </EuiLink>
            </div>
          }
        >
          <></>
        </EuiCompressedFormRow>

        <EuiSpacer />

        {Common()}
      </div>
    );
  }
}

export default function SplitIndexWrapper(props: Omit<SplitIndexProps, "commonService" | "coreService">) {
  const services = useContext(ServicesContext) as BrowserServices;
  const coreService = useContext(CoreServicesContext) as CoreStart;
  // in split-index page, user can't change the data source i.e., its in read-only
  useUpdateUrlWithDataSourceProperties();
  const uiSettings = getUISettings();
  const useUpdatedUX = uiSettings.get("home:useNewHomePage");
  return <SplitIndex {...props} commonService={services.commonService} coreService={coreService} useUpdatedUX={useUpdatedUX} />;
}
