/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { Component } from "react";
import {
  EuiButton,
  EuiCallOut,
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutFooter,
  EuiFlyoutHeader,
  EuiLink,
  EuiSpacer,
  EuiTitle,
} from "@elastic/eui";
import { get } from "lodash";
import FormGenerator, { IField, IFormGeneratorRef } from "../../../../components/FormGenerator";
import { IndexItem } from "../../../../../models/interfaces";
import FlyoutFooter from "../../../VisualCreatePolicy/components/FlyoutFooter";
import { CatIndex } from "../../../../../server/models/interfaces";
import IndexDetail from "../../../../containers/IndexDetail";
import ContentPanel from "../../../../components/ContentPanel/ContentPanel";
import { IFieldComponentProps } from "../../../../components/FormGenerator/built_in_components";
import AliasSelect, { AliasSelectProps } from "../../../CreateIndex/components/AliasSelect";
import EuiToolTipWrapper from "../../../../components/EuiToolTipWrapper";

const WrappedAliasSelect = EuiToolTipWrapper(AliasSelect as any, {
  disabledKey: "isDisabled",
});

interface SplitIndexProps {
  sourceIndex: CatIndex;
  onCloseFlyout: () => void;
  onSplitIndex: (targetIndex: string, settingsPayload: IndexItem["settings"]) => void;
  getIndexSettings: (indexName: string, flat: boolean) => Promise<Record<string, IndexItem>>;
  setIndexSettings: (indexName: string, flat: boolean, setting: {}) => void;
  openIndex: () => void;
  getAlias: (aliasName: string) => Promise<AliasSelectProps["refreshOptions"]>;
}

export default class SplitIndexFlyout extends Component<SplitIndexProps> {
  state = {
    settings: {} as Required<IndexItem>["settings"],
    sourceIndexSettings: {} as IndexItem,
  };

  async componentDidMount() {
    await this.isSourceIndexReady();
  }

  isSourceIndexReady = async () => {
    const { sourceIndex } = this.props;
    const { getIndexSettings } = this.props;
    const sourceIndexSettings = await getIndexSettings(sourceIndex.index, true);
    this.setState({
      sourceIndexSettings,
    });
  };

  formRef: IFormGeneratorRef | null = null;
  onSubmit = async () => {
    // trigger the validation manually here
    const validateResult = await this.formRef?.validatePromise();
    const { targetIndex, ...others } = this.state.settings;
    const { errors } = validateResult || {};
    if (errors) {
      return;
    }
    const { onSplitIndex } = this.props;
    onSplitIndex(targetIndex, others);
  };

  render() {
    const { sourceIndex, onCloseFlyout, setIndexSettings, openIndex } = this.props;
    const { sourceIndexSettings } = this.state;

    const blockNameList = ["targetIndex"];
    const reasons: React.ReactChild[] = [];
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
              await openIndex();
              await this.isSourceIndexReady();
            }}
            data-test-subj={"open-index-button"}
          >
            Open index
          </EuiButton>
        </>
      );
    }

    if (sourceSettings && (!blocksWriteValue || blocksWriteValue !== "true")) {
      const flat = true;
      const blocksWriteSetting = { "index.blocks.write": "true" };
      reasons.push(
        <>
          Source index must be in block write status. &nbsp;&nbsp;
          <EuiButton
            fill
            onClick={async () => {
              await setIndexSettings(sourceIndex.index, flat, blocksWriteSetting);
              await this.isSourceIndexReady();
            }}
            data-test-subj={"set-indexsetting-button"}
          >
            Set to block write
          </EuiButton>
        </>
      );
    }

    const formFields: IField[] = [
      {
        rowProps: {
          label: "Target Index Name",
        },
        name: "targetIndex",
        type: "Input",
        options: {
          rules: [
            {
              trigger: "onBlur",
              validator: (rule, value) => {
                if (!value || value === "") {
                  // do not pass the validation
                  // return a rejected promise with error message
                  return Promise.reject("Target Index Name is required");
                }
                // pass the validation, return a resolved promise
                return Promise.resolve();
              },
            },
          ],
          props: {
            "data-test-subj": "Target Index Name",
          },
        },
      },
      {
        rowProps: {
          label: "Number of shards",
          helpText: `Must be a multi of ${sourceIndex.pri}`,
        },
        name: "index.number_of_shards",
        type: "Number",
        options: {
          rules: [
            {
              trigger: "onBlur",
              validator: (rule, value) => {
                if (!value || value === "") {
                  // do not pass the validation
                  // return a rejected promise with error message
                  return Promise.reject("Number of shards is required");
                }

                if (Number(value) < 1 || Number(value) % Number(sourceIndex.pri) != 0) {
                  return Promise.reject(`${value} must be a multiple of ${sourceIndex.pri}`);
                }

                // pass the validation, return a resolved promise
                return Promise.resolve();
              },
            },
          ],
          props: {
            "data-test-subj": "Number of shards",
            min: Number(sourceIndex.pri) * 2,
            step: Number(sourceIndex.pri),
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
            refreshOptions: this.props.getAlias,
          },
        },
        component: WrappedAliasSelect as React.ComponentType<IFieldComponentProps>,
      },
    ];

    return (
      <EuiFlyout ownFocus={true} onClose={() => {}} size="m" hideCloseButton>
        <EuiFlyoutHeader hasBorder>
          <EuiTitle size="m">
            <h2 id="flyoutTitle"> Split Index</h2>
          </EuiTitle>
        </EuiFlyoutHeader>

        <EuiFlyoutBody>
          <IndexDetail indices={[sourceIndex.index]}>
            <EuiCallOut color="danger" hidden={reasons.length == 0} data-test-subj="Source Index Warning">
              <div style={{ lineHeight: 3 }}>
                <ul>
                  {reasons.map((reason, reasonIndex) => (
                    <li key={reasonIndex}>{reason}</li>
                  ))}
                </ul>
                <EuiLink
                  href={"https://opensearch.org/docs/1.2/opensearch/rest-api/index-apis/split/"}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Learn more
                </EuiLink>
              </div>
            </EuiCallOut>
          </IndexDetail>
          <EuiSpacer />

          {reasons.length == 0 && (
            <ContentPanel title="Configure target index" titleSize="s">
              <FormGenerator
                onChange={(totalValue) =>
                  this.setState({
                    settings: totalValue,
                  })
                }
                formFields={formFields}
                ref={(ref) => (this.formRef = ref)}
                hasAdvancedSettings={true}
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
                        <EuiLink
                          href="https://opensearch.org/docs/latest/api-reference/index-apis/create-index#index-settings"
                          target="_blank"
                        >
                          View index settings
                        </EuiLink>
                      </>
                    ),
                  },
                }}
              />
            </ContentPanel>
          )}
        </EuiFlyoutBody>

        <EuiFlyoutFooter>
          <FlyoutFooter
            action=""
            text="Split"
            edit={false}
            disabledAction={reasons.length > 0}
            onClickAction={this.onSubmit}
            onClickCancel={onCloseFlyout}
          />
        </EuiFlyoutFooter>
      </EuiFlyout>
    );
  }
}
