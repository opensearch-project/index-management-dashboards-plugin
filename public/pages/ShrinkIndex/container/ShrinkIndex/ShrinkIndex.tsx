/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiSmallButton,
  EuiSmallButtonEmpty,
  EuiCallOut,
  EuiFlexGroup,
  EuiFlexItem,
  EuiLink,
  EuiSpacer,
  EuiTitle,
  EuiCompressedFormRow,
  EuiLoadingSpinner,
} from "@elastic/eui";
import React, { Component } from "react";

import { CatIndex } from "../../../../../server/models/interfaces";
import FormGenerator, { IField, IFormGeneratorRef } from "../../../../components/FormGenerator";
import { ContentPanel } from "../../../../components/ContentPanel";
import IndexDetail from "../../../../containers/IndexDetail";
import { IndexItem } from "../../../../../models/interfaces";
import { IFieldComponentProps } from "../../../../components/FormGenerator/built_in_components";
import AliasSelect from "../../../../components/AliasSelect";
import EuiToolTipWrapper from "../../../../components/EuiToolTipWrapper";
import { CommonService } from "../../../../services";
import { RouteComponentProps } from "react-router-dom";
import {
  SHRINK_DOCUMENTATION_URL,
  INDEX_SETTINGS_URL,
  ROUTES,
  INDEX_NAMING_MESSAGE,
  REPLICA_NUMBER_MESSAGE,
  ALIAS_SELECT_RULE,
} from "../../../../utils/constants";
import { BREADCRUMBS } from "../../../../utils/constants";
import queryString from "query-string";
import { jobSchedulerInstance } from "../../../../context/JobSchedulerContext";
import { RecoveryJobMetaData } from "../../../../models/interfaces";
import { getClusterInfo, getErrorMessage } from "../../../../utils/helpers";
import { ServerResponse } from "../../../../../server/models/types";
import { CoreServicesContext } from "../../../../components/core_services";
import { DEFAULT_INDEX_SETTINGS, INDEX_BLOCKS_WRITE_SETTING, INDEX_BLOCKS_READONLY_SETTING } from "../../utils/constants";
import { get } from "lodash";
import NotificationConfig from "../../../../containers/NotificationConfig";
import { ActionType, OperationType } from "../../../Notifications/constant";
import { NotificationConfigRef } from "../../../../containers/NotificationConfig/NotificationConfig";
import { ListenType } from "../../../../lib/JobScheduler";
import { openIndices } from "../../../Indices/utils/helpers";
import { EVENT_MAP, destroyListener, listenEvent } from "../../../../JobHandler";

const WrappedAliasSelect = EuiToolTipWrapper(AliasSelect as any, {
  disabledKey: "isDisabled",
});

interface ShrinkIndexProps extends RouteComponentProps {
  commonService: CommonService;
}

interface ShrinkIndexState {
  sourceIndex: CatIndex;
  requestPayload: Required<IndexItem>["settings"];
  sourceIndexSettings: Object;
  loading: boolean;
}

export default class ShrinkIndex extends Component<ShrinkIndexProps, ShrinkIndexState> {
  static contextType = CoreServicesContext;

  destroyed: boolean = false;

  constructor(props: ShrinkIndexProps) {
    super(props);

    this.state = {
      sourceIndex: {} as CatIndex,
      requestPayload: DEFAULT_INDEX_SETTINGS,
      sourceIndexSettings: {},
      loading: false,
    };
  }

  async componentDidMount() {
    this.context.chrome.setBreadcrumbs([
      BREADCRUMBS.INDEX_MANAGEMENT,
      BREADCRUMBS.INDICES,
      { ...BREADCRUMBS.SHRINK_INDEX, href: `#${this.props.location.pathname}${this.props.location.search}` },
    ]);
    const { source } = queryString.parse(this.props.location.search);
    if (typeof source === "string" && !!source) {
      await this.getIndex(source);
    } else {
      const errorMessage = !source ? "Index is empty." : `Cound not find the index: ${source}.`;
      this.context.notifications.toasts.addDanger(errorMessage);
      this.props.history.push(ROUTES.INDICES);
    }
    listenEvent(EVENT_MAP.OPEN_COMPLETE, this.openCompleteHandler);
  }

  componentWillUnmount(): void {
    destroyListener(EVENT_MAP.OPEN_COMPLETE, this.openCompleteHandler);
    this.destroyed = true;
  }

  openCompleteHandler = () => {
    this.setState({
      loading: false,
    });
    // refresh status
    this.getIndex(this.state.sourceIndex.index);
  };

  getIndex = async (indexName: string) => {
    try {
      const { commonService } = this.props;
      const result: ServerResponse<CatIndex[]> = await commonService.apiCaller({
        endpoint: "cat.indices",
        data: {
          index: [indexName],
          format: "json",
        },
      });

      if (result.ok && result.response.length > 0) {
        this.setState({
          sourceIndex: result.response[0],
        });
        await this.isSourceIndexReady();
      } else {
        const errorMessage = result.ok ? `Index ${indexName} does not exist` : result.error;
        this.context.notifications.toasts.addDanger(`Could not shrink index: ${errorMessage}`);
        this.props.history.push(ROUTES.INDICES);
      }
    } catch (err) {
      this.context.notifications.toasts.addDanger(getErrorMessage(err, "There was a problem getting index."));
      this.props.history.push(ROUTES.INDICES);
    }
  };

  formRef: IFormGeneratorRef | null = null;
  notificationRef: NotificationConfigRef | null = null;

  onClickAction = async () => {
    const { sourceIndex } = this.state;
    const { targetIndex, ...others } = this.state.requestPayload;

    const result = await this.formRef?.validatePromise();
    if (result?.errors) {
      return;
    }
    const notificationsResult = await this.notificationRef?.validatePromise();
    if (notificationsResult?.errors) {
      return;
    }
    this.shrinkIndex(sourceIndex.index, targetIndex, others);
  };

  onCancel = () => {
    this.props.history.push(ROUTES.INDICES);
  };

  shrinkIndex = async (sourceIndexName: string, targetIndexName: string, requestPayload: Required<IndexItem>["settings"]) => {
    this.setState({
      loading: true,
    });
    try {
      const { commonService } = this.props;
      const { aliases, ...settings } = requestPayload;

      const result = await commonService.apiCaller<{
        task: string;
      }>({
        endpoint: "transport.request",
        data: {
          path: `/${sourceIndexName}/_shrink/${targetIndexName}?wait_for_completion=false`,
          method: "PUT",
          body: {
            settings,
            aliases,
          },
        },
      });
      if (result && result.ok) {
        await this.notificationRef?.associateWithTask({
          taskId: result.response?.task,
        });
        const toastInstance = this.context.notifications.toasts.addSuccess(
          `Successfully started shrinking ${sourceIndexName}. The shrunken index will be named ${targetIndexName}.`,
          {
            toastLifeTimeMs: 1000 * 60 * 60 * 24 * 5,
          }
        );
        this.onCancel();
        const clusterInfo = await getClusterInfo({
          commonService,
        });
        jobSchedulerInstance.addJob({
          interval: 30000,
          extras: {
            clusterInfo,
            toastId: toastInstance.id,
            sourceIndex: sourceIndexName,
            destIndex: targetIndexName,
            taskId: result.response?.task,
          },
          type: ListenType.SHRINK,
        } as RecoveryJobMetaData);
      } else {
        this.context.notifications.toasts.addDanger(result.error);
      }
    } catch (err) {
      this.context.notifications.toasts.addDanger(getErrorMessage(err, "There was a problem shrinking index."));
    }
    if (this.destroyed) {
      return;
    }
    this.setState({
      loading: false,
    });
  };

  getIndexSettings = async (indexName: string, flat: boolean): Promise<Record<string, IndexItem> | void> => {
    try {
      const { commonService } = this.props;
      const result: ServerResponse<Record<string, IndexItem>> = await commonService.apiCaller({
        endpoint: "indices.getSettings",
        data: {
          index: indexName,
          flat_settings: flat,
        },
      });
      if (result && result.ok) {
        return result.response;
      } else {
        const errorMessage = `There was a problem getting index setting for ${indexName}, please check with Admin.`;
        this.context.notifications.toasts.addDanger(result?.error || errorMessage);
      }
    } catch (err) {
      this.context.notifications.toasts.addDanger(getErrorMessage(err, "There was a problem getting index settings."));
    }
  };

  setIndexSettings = async (indexName: string, settings: {}) => {
    try {
      const { commonService } = this.props;
      const result = await commonService.apiCaller({
        endpoint: "indices.putSettings",
        method: "PUT",
        data: {
          index: indexName,
          body: {
            settings: {
              ...settings,
            },
          },
        },
      });
      if (result && result.ok) {
        this.context.notifications.toasts.addSuccess(`${indexName} has been set to block write operations.`);
      } else {
        const errorMessage = `There was a problem updating index setting for ${indexName}, please check with Admin`;
        this.context.notifications.toasts.addDanger(result?.error || errorMessage);
      }
    } catch (err) {
      this.context.notifications.toasts.addDanger(getErrorMessage(err, "There was a problem updating index settings."));
    }
  };

  getAlias = async (aliasName: string) => {
    try {
      const { commonService } = this.props;
      return await commonService.apiCaller<{ alias: string }[]>({
        endpoint: "cat.aliases",
        method: "GET",
        data: {
          format: "json",
          name: `${aliasName || ""}*`,
          s: "alias:desc",
        },
      });
    } catch (err) {
      this.context.notifications.toasts.addDanger(getErrorMessage(err, "There was a problem getting aliases."));
    }
  };

  openIndex = async (index: string) => {
    this.setState({
      loading: true,
    });
    openIndices({
      indices: [index],
      commonService: this.props.commonService,
      coreServices: this.context,
      jobConfig: {
        firstRunTimeout: 5000,
      },
    });
  };

  isSourceIndexReady = async () => {
    const { sourceIndex } = this.state;
    const indexSettings = await this.getIndexSettings(sourceIndex.index, true);
    if (!!indexSettings) {
      this.setState({
        sourceIndexSettings: indexSettings,
      });
    }
  };

  onUpdateIndexSettings = async (indexName: string, settings: {}) => {
    await this.setIndexSettings(indexName, settings);

    // refresh index settings
    const indexSettings = await this.getIndexSettings(indexName, true);
    if (!!indexSettings) {
      this.setState({
        sourceIndexSettings: indexSettings,
      });
    }
  };

  onOpenIndex = async () => {
    const { sourceIndex } = this.state;
    await this.openIndex(sourceIndex.index);
  };

  render() {
    const { sourceIndex } = this.state;
    if (!sourceIndex.index) {
      return (
        <EuiFlexGroup justifyContent="center" alignItems="center" style={{ marginTop: "100px" }}>
          <EuiLoadingSpinner size="xl" />
        </EuiFlexGroup>
      );
    }
    const { requestPayload, sourceIndexSettings } = this.state;
    const sourceIndexNotReadyToShrinkReasons: React.ReactChild[] = [];
    let disableShrinkButton = false;
    const blockNameList = ["targetIndex"];

    if (sourceIndex.health === "red") {
      disableShrinkButton = true;
      sourceIndexNotReadyToShrinkReasons.push(
        <>
          <EuiCallOut title="The source index must be in green health status." color="danger" iconType="alert">
            <p>
              The index is in red health status and may be running operations in the background. We recommend to wait until the index
              becomes green to continue shrinking.
            </p>
          </EuiCallOut>
          <EuiSpacer />
        </>
      );
    }

    if (sourceIndex.pri === "1") {
      disableShrinkButton = true;
      sourceIndexNotReadyToShrinkReasons.push(
        <>
          <EuiCallOut title="Cannot shrink source index with only one primary shard." color="danger" iconType="alert"></EuiCallOut>
          <EuiSpacer />
        </>
      );
    }

    // check index settings only if the source index is not red or has more than one primary shard.
    if (sourceIndexNotReadyToShrinkReasons.length == 0) {
      const indexWriteBlock = get(sourceIndexSettings, [sourceIndex.index, "settings", INDEX_BLOCKS_WRITE_SETTING]);
      if (indexWriteBlock !== "true" && indexWriteBlock !== true) {
        disableShrinkButton = true;
        sourceIndexNotReadyToShrinkReasons.push(
          <>
            <EuiCallOut title="The source index must block write operations before shrinking." color="danger" iconType="alert">
              <p>In order to shrink an existing index, you must first set the index to block write operations.</p>
              <EuiSpacer />
              <EuiSmallButton
                onClick={() => {
                  const indexWriteBlockSettings = {
                    "index.blocks.write": true,
                  };
                  this.onUpdateIndexSettings(sourceIndex.index, indexWriteBlockSettings);
                }}
                fill
                data-test-subj="onSetIndexWriteBlockButton"
              >
                Block write operations
              </EuiSmallButton>
            </EuiCallOut>
            <EuiSpacer />
          </>
        );
      }

      if (sourceIndex.status === "close") {
        disableShrinkButton = true;
        sourceIndexNotReadyToShrinkReasons.push(
          <>
            <EuiCallOut title="The source index must be open." color="danger" iconType="alert">
              <p>
                You must first open the index before shrinking it. Depending on the size of the source index, this may take additional time
                to complete. The index will be in red health status while the index is opening.
              </p>
              <EuiSpacer />
              <EuiSmallButton
                onClick={() => {
                  this.onOpenIndex();
                }}
                isLoading={this.state.loading}
                isDisabled={this.state.loading}
                fill
                data-test-subj="onOpenIndexButton"
              >
                Open index
              </EuiSmallButton>
            </EuiCallOut>
            <EuiSpacer />
          </>
        );
      }

      // show warnings only if the source index is not red, has more than one primary shard, has write block
      // and not in close status.
      if (sourceIndexNotReadyToShrinkReasons.length === 0) {
        // It's better to do shrink when the source index's health status is green, but the user can still do shrink when the source index's health status
        // is yellow, we only give a warning to the user.
        if (sourceIndex.health === "yellow") {
          sourceIndexNotReadyToShrinkReasons.push(
            <>
              <EuiCallOut title="We recommend shrinking index with a green health status." color="warning" iconType="help">
                <p>
                  The source index is in yellow health status. To prevent issues with initializing the new shrunken index, we recommend
                  shrinking an index with a green health status.
                </p>
              </EuiCallOut>
              <EuiSpacer />
            </>
          );
        }

        // Check whether `index.blocks.read_only` is set to `true`,
        // because shrink operation will timeout and then the new shrunken index's shards cannot be allocated.
        const indexReadOnlyBlock = get(sourceIndexSettings, [sourceIndex.index, "settings", INDEX_BLOCKS_READONLY_SETTING]);
        if (indexReadOnlyBlock === "true" || indexReadOnlyBlock === true) {
          sourceIndexNotReadyToShrinkReasons.push(
            <>
              <EuiCallOut title="Index setting [index.blocks.read_only] is [true]." color="warning" iconType="help">
                <p>
                  Index setting [index.blocks.read_only] of the source index is [true], it will be copied to the new shrunken index and then
                  cause the new shrunken index's shards to be unassigned, you can set the setting to [null] or [false] in the advanced
                  settings bellow.
                </p>
              </EuiCallOut>
              <EuiSpacer />
            </>
          );
        }
      }
    }

    const numberOfShardsSelectOptions = [];
    const sourceIndexSharsNum = Number(sourceIndex.pri);
    for (let i = 1; i <= sourceIndexSharsNum; i++) {
      if (sourceIndexSharsNum % i === 0) {
        numberOfShardsSelectOptions.push({
          value: i.toString(),
          text: i,
        });
      }
    }

    const formFields: IField[] = [
      {
        rowProps: {
          label: "Target index name",
          helpText: <div>{INDEX_NAMING_MESSAGE}</div>,
          position: "bottom",
        },
        name: "targetIndex",
        type: "Input",
        options: {
          rules: [
            {
              validator: (_, value) => {
                if (!value || !value.toString().trim()) {
                  return Promise.reject("Target index name required.");
                }
                return Promise.resolve();
              },
            },
            {
              pattern: /^[^A-Z-_"*+/\\|?#<>][^A-Z"*+/\\|?#<>]*$/,
              message: "Invalid target index name.",
            },
          ],
          props: {
            "data-test-subj": "targetIndexNameInput",
            placeholder: "Specify a name for the new shrunken index.",
          },
        },
      },
      {
        rowProps: {
          label: "Number of primary shards",
          helpText: (
            <>
              <p>Specify the number of shards for the new shrunken index.</p>
              <p>The number must be a factor of the primary shard count of the source index.</p>
            </>
          ),
        },
        name: "index.number_of_shards",
        type: "Select",
        options: {
          rules: [
            {
              validator: (_, value) => {
                if (!value || !value.toString().trim() || Number(value) <= 0 || Number(sourceIndex.pri) % value != 0) {
                  return Promise.reject(
                    "The number of primary shards in the new shrunken index " +
                      " must be a positive factor of the number of primary shards in the source index."
                  );
                }
                return Promise.resolve();
              },
            },
          ],
          props: {
            "data-test-subj": "numberOfShardsInput",
            options: numberOfShardsSelectOptions,
            placeholder: "Select primary shard count",
          },
        },
      },
      {
        rowProps: {
          label: "Number of replicas",
          helpText: <div>{REPLICA_NUMBER_MESSAGE}</div>,
        },
        name: "index.number_of_replicas",
        type: "Number",
        options: {
          rules: [
            {
              validator: (_, value) => {
                if (!value || !value.toString().trim() || Number(value) < 0) {
                  return Promise.reject("Number of replicas must be greater than or equal to 0.");
                }
                return Promise.resolve();
              },
            },
          ],
          props: {
            "data-test-subj": "numberOfReplicasInput",
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
            "data-test-subj": "aliasesInput",
            refreshOptions: this.getAlias,
          },
          rules: [...ALIAS_SELECT_RULE],
        },
        component: WrappedAliasSelect as React.ComponentType<IFieldComponentProps>,
      },
    ];

    const indices = sourceIndex.index ? [sourceIndex.index] : [];
    const indexDetailChildren = (
      <ul key="reasons">
        {sourceIndexNotReadyToShrinkReasons.map((reason, index) => (
          <li key={index}>{reason}</li>
        ))}
      </ul>
    );

    const configurationChildren: React.ReactChild = (
      <>
        <EuiSpacer size="m" />
        <ContentPanel title="Configure target index" titleSize="s">
          <EuiSpacer size="m" />
          <FormGenerator
            ref={(ref) => (this.formRef = ref)}
            value={requestPayload}
            onChange={(value) => {
              if (!!value) {
                this.setState({
                  requestPayload: value,
                });
              }
            }}
            formFields={formFields}
            hasAdvancedSettings
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
                    Specify a comma-delimited list of settings.&nbsp;
                    <EuiLink href={INDEX_SETTINGS_URL} target="_blank">
                      View index settings.
                    </EuiLink>
                  </>
                ),
              },
            }}
          />
        </ContentPanel>
      </>
    );

    const subTitleText = (
      <EuiCompressedFormRow
        fullWidth
        helpText={
          <div>
            Shrink an existing index into a new index with fewer primary shards.&nbsp;
            <EuiLink href={SHRINK_DOCUMENTATION_URL} target="_blank" rel="noopener noreferrer">
              Learn more
            </EuiLink>
          </div>
        }
      >
        <></>
      </EuiCompressedFormRow>
    );

    return (
      <div style={{ padding: "0px 50px" }}>
        <EuiTitle size="l">
          <h1>Shrink index</h1>
        </EuiTitle>
        {subTitleText}
        <EuiSpacer />
        <IndexDetail indices={indices} children={indexDetailChildren} />
        {!!disableShrinkButton ? null : configurationChildren}
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
        <EuiSpacer />
        <EuiFlexGroup justifyContent="flexEnd">
          <EuiFlexItem grow={false}>
            <EuiSmallButtonEmpty onClick={this.onCancel} flush="left" data-test-subj="shrinkIndexCancelButton">
              Cancel
            </EuiSmallButtonEmpty>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiSmallButton
              isLoading={this.state.loading}
              isDisabled={this.state.loading}
              onClick={this.onClickAction}
              fill
              data-test-subj="shrinkIndexConfirmButton"
              disabled={disableShrinkButton}
            >
              Shrink
            </EuiSmallButton>
          </EuiFlexItem>
        </EuiFlexGroup>
      </div>
    );
  }
}
