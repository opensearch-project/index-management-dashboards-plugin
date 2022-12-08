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
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutFooter,
  EuiFlyoutHeader,
  EuiLink,
  EuiSpacer,
  EuiTitle,
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
import { SHRINK_DOCUMENTATION_URL, INDEX_SETTINGS_URL } from "../../../../utils/constants";
import {
  DEFAULT_INDEX_SETTINGS,
  INDEX_BLOCKS_WRITE_SETTING,
  INDEX_BLOCKS_READONLY_SETTING,
  INDEX_ROUTING_ALLOCATION_SETTING,
} from "./constants";
import { get } from "lodash";

const WrappedAliasSelect = EuiToolTipWrapper(AliasSelect as any, {
  disabledKey: "isDisabled",
});

interface ShrinkIndexProps {
  sourceIndex: CatIndex;
  onClose: () => void;
  onConfirm: (sourceIndexName: string, targetIndexName: string, requestPayload: Required<IndexItem>["settings"]) => void;
  getIndexSettings: (indexName: string, flat: boolean) => Promise<Object>;
  setIndexSettings: (indexName: string, flat: boolean, setting: {}) => void;
  openIndex: () => void;
  getAlias: (aliasName: string) => Promise<any>;
}

interface ShrinkIndexState {
  requestPayload: Required<IndexItem>["settings"];
  sourceIndexSettings: Object;
}

export default class ShrinkIndexFlyout extends Component<ShrinkIndexProps, ShrinkIndexState> {
  constructor(props: ShrinkIndexProps) {
    super(props);

    this.state = {
      requestPayload: DEFAULT_INDEX_SETTINGS,
      sourceIndexSettings: {},
    };
  }

  async componentDidMount() {
    await this.isSourceIndexReady();
  }

  formRef: IFormGeneratorRef | null = null;

  onClickAction = async () => {
    const { sourceIndex, onConfirm } = this.props;
    const { targetIndex, ...others } = this.state.requestPayload;

    const result = await this.formRef?.validatePromise();
    if (result?.errors) {
      return;
    }
    onConfirm(sourceIndex.index, targetIndex, others);
  };

  isSourceIndexReady = async () => {
    const { sourceIndex, getIndexSettings } = this.props;
    const indexSettings = await getIndexSettings(sourceIndex.index, true);
    this.setState({
      sourceIndexSettings: indexSettings,
    });
  };

  onUpdateIndexSettings = async (indexName: string, settings: {}) => {
    const { setIndexSettings, getIndexSettings } = this.props;
    await setIndexSettings(indexName, true, settings);

    const indexSettings = await getIndexSettings(indexName, true);
    this.setState({
      sourceIndexSettings: indexSettings,
    });
  };

  onOpenIndex = async () => {
    const { sourceIndex, openIndex, getIndexSettings } = this.props;
    await openIndex();

    const indexSettings = await getIndexSettings(sourceIndex.index, true);
    this.setState({
      sourceIndexSettings: indexSettings,
    });
  };

  render() {
    const { onClose, sourceIndex } = this.props;
    const { requestPayload, sourceIndexSettings } = this.state;
    const sourceIndexCannotShrinkErrors: React.ReactChild[] = [];
    const sourceIndexNotReadyReasons = [];
    const blockNameList = ["targetIndex"];

    if (sourceIndex.health === "red") {
      sourceIndexCannotShrinkErrors.push(<>The source index's health status is [red]!</>);
    }

    if (sourceIndex.pri === "1") {
      sourceIndexCannotShrinkErrors.push(<>The source index has only one primary shard!</>);
    }

    if (sourceIndexCannotShrinkErrors.length == 0) {
      if (sourceIndex.status === "close") {
        sourceIndexCannotShrinkErrors.push(
          <>
            The source index must not be in close status!
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <EuiButton
                onClick={() => {
                  this.onOpenIndex();
                }}
                data-test-subj="onOpenIndexButton"
              >
                Open index{" "}
              </EuiButton>
            </div>
          </>
        );
      }

      const indexWriteBlock = get(sourceIndexSettings, [sourceIndex.index, "settings", INDEX_BLOCKS_WRITE_SETTING]);
      if (indexWriteBlock !== "true" && indexWriteBlock !== true) {
        const indexWriteBlockSettings = {
          "index.blocks.write": true,
        };
        sourceIndexCannotShrinkErrors.push(
          <>
            The source index's write operations must be blocked.
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <EuiButton
                onClick={() => {
                  this.onUpdateIndexSettings(sourceIndex.index, indexWriteBlockSettings);
                }}
                data-test-subj="onSetIndexWriteBlockButton"
              >
                Set write block{" "}
              </EuiButton>
            </div>
          </>
        );
      }

      // It's better to do shrink when the source index is green.
      if (sourceIndex.health !== "green") {
        sourceIndexNotReadyReasons.push("The source index's health is not green.");
      }

      // Check whether `index.blocks.read_only` is set to `true`,
      // because shrink operation will timeout and then the new shrunken index's shards cannot be allocated.
      const indexReadOnlyBlock = get(sourceIndexSettings, [sourceIndex.index, "settings", INDEX_BLOCKS_READONLY_SETTING]);
      if (indexReadOnlyBlock === "true" || indexReadOnlyBlock === true) {
        sourceIndexNotReadyReasons.push(
          "Index setting [index.blocks.read_only] is [true], this will cause the new shrunken index's shards to be unassigned."
        );
      }

      // This check may not be correct in the following situations:
      // 1. the cluster only has one node, so the source index's primary shards are allocated to the same node.
      // 2. the primary shards of the source index are just allocated to the same node, not manually.
      // 3. the user set `index.routing.rebalance.enable` to `none` and then manually move each shard's copy to one node.
      // In the above situations, the source index does not have a `index.routing.allocation.require._*` setting which can
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
        sourceIndexNotReadyReasons.push("One copy of every shard may not allocated to one node.");
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
          },
        },
      },
      {
        rowProps: {
          label: "Number of shards",
          helpText: `Specify the number of shards for the new shrunken index.
          The number must be a factor of primary shard count in the source index.`,
        },
        name: "index.number_of_shards",
        type: "Select",
        options: {
          rules: [],
          props: {
            "data-test-subj": "numberOfShardsInput",
            options: numberOfShardsSelectOptions,
          },
        },
      },
      {
        rowProps: {
          label: "Number of replicas",
          helpText: "The number of replica shards each primary shard should have.",
        },
        name: "index.number_of_replicas",
        type: "Number",
        options: {
          rules: [
            {
              validator: (_, value) => {
                if (!value || Number(value) < 0) {
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
          label: "Index alias  - optional",
          helpText: "Select existing aliases or specify a new alias",
        },
        options: {
          props: {
            "data-test-subj": "aliasesInput",
            refreshOptions: this.props.getAlias,
          },
        },
        component: WrappedAliasSelect as React.ComponentType<IFieldComponentProps>,
      },
    ];

    const indices = [this.props.sourceIndex.index];
    const indexDetailChildren = (
      <>
        <EuiCallOut color="danger" hidden={sourceIndexCannotShrinkErrors.length === 0}>
          <div style={{ lineHeight: 1.5 }}>
            <p>The source index cannot shrink, due to the following reasons:</p>
            <ul key="error">
              {sourceIndexCannotShrinkErrors.map((reason, index) => (
                <li key={index}>{reason}</li>
              ))}
            </ul>
            <EuiLink href={SHRINK_DOCUMENTATION_URL} target="_blank" rel="noopener noreferrer">
              Learn more
            </EuiLink>
          </div>
        </EuiCallOut>
        <EuiCallOut color="warning" hidden={sourceIndexCannotShrinkErrors.length !== 0 || sourceIndexNotReadyReasons.length === 0}>
          <div style={{ lineHeight: 1.5 }}>
            <p>The source index is not ready to shrink, may due to the following reasons:</p>
            <ul key="reason">
              {sourceIndexNotReadyReasons.map((reason, index) => (
                <li key={index}>{reason}</li>
              ))}
            </ul>
            <EuiLink href={SHRINK_DOCUMENTATION_URL} target="_blank" rel="noopener noreferrer">
              Learn more
            </EuiLink>
          </div>
        </EuiCallOut>
      </>
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
                label: "Specify advanced settings and aliases",
                helpText: (
                  <>
                    Specify a comma-delimited list of settings.
                    <EuiLink href={INDEX_SETTINGS_URL} target="_blank">
                      View index settings
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

    return (
      <EuiFlyout ownFocus={true} onClose={() => {}} size="m" hideCloseButton>
        <EuiFlyoutHeader hasBorder>
          <EuiTitle size="m">
            <h2 id="flyoutTitle"> Shrink index</h2>
          </EuiTitle>
        </EuiFlyoutHeader>
        <EuiFlyoutBody>
          <IndexDetail indices={indices} children={indexDetailChildren} />
          {sourceIndexCannotShrinkErrors.length > 0 ? null : configurationChildren}
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
                disabled={sourceIndexCannotShrinkErrors.length > 0}
              >
                Shrink
              </EuiButton>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlyoutFooter>
      </EuiFlyout>
    );
  }
}
