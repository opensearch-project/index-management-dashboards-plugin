/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiButton,
  EuiButtonIcon,
  EuiCallOut,
  EuiComboBox,
  EuiComboBoxOptionOption,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutFooter,
  EuiFlyoutHeader,
  EuiSpacer,
  EuiSwitchEvent,
  EuiTitle,
} from "@elastic/eui";
import _ from "lodash";
import React, { ChangeEvent, Component } from "react";
import FlyoutFooter from "../../../VisualCreatePolicy/components/FlyoutFooter";
import { CoreServicesContext } from "../../../../components/core_services";
import { getErrorMessage } from "../../../../utils/helpers";
import { IndexItem } from "../../../../../models/interfaces";
import { DEFAULT_QUERY, REINDEX_ERROR_PROMPT } from "../../utils/constants";
import JSONEditor from "../../../../components/JSONEditor";
import { REQUEST } from "../../../../../utils/constants";
import { ReindexRequest } from "../../models/interfaces";
import { BrowserServices } from "../../../../models/interfaces";
import ReindexAdvancedOptions from "../ReindexAdvancedOptions/ReindexAdvancedOptions";
import CustomFormRow from "../../../../components/CustomFormRow";
import { CatIndex, ManagedCatIndex } from "../../../../../server/models/interfaces";
import IndexDetail from "../../../../containers/IndexDetail";
import { ContentPanel } from "../../../../components/ContentPanel";
import { ServerResponse } from "../../../../../server/models/types";

interface ReindexProps {
  services: BrowserServices;
  sourceIndices: ManagedCatIndex[];
  onCloseFlyout: () => void;
  onReindexConfirm: (request: ReindexRequest) => void;
  openIndex: (index: string) => Promise<ServerResponse<any>>;
}

interface ReindexState {
  indexOptions: EuiComboBoxOptionOption<IndexItem>[];
  dataStreams: EuiComboBoxOptionOption<IndexItem>[];
  selectedIndexOptions: EuiComboBoxOptionOption<IndexItem>[];
  queryJsonString: string;
  destError?: string;
  destSettingsJson?: string;
  sourceErr?: ReindexActonItem[];
  slices: string;
  sliceError?: string;
  waitForComplete: boolean;
  pipelines: EuiComboBoxOptionOption<void>[];
  selectedPipelines?: EuiComboBoxOptionOption<void>[];
  advancedSettingsOpen: boolean;
  conflicts: string;
}

interface ReindexActonItem {
  desc: string;
  key: string;
  action?: React.ReactChild;
}

const DEFAULT_SLICE = "1";

export default class ReindexFlyout extends Component<ReindexProps, ReindexState> {
  static contextType = CoreServicesContext;
  private readonly sourceIndicesNames: string[];

  constructor(props: ReindexProps) {
    super(props);

    this.state = {
      indexOptions: [],
      dataStreams: [],
      selectedIndexOptions: [],
      queryJsonString: DEFAULT_QUERY,
      waitForComplete: false,
      slices: DEFAULT_SLICE,
      pipelines: [],
      advancedSettingsOpen: false,
      conflicts: "abort",
    };

    this.sourceIndicesNames = this.props.sourceIndices.map((idx) => idx.index);
  }

  async componentDidMount() {
    // check _source enabled for source
    const { sourceIndices } = this.props;
    await this.sourceValidation(sourceIndices);
    await this.getIndexOptions("");
    await this.getAllPipelines();
  }

  onOpenIndex = async (indices: string) => {
    const { openIndex } = this.props;
    const res = await openIndex(indices);
    if (res && res.ok) {
      this.context.notifications.toasts.addSuccess(`Open index ${indices} successfully`);
    } else {
      this.context.notifications.toasts.addDanger(res?.error);
    }
  };

  sourceValidation = async (sourceIndices: CatIndex[]) => {
    const {
      services: { commonService },
    } = this.props;

    let errors = [];

    sourceIndices
      .filter((item) => item.status.toLowerCase() === "close")
      .forEach((item) => {
        errors.push({
          desc: `Index [${item.index}] status is closed`,
          key: `${item.index}-close`,
          action: (
            <EuiButton size="s" onClick={() => this.onOpenIndex(item.index)}>
              Open it
            </EuiButton>
          ),
        });
      });

    const res = await commonService.apiCaller({
      endpoint: "indices.getFieldMapping",
      data: {
        fields: "_source",
        index: sourceIndices.map((idx) => idx.index).join(","),
      },
    });
    if (res && res.ok) {
      for (const index of this.sourceIndicesNames) {
        const sourceEnabled = _.get(res.response, [index, "mappings", "_source", "mapping", "_source", "enabled"]);
        if (sourceEnabled === false) {
          errors.push({
            desc: `Index [${index}] didn't store _source, it's required by reindex`,
            key: `${index} - _source`,
          });
        }
      }
    }
    if (errors.length > 0) {
      this.setState({ sourceErr: errors });
    }
  };

  onIndicesSelectionChange = (selectedOptions: EuiComboBoxOptionOption<IndexItem>[]) => {
    this.setState({
      selectedIndexOptions: selectedOptions,
      destSettingsJson: undefined,
      destError: undefined,
    });

    this.validateDestination(selectedOptions);
  };

  getIndexOptions = async (searchValue: string) => {
    const {
      services: { indexService },
    } = this.props;
    this.setState({ indexOptions: [] });
    try {
      const res = await indexService.getDataStreamsAndIndicesNames(searchValue.trim());
      if (res.ok) {
        const dataStreams = res.response.dataStreams.map((label) => ({ label }));
        const indices = res.response.indices
          .filter((index) => {
            return this.sourceIndicesNames.indexOf(index) === -1 && !index.startsWith(".ds-");
          })
          .map((label) => ({ label }));
        this.setState({
          indexOptions: [
            { label: "indices", options: indices },
            { label: "dataStreams", options: dataStreams },
          ],
        });
        this.setState({ dataStreams: dataStreams });
      } else {
        this.context.notifications.toasts.addDanger(res.error);
      }
    } catch (err) {
      this.context.notifications.toasts.addDanger(getErrorMessage(err, "There was a problem fetching index options."));
    }
  };

  onCreateOption = (searchValue: string, options: EuiComboBoxOptionOption<IndexItem>[]) => {
    const normalizedSearchValue = searchValue.trim().toLowerCase();
    if (!normalizedSearchValue) {
      return;
    }
    const newOption = {
      label: normalizedSearchValue,
    };

    if (options.findIndex((option) => option.label.trim().toLowerCase() === normalizedSearchValue) === -1) {
      this.populateSourceIndexSettings(searchValue);
    }

    this.onIndicesSelectionChange([newOption]);
  };

  populateSourceIndexSettings = async (dest: string) => {
    const {
      services: { commonService },
      sourceIndices,
    } = this.props;
    if (sourceIndices.length === 1 && sourceIndices[0].index != dest) {
      const res = await commonService.apiCaller({
        endpoint: "indices.get",
        method: REQUEST.GET,
        data: {
          index: this.sourceIndicesNames[0],
        },
      });
      if (res.ok) {
        // @ts-ignore
        let index = res.response[this.sourceIndicesNames[0]];
        if (index && index.settings) {
          _.unset(index, "aliases");
          _.unset(index.settings, "index.resize");
          _.unset(index.settings, "index.verified_before_close");
          _.unset(index.settings, "index.blocks");
          _.unset(index.settings, "index.routing");
          _.unset(index.settings, "index.provided_name");
          _.unset(index.settings, "index.creation_date");
          _.unset(index.settings, "index.uuid");
          _.unset(index.settings, "index.version");
          this.setState({ destSettingsJson: JSON.stringify(index, null, 4) });
        }
      }
    }
  };

  getAllPipelines = async () => {
    const {
      services: { commonService },
    } = this.props;

    const pipelineRes = await commonService.apiCaller({
      endpoint: "ingest.getPipeline",
    });
    if (pipelineRes && pipelineRes.ok) {
      this.setState({ pipelines: _.keys(pipelineRes.response).map((label) => ({ label })) });
    }
  };

  onClickAction = async () => {
    const {
      onReindexConfirm,
      services: { commonService },
    } = this.props;
    const { queryJsonString, selectedIndexOptions, dataStreams, destSettingsJson, waitForComplete, slices, selectedPipelines } = this.state;
    const { conflicts } = this.state;

    if (!this.validateDestination(selectedIndexOptions) || !this.validateSlices(slices)) {
      return;
    }

    const [dest] = selectedIndexOptions.map((op) => op.label);

    let isDestAsDataStream = dataStreams.map((ds) => ds.label).indexOf(dest) !== -1;

    try {
      if (destSettingsJson) {
        // create dest index first
        const createRes = await commonService.apiCaller({
          endpoint: "indices.create",
          method: REQUEST.PUT,
          data: {
            index: dest,
            body: {
              ...JSON.parse(destSettingsJson),
            },
          },
        });
        if (!createRes.ok || createRes.error) {
          this.context.notifications.toasts.addDanger(`Create dest index ${dest} with error ${createRes.error}`);
          return;
        }
      }
      let reindexReq: ReindexRequest = {
        waitForCompletion: waitForComplete,
        slices: slices,
        body: {
          conflicts: conflicts,
          source: {
            index: this.sourceIndicesNames.join(","),
            ...JSON.parse(queryJsonString),
          },
          dest: {
            index: selectedIndexOptions.map((op) => op.label)[0],
            op_type: isDestAsDataStream ? "create" : "index",
          },
        },
      };
      // set pipeline if available
      if (selectedPipelines && selectedPipelines.length > 0) {
        // @ts-ignore
        reindexReq.body.dest.pipeline = selectedPipelines[0].label;
      }
      onReindexConfirm(reindexReq);
    } catch (error) {
      this.context.notifications.toasts.addDanger(`Reindex operation error happened ${error}`);
    }
  };

  // validation

  validateDestination = (selectedOptions: EuiComboBoxOptionOption<IndexItem>[]): boolean => {
    if (!selectedOptions || selectedOptions.length != 1) {
      this.setState({ destError: REINDEX_ERROR_PROMPT.DEST_REQUIRED });
      return false;
    }
    const [dest] = selectedOptions.map((op) => op.label);
    const invalidDest = this.sourceIndicesNames.indexOf(dest) !== -1;
    if (invalidDest) {
      this.setState({ destError: REINDEX_ERROR_PROMPT.DEST_DIFF_WITH_SOURCE });
      return false;
    }
    return true;
  };

  validateSlices = (slices: string): boolean => {
    if (!/^[1-9][0-9]*$|^auto$/.test(slices)) {
      this.setState({ sliceError: REINDEX_ERROR_PROMPT.SLICES_FORMAT_ERROR });
      return false;
    }
    return true;
  };

  onJsonChange = (value: string) => {
    this.setState({ queryJsonString: value });
  };

  onDestSettingsChange = (value: string) => {
    try {
      const parsedJSON = JSON.parse(value);
      this.setState({ destSettingsJson: JSON.stringify(parsedJSON, null, 4) });
    } catch (e) {}
  };

  onSliceChange = (e: ChangeEvent<HTMLInputElement>) => {
    this.setState({ slices: e.target.value.trim(), sliceError: undefined });
    this.validateSlices(e.target.value);
  };

  onWaitForCompleteChange = (e: EuiSwitchEvent) => {
    this.setState({ waitForComplete: e.target.checked });
  };

  onPipelineChange = (selectedOptions: EuiComboBoxOptionOption<void>[]) => {
    this.setState({ selectedPipelines: selectedOptions });
  };

  onConflictsChange = (val: string): void => {
    this.setState({ conflicts: val });
  };

  render() {
    const { onCloseFlyout } = this.props;
    const {
      indexOptions,
      selectedIndexOptions,
      queryJsonString,
      destError,
      destSettingsJson,
      slices,
      sourceErr,
      advancedSettingsOpen,
    } = this.state;
    const { conflicts } = this.state;
    const banner = (
      <EuiCallOut>
        <p>
          It's recommended that destination be configured as wanted before calling <code>_reindex.</code>
        </p>
      </EuiCallOut>
    );

    const advanceTitle = (
      <EuiFlexGroup gutterSize="none" justifyContent="flexStart" alignItems="center">
        <EuiFlexItem grow={false}>
          <EuiButtonIcon
            iconType={advancedSettingsOpen ? "arrowDown" : "arrowRight"}
            color="text"
            onClick={() => {
              this.setState({ advancedSettingsOpen: !this.state.advancedSettingsOpen });
            }}
            aria-label="drop down icon"
          />
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiTitle size="s">
            <h3>Advanced Options</h3>
          </EuiTitle>
        </EuiFlexItem>
      </EuiFlexGroup>
    );

    return (
      <EuiFlyout onClose={() => {}} hideCloseButton>
        <EuiFlyoutHeader hasBorder>
          <EuiTitle size="m">
            <h2 id="flyoutTitle"> Reindex </h2>
          </EuiTitle>
        </EuiFlyoutHeader>

        <EuiFlyoutBody>
          {!sourceErr && banner}

          <EuiSpacer size="m" />

          <IndexDetail onGetIndicesDetail={this.sourceValidation} indices={this.props.sourceIndices.map((item) => item.index)}>
            <>
              {sourceErr && sourceErr.length > 0 && (
                <EuiCallOut color="danger">
                  <ul>
                    {sourceErr.map((err) => (
                      <li key={err.desc}>
                        {err.desc} {err.action}
                      </li>
                    ))}
                  </ul>
                </EuiCallOut>
              )}
            </>
          </IndexDetail>

          {!sourceErr && (
            <>
              <EuiSpacer size="m" />

              <ContentPanel title="Configure destination" titleSize="s">
                <CustomFormRow
                  label="Destination"
                  isInvalid={!!destError}
                  error={destError}
                  fullWidth
                  helpText="Destination where documents writing into could be pre-configured index, data streams or newly created index,
              for newly created index, configuration will show up below you need to customize to wanted"
                >
                  <EuiComboBox
                    placeholder="Select destination"
                    options={indexOptions}
                    async
                    selectedOptions={selectedIndexOptions}
                    onChange={this.onIndicesSelectionChange}
                    onSearchChange={this.getIndexOptions}
                    onCreateOption={this.onCreateOption}
                    isClearable={true}
                    singleSelection={{ asPlainText: true }}
                    data-test-subj="destIndicesComboInput"
                    customOptionText="Create {searchValue} as your destination index"
                  />
                </CustomFormRow>

                <EuiSpacer size="m" />
                {destSettingsJson && (
                  <CustomFormRow
                    label="Destination index configuration"
                    helpText="configurations are copied from source, you should customize it to wanted before click on execute"
                    fullWidth
                  >
                    <JSONEditor
                      mode="json"
                      width="100%"
                      value={destSettingsJson}
                      onChange={this.onDestSettingsChange}
                      aria-label="Code Editor"
                      data-test-subj="destSettingJsonEditor"
                    />
                  </CustomFormRow>
                )}
              </ContentPanel>

              <EuiSpacer size="m" />

              <ContentPanel title={advanceTitle}>
                {advancedSettingsOpen && (
                  <ReindexAdvancedOptions
                    slices={slices}
                    onSlicesChange={this.onSliceChange}
                    sliceErr={this.state.sliceError}
                    pipelines={this.state.pipelines}
                    selectedPipelines={this.state.selectedPipelines}
                    onSelectedPipelinesChange={this.onPipelineChange}
                    queryJsonString={queryJsonString}
                    onQueryJsonChange={this.onJsonChange}
                    conflicts={conflicts}
                    onConflictsChange={this.onConflictsChange}
                  />
                )}
              </ContentPanel>
            </>
          )}
        </EuiFlyoutBody>

        <EuiFlyoutFooter>
          <FlyoutFooter
            edit={false}
            action=""
            disabledAction={sourceErr && sourceErr.length > 0}
            text="Execute"
            onClickAction={this.onClickAction}
            onClickCancel={onCloseFlyout}
          />
        </EuiFlyoutFooter>
      </EuiFlyout>
    );
  }
}
