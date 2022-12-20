/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiButton,
  EuiButtonEmpty,
  EuiCallOut,
  EuiFlexGroup,
  EuiFlexItem,
  EuiLink,
  EuiSpacer,
  EuiTitle,
  EuiText,
  EuiLoadingSpinner,
} from "@elastic/eui";
import React, { Component } from "react";

import { CatIndex } from "../../../../../server/models/interfaces";
import FormGenerator, { IField, IFormGeneratorRef } from "../../../../components/FormGenerator";
import { ContentPanel } from "../../../../components/ContentPanel";
import IndexDetail from "../../../../containers/IndexDetail";
import { IndexItem } from "../../../../../models/interfaces";
import { IFieldComponentProps } from "../../../../components/FormGenerator/built_in_components";
import AliasSelect from "../../../CreateIndex/components/AliasSelect";
import EuiToolTipWrapper from "../../../../components/EuiToolTipWrapper";
import { CommonService } from "../../../../services";
import { RouteComponentProps } from "react-router-dom";
import { SHRINK_DOCUMENTATION_URL, INDEX_SETTINGS_URL, ROUTES } from "../../../../utils/constants";
import { BREADCRUMBS } from "../../../../utils/constants";
import queryString from "query-string";
import { jobSchedulerInstance } from "../../../../context/JobSchedulerContext";
import { RecoveryJobMetaData } from "../../../../models/interfaces";
import { getErrorMessage } from "../../../../utils/helpers";
import { ServerResponse } from "../../../../../server/models/types";
import { CoreServicesContext } from "../../../../components/core_services";
import {
  DEFAULT_INDEX_SETTINGS,
  INDEX_BLOCKS_WRITE_SETTING,
  INDEX_BLOCKS_READONLY_SETTING,
  INDEX_ROUTING_ALLOCATION_SETTING,
} from "../../utils/constants";
import { get } from "lodash";

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
}

export default class ShrinkIndex extends Component<ShrinkIndexProps, ShrinkIndexState> {
  static contextType = CoreServicesContext;

  constructor(props: ShrinkIndexProps) {
    super(props);

    this.state = {
      sourceIndex: {} as CatIndex,
      requestPayload: DEFAULT_INDEX_SETTINGS,
      sourceIndexSettings: {},
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
      this.context.notifications.toasts.addDanger(`Invalid index: ${source}`);
      this.props.history.push(ROUTES.SHRINK_INDEX);
    }
  }

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

  onClickAction = async () => {
    const { sourceIndex } = this.state;
    const { targetIndex, ...others } = this.state.requestPayload;

    const result = await this.formRef?.validatePromise();
    if (result?.errors) {
      return;
    }
    this.shrinkIndex(sourceIndex.index, targetIndex, others);
  };

  onCancel = () => {
    this.props.history.push(ROUTES.INDICES);
  };

  shrinkIndex = async (sourceIndexName: string, targetIndexName: string, requestPayload: Required<IndexItem>["settings"]) => {
    try {
      const { commonService } = this.props;
      const { aliases, ...settings } = requestPayload;

      const result = await commonService.apiCaller({
        endpoint: "indices.shrink",
        data: {
          index: sourceIndexName,
          target: targetIndexName,
          body: {
            settings: {
              ...settings,
            },
            aliases,
          },
        },
      });
      if (result && result.ok) {
        this.context.notifications.toasts.addSuccess(
          `Successfully started shrinking ${sourceIndexName}. The shrunken index will be named ${targetIndexName}.`
        );
        this.onCancel();
        jobSchedulerInstance.addJob({
          interval: 30000,
          extras: {
            sourceIndex: sourceIndexName,
            destIndex: targetIndexName,
          },
          type: "shrink",
        } as RecoveryJobMetaData);
      } else {
        this.context.notifications.toasts.addDanger(result.error);
      }
    } catch (err) {
      this.context.notifications.toasts.addDanger(getErrorMessage(err, "There was a problem shrinking index."));
    }
  };

  getIndexSettings = async (indexName: string, flat: boolean): Promise<Record<string, IndexItem>> => {
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
        const errorMessage = `There is a problem getting index setting for ${indexName}, please check with Admin.`;
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
        this.context.notifications.toasts.addSuccess(`${indexName} has been set to block write.`);
      } else {
        const errorMessage = `There is a problem set index setting for ${indexName}, please check with Admin`;
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
          expand_wildcards: "open",
        },
      });
    } catch (err) {
      this.context.notifications.toasts.addDanger(getErrorMessage(err, "There was a problem getting aliases."));
    }
  };

  openIndex = async (index: string) => {
    try {
      const { commonService } = this.props;
      const result = await commonService.apiCaller({
        endpoint: "indices.open",
        data: {
          index: index,
        },
      });
      if (result && result.ok) {
        this.context.notifications.toasts.addSuccess(`[${index}] has been set to Open.`);
      } else {
        this.context.notifications.toasts.addDanger(result.error);
      }
    } catch (err) {
      this.context.notifications.toasts.addDanger(getErrorMessage(err, "There was a problem opening index."));
    }
  };

  isSourceIndexReady = async () => {
    const { sourceIndex } = this.state;
    const indexSettings = await this.getIndexSettings(sourceIndex.index, true);
    this.setState({
      sourceIndexSettings: indexSettings,
    });
  };

  onUpdateIndexSettings = async (indexName: string, settings: {}) => {
    await this.setIndexSettings(indexName, settings);

    // refresh index settings
    const indexSettings = await this.getIndexSettings(indexName, true);
    this.setState({
      sourceIndexSettings: indexSettings,
    });
  };

  onOpenIndex = async () => {
    const { sourceIndex } = this.state;
    await this.openIndex(sourceIndex.index);

    // refresh status
    await this.getIndex(sourceIndex.index);
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
          <EuiCallOut
            title="The source index's health status is Red, please check its status before shrinking."
            color="danger"
            iconType="alert"
          ></EuiCallOut>
          <EuiSpacer />
        </>
      );
    }

    if (sourceIndex.pri === "1") {
      disableShrinkButton = true;
      sourceIndexNotReadyToShrinkReasons.push(
        <>
          <EuiCallOut
            title="The source index has only one primary shard, you cannot shrink it anymore."
            color="danger"
            iconType="alert"
          ></EuiCallOut>
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
            <EuiCallOut title="The source index's write operations must be blocked before shrinking." color="danger" iconType="alert">
              <p>In order to shrink an existing index, you must first set it to block write.</p>
              <EuiSpacer />
              <EuiButton
                onClick={() => {
                  const indexWriteBlockSettings = {
                    "index.blocks.write": true,
                  };
                  this.onUpdateIndexSettings(sourceIndex.index, indexWriteBlockSettings);
                }}
                fill
                data-test-subj="onSetIndexWriteBlockButton"
              >
                Set to block write
              </EuiButton>
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
                to complete. The index will be in the Red state while the index is opening.
              </p>
              <EuiSpacer />
              <EuiButton
                onClick={() => {
                  this.onOpenIndex();
                }}
                fill
                data-test-subj="onOpenIndexButton"
              >
                Open index
              </EuiButton>
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
              <EuiCallOut title="The source index's health status is Yellow!" color="warning" iconType="help">
                <p>
                  It's recommended to shrink an index when its health status is Green, because if the index's health status is Yellow, it
                  may cause problems when initializing the new shrunken index's shards.
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
              <EuiCallOut title="The source index's setting [index.blocks.read_only] is [true]!" color="warning" iconType="help">
                <p>
                  When the source index's setting [index.blocks.read_only] is [true], it will be copied to the new shrunken index and then
                  the new shrunken index's metadata write will be blocked, this will cause the new shrunken index's shards to be unassigned,
                  you can set the setting to [null] or [false] in the advanced settings bellow.
                </p>
              </EuiCallOut>
              <EuiSpacer />
            </>
          );
        }

        // This check may not be accurate in the following cases:
        // 1. the cluster only has one node, so the source index's primary shards are allocated to the same node.
        // 2. the primary shards of the source index are just allocated to the same node, not manually.
        // 3. the user set `index.routing.rebalance.enable` to `none` and then manually move each shard's copy to one node.
        // In the above cases, the source index does not have a `index.routing.allocation.require._*` setting which can
        // rellocate one copy of every shard to one node, but it can also execute shrinking successfully if other conditions are met.
        // But in most cases, source index always have many shards distributed on different node,
        // so index.routing.allocation.require._*` setting is required.
        // In above, we just show a warning in the page, it does not affect any button or form.
        const settings = get(sourceIndexSettings, [sourceIndex.index, "settings"]);
        let shardsAllocatedToOneNode = false;
        for (let settingKey in settings) {
          if (settingKey.startsWith(INDEX_ROUTING_ALLOCATION_SETTING)) {
            shardsAllocatedToOneNode = true;
            break;
          }
        }
        if (!shardsAllocatedToOneNode) {
          sourceIndexNotReadyToShrinkReasons.push(
            <>
              <EuiCallOut
                title="A copy of every shard in the source index may not reside on the same node."
                color="warning"
                iconType="help"
              >
                <p>
                  When shrinking an index, a copy of every shard in the index must reside on the same node, you can use the index setting
                  `index.routing.allocation.require._*` to relocate the copy of every shard to one node.
                </p>
                <p>
                  Ignore this warning if the copy of every shard in the source index just reside on the same node in some cases, like the
                  OpenSearch cluster has only one node or the cluster has two nodes and each primary shard in the source index has one
                  replia.
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
          helpText: "Specify a name for the new shrunken index.",
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
          ],
          props: {
            "data-test-subj": "targetIndexNameInput",
            placeholder: "Index name",
          },
        },
      },
      {
        rowProps: {
          label: "Number of primary shards",
          helpText: `
          Specify the number of shards for the new shrunken index.\n
          The number must be a factor of the primary shard count of the source index.`,
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
          helpText: "Specify the number of replica shards each primary shard should have.",
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
          label: `Index alias - optional`,
          helpText: "Allow this index to be referenced by existing aliases or specify a new alias.",
        },
        options: {
          props: {
            "data-test-subj": "aliasesInput",
            refreshOptions: this.getAlias,
          },
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
                    Specify a comma-delimited list of settings.
                    <EuiLink href={INDEX_SETTINGS_URL} target="_blank">
                      View index settings.
                    </EuiLink>
                  </>
                ),
              },
            }}
          />
        </ContentPanel>
        <EuiSpacer size="m" />
      </>
    );

    const subTitleText = (
      <EuiText color="subdued" size="s" style={{ padding: "5px 0px" }}>
        <p style={{ fontWeight: 200 }}>
          Shrink an existing index into a new index with fewer primary shards.{" "}
          <EuiLink href={SHRINK_DOCUMENTATION_URL} target="_blank" rel="noopener noreferrer">
            Learn more.
          </EuiLink>
        </p>
      </EuiText>
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
        <EuiSpacer />
        <EuiSpacer />
        <EuiFlexGroup justifyContent="flexEnd">
          <EuiFlexItem grow={false}>
            <EuiButtonEmpty onClick={this.onCancel} flush="left" data-test-subj="shrinkIndexCancelButton">
              Cancel
            </EuiButtonEmpty>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButton onClick={this.onClickAction} fill data-test-subj="shrinkIndexConfirmButton" disabled={disableShrinkButton}>
              Shrink
            </EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup>
      </div>
    );
  }
}