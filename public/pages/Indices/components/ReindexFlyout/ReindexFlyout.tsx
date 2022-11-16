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

interface ReindexProps {
  services: BrowserServices;
  sourceIndices: ManagedCatIndex[];
  onCloseFlyout: () => void;
  onReindexConfirm: (request: ReindexRequest) => void;
  openIndex: (indices: string[], callback: any) => Promise<void>;
  getIndices: () => Promise<void>;
}

interface ReindexState {
  indexOptions: EuiComboBoxOptionOption<IndexItem>[];
  dataStreams: EuiComboBoxOptionOption<IndexItem>[];
  destSelectedOption: EuiComboBoxOptionOption<IndexItem>[];
  queryJsonString: string;
  destError?: string;
  destSettingsJson?: string;
  sourceErr: ReindexActonItem[];
  slices: string;
  sliceError?: string;
  waitForComplete: boolean;
  pipelines: EuiComboBoxOptionOption<void>[];
  selectedPipelines?: EuiComboBoxOptionOption<void>[];
  advancedSettingsOpen: boolean;
  conflicts: string;
  subset: boolean;
  executing: boolean;
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
      destSelectedOption: [],
      queryJsonString: DEFAULT_QUERY,
      waitForComplete: false,
      slices: DEFAULT_SLICE,
      pipelines: [],
      advancedSettingsOpen: false,
      conflicts: "abort",
      sourceErr: [],
      subset: false,
      executing: false,
    };

    this.sourceIndicesNames = this.props.sourceIndices.map((idx) => idx.index);
  }

  async componentDidMount() {
    await this.getIndexOptions("");
    await this.getAllPipelines();
  }

  onOpenIndex = async (index: string) => {
    const { openIndex, getIndices } = this.props;
    await openIndex([index], async () => {
      await getIndices();
      await this.sourceValidation(this.props.sourceIndices);
    });
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
            <EuiButton data-test-subj={`${item.index}-close`} size="s" onClick={() => this.onOpenIndex(item.index)}>
              open
            </EuiButton>
          ),
        });
      });

    // validate _source for non-closed indices only, closed index won't return the mapping
    const res = await commonService.apiCaller({
      endpoint: "indices.getFieldMapping",
      data: {
        fields: "_source",
        index: sourceIndices
          .filter((item) => item.status !== "close")
          .map((item) => item.index)
          .join(","),
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
    } else {
      this.context.notifications.toasts.addDanger(res?.error || "can't validate whether _source is enabled for source");
    }

    this.setState({ sourceErr: errors });
  };

  onIndicesSelectionChange = (selectedOptions: EuiComboBoxOptionOption<IndexItem>[]) => {
    this.setState({
      destSelectedOption: selectedOptions,
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
    const duplicateDest = sourceIndices.map((item) => item.index).indexOf(dest) !== -1;
    const source = this.sourceIndicesNames[0];
    if (!duplicateDest) {
      const res = await commonService.apiCaller({
        endpoint: "indices.get",
        method: REQUEST.GET,
        data: {
          index: source, // get first source configuration
        },
      });
      if (res && res.ok) {
        // @ts-ignore
        let index = res.response[source];
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
      } else {
        this.context.notifications.toasts.addDanger(`Get source index ${source} setting/mappings error ${res?.error}`);
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
    const { queryJsonString, destSelectedOption, dataStreams, destSettingsJson, waitForComplete, slices, selectedPipelines } = this.state;
    const { conflicts } = this.state;

    if (!this.validateDestination(destSelectedOption) || !this.validateSlices(slices)) {
      return;
    }

    const [dest] = destSelectedOption.map((op) => op.label);

    let isDestAsDataStream = dataStreams.map((ds) => ds.label).indexOf(dest) !== -1;

    try {
      this.setState({ executing: true });
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
            index: destSelectedOption.map((op) => op.label)[0],
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
    } finally {
      this.setState({ executing: false });
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
    const sliceRegex = /^[1-9][0-9]*$|^auto$/;
    if (!sliceRegex.test(slices)) {
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

  onSubsetChange = (event: EuiSwitchEvent) => {
    this.setState({ subset: event.target.checked });
  };

  render() {
    const { onCloseFlyout } = this.props;
    const {
      indexOptions,
      destSelectedOption,
      queryJsonString,
      destError,
      destSettingsJson,
      slices,
      sourceErr,
      advancedSettingsOpen,
    } = this.state;
    const { conflicts, subset, executing } = this.state;
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
            data-test-subj="advanceOptionToggle"
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
          {sourceErr.length === 0 && banner}

          <EuiSpacer size="m" />

          <IndexDetail onGetIndicesDetail={this.sourceValidation} indices={this.props.sourceIndices.map((item) => item.index)}>
            <>
              {sourceErr.length > 0 && (
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

          {sourceErr.length === 0 && (
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
                    selectedOptions={destSelectedOption}
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
                    subset={subset}
                    onSubsetChange={this.onSubsetChange}
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
            isLoading={executing}
            onClickAction={this.onClickAction}
            onClickCancel={onCloseFlyout}
          />
        </EuiFlyoutFooter>
      </EuiFlyout>
    );
  }
}
