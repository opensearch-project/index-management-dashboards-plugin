/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiAccordion,
  EuiCallOut,
  EuiComboBox,
  EuiComboBoxOptionOption,
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutFooter,
  EuiFlyoutHeader,
  EuiLink,
  EuiSpacer,
  EuiSwitchEvent,
  EuiText,
  EuiTitle,
} from "@elastic/eui";
import _ from "lodash";
import React, { ChangeEvent, Component } from "react";
import FlyoutFooter from "../../../VisualCreatePolicy/components/FlyoutFooter";
import { CoreServicesContext } from "../../../../components/core_services";
import { getErrorMessage } from "../../../../utils/helpers";
import { IndexItem } from "../../../../../models/interfaces";
import { DEFAULT_QUERY, ERROR_PROMPT } from "../../utils/constants";
import JSONEditor from "../../../../components/JSONEditor";
import { REQUEST } from "../../../../../utils/constants";
import { ReindexRequest } from "../../models/interfaces";
import { DSL_DOCUMENTATION_URL } from "../../../../utils/constants";
import { BrowserServices } from "../../../../models/interfaces";
import ReindexAdvancedOptions from "../ReindexAdvancedOptions/ReindexAdvancedOptions";
import CustomFormRow from "../../../../components/CustomFormRow";
import { ManagedCatIndex } from "../../../../../server/models/interfaces";

interface ReindexProps {
  services: BrowserServices;
  sourceIndices: ManagedCatIndex[];
  onCloseFlyout: () => void;
  onReindexConfirm: (request: ReindexRequest) => void;
}

interface ReindexState {
  indexOptions: EuiComboBoxOptionOption<IndexItem>[];
  dataStreams: EuiComboBoxOptionOption<IndexItem>[];
  selectedIndexOptions: EuiComboBoxOptionOption<IndexItem>[];
  queryJsonString: string;
  destError?: string;
  destSettingsJson?: string;
  sourceErr?: string[];
  slices: string;
  waitForComplete: boolean;
  pipelines: EuiComboBoxOptionOption<void>[];
  selectedPipelines?: EuiComboBoxOptionOption<void>[];
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

  sourceValidation = async (sourceIndices: ManagedCatIndex[]) => {
    const {
      services: { commonService },
    } = this.props;

    let errors = [];

    sourceIndices
      .filter((item) => item.status.toLowerCase() === "close")
      .forEach((item) => {
        errors.push(`Index [${item.index}] status is closed`);
      });

    const res = await commonService.apiCaller({
      endpoint: "indices.getFieldMapping",
      data: {
        fields: "_source",
        index: sourceIndices.map((idx) => idx.index).join(","),
      },
    });
    if (res && res.ok) {
      for (let index of this.sourceIndicesNames) {
        const sourceEnabled = _.get(res.response, [index, "mappings", "_source", "mapping", "_source", "enabled"]);
        if (sourceEnabled === false) {
          errors.push(`Index [${index}] didn't store _source, it's required by reindex`);
        }
      }
      if (errors.length > 0) {
        this.setState({ sourceErr: errors });
      }
    } else {
      // let reindex api to do the check when execute
    }
  };

  onIndicesSelectionChange = (selectedOptions: EuiComboBoxOptionOption<IndexItem>[]) => {
    this.setState({
      selectedIndexOptions: selectedOptions,
      destSettingsJson: undefined,
    });
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
        if (res.error.startsWith("[index_not_found_exception]")) {
          this.context.notifications.toasts.addDanger("No index available");
        } else {
          this.context.notifications.toasts.addDanger(res.error);
        }
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

    this.setState({ selectedIndexOptions: [newOption] });
  };

  populateSourceIndexSettings = async (dest: string) => {
    const {
      services: { commonService },
    } = this.props;
    if (this.sourceIndicesNames.length === 1 && this.sourceIndicesNames[0] != dest) {
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
        _.unset(index, "aliases");
        _.unset(index.settings, "index.resize");
        _.unset(index.settings, "index.blocks");
        _.unset(index.settings, "index.routing");
        _.unset(index.settings, "index.provided_name");
        _.unset(index.settings, "index.creation_date");
        _.unset(index.settings, "index.uuid");
        _.unset(index.settings, "index.version");
        this.setState({ destSettingsJson: JSON.stringify(index, null, 4) });
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

    if (!selectedIndexOptions || selectedIndexOptions.length != 1) {
      this.setState({ destError: ERROR_PROMPT.DEST_REQUIRED });
      return;
    }
    let [dest] = selectedIndexOptions.map((op) => op.label);
    let invalidDest: boolean = this.sourceIndicesNames.indexOf(dest) !== -1;
    if (invalidDest) {
      this.setState({ destError: ERROR_PROMPT.DEST_DIFF_WITH_SOURCE });
      return;
    }

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
        if (createRes.error) {
          this.context.notifications.toasts.addDanger(`Create dest index ${dest} with error ${createRes.error}`);
          return;
        }
      }
      let reindexReq: ReindexRequest = {
        waitForCompletion: waitForComplete,
        slices: slices,
        body: {
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

  onJsonChange = (value: string) => {
    this.setState({ queryJsonString: value });
  };

  onDestSettingsChange = (value: string) => {
    const parsedJSON = JSON.parse(value);
    this.setState({ destSettingsJson: JSON.stringify(parsedJSON, null, 4) });
  };

  onSliceChange = (e: ChangeEvent<HTMLInputElement>) => {
    this.setState({ slices: e.target.value.trim() });
  };

  onWaitForCompleteChange = (e: EuiSwitchEvent) => {
    this.setState({ waitForComplete: e.target.checked });
  };

  onPipelineChange = (selectedOptions: EuiComboBoxOptionOption<void>[]) => {
    this.setState({ selectedPipelines: selectedOptions });
  };

  render() {
    const { onCloseFlyout, sourceIndices } = this.props;
    const { indexOptions, selectedIndexOptions, queryJsonString, destError, destSettingsJson, sourceErr, slices } = this.state;
    const banner = (
      <EuiCallOut>
        <p>
          It's recommended that destination be configured as wanted before calling <code>_reindex.</code>
          Reindex doesn't copy the settings from the source or its associated template.
        </p>
      </EuiCallOut>
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
          {sourceErr && sourceErr.length > 0 && (
            <EuiCallOut title="Source validation error" color="danger" iconType="alert">
              <ul>
                {sourceErr.map((err) => (
                  <li key={err}>{err}</li>
                ))}
              </ul>
            </EuiCallOut>
          )}

          <EuiSpacer size="m" />

          <CustomFormRow label="Source">
            <EuiComboBox
              options={indexOptions}
              selectedOptions={sourceIndices.map((item) => ({ label: item.index }))}
              isDisabled
              data-test-subj="sourceIndicesComboInput"
            />
          </CustomFormRow>

          <EuiSpacer size="m" />

          <CustomFormRow
            label="Destination"
            isInvalid={!!destError}
            error={destError}
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

          <EuiSpacer size="m" />

          <CustomFormRow
            label="Query expression to reindex a subset of source documents"
            labelAppend={
              <EuiText size="xs">
                <EuiLink href={DSL_DOCUMENTATION_URL} target="_blank" rel="noopener noreferrer">
                  learn more about query-dsl
                </EuiLink>
              </EuiText>
            }
          >
            <JSONEditor
              mode="json"
              width="100%"
              value={queryJsonString}
              onChange={this.onJsonChange}
              aria-label="Query DSL Editor"
              height="150px"
              data-test-subj="queryJsonEditor"
            />
          </CustomFormRow>

          <EuiSpacer size="m" />

          <EuiAccordion id="advancedReindexOptions" buttonContent="Advanced options">
            <EuiSpacer size="m" />
            <ReindexAdvancedOptions
              slices={slices}
              onSlicesChange={this.onSliceChange}
              pipelines={this.state.pipelines}
              selectedPipelines={this.state.selectedPipelines}
              onSelectedPipelinesChange={this.onPipelineChange}
            />
          </EuiAccordion>
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
