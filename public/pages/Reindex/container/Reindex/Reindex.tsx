/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiButton,
  EuiButtonEmpty,
  EuiButtonIcon,
  EuiComboBoxOptionOption,
  EuiFlexGroup,
  EuiFlexItem,
  EuiLink,
  EuiRadioGroup,
  EuiSpacer,
  EuiSwitchEvent,
  EuiText,
  EuiTitle,
} from "@elastic/eui";
import _ from "lodash";
import React, { ChangeEvent, Component } from "react";
import { CoreServicesContext } from "../../../../components/core_services";
import { getErrorMessage } from "../../../../utils/helpers";
import { ReindexRequest } from "../../models/interfaces";
import CustomFormRow from "../../../../components/CustomFormRow";
import { CatIndex } from "../../../../../server/models/interfaces";
import { ContentPanel } from "../../../../components/ContentPanel";
import ReindexAdvancedOptions from "../../components/ReindexAdvancedOptions";
import { BREADCRUMBS, DSL_DOCUMENTATION_URL, ROUTES, SNAPSHOT_MANAGEMENT_DOCUMENTATION_URL } from "../../../../utils/constants";
import { CommonService, IndexService } from "../../../../services";
import { RouteComponentProps } from "react-router-dom";
import IndexSelect from "../../components/IndexSelect";
import { DEFAULT_QUERY, DEFAULT_SLICE, REINDEX_ERROR_PROMPT } from "../../utils/constants";
import JSONEditor from "../../../../components/JSONEditor";
import { ReindexResponse } from "../../../Indices/models/interfaces";
import { REQUEST } from "../../../../../utils/constants";
import CreateIndexFlyout from "../../components/CreateIndexFlyout";
import queryString from "query-string";

interface ReindexProps extends RouteComponentProps {
  commonService: CommonService;
  indexService: IndexService;
}

interface ReindexState {
  indexOptions: EuiComboBoxOptionOption<CatIndex>[];
  dataStreams: EuiComboBoxOptionOption<CatIndex>[];
  sources: EuiComboBoxOptionOption<CatIndex>[];
  sourceErr: string[];
  destination: EuiComboBoxOptionOption<CatIndex>[];
  destError: string | null;
  subset: boolean;
  sourceQuery: string;
  advancedSettingsOpen: boolean;
  slices: string;
  sliceError?: string;
  pipelines: EuiComboBoxOptionOption[];
  selectedPipelines?: EuiComboBoxOptionOption[];
  conflicts: string;
  executing: boolean;
  showCreateIndexFlyout: boolean;
}

export default class Reindex extends Component<ReindexProps, ReindexState> {
  static contextType = CoreServicesContext;

  constructor(props: ReindexProps) {
    super(props);

    this.state = {
      sources: [],
      indexOptions: [],
      dataStreams: [],
      destination: [],
      sourceQuery: DEFAULT_QUERY,
      slices: DEFAULT_SLICE,
      pipelines: [],
      advancedSettingsOpen: false,
      conflicts: "abort",
      sourceErr: [],
      destError: null,
      subset: false,
      executing: false,
      showCreateIndexFlyout: false,
    };
  }

  async componentDidMount() {
    this.context.chrome.setBreadcrumbs([BREADCRUMBS.INDEX_MANAGEMENT, BREADCRUMBS.INDICES, BREADCRUMBS.REINDEX]);

    const { source } = queryString.parse(this.props.location.search);
    this.setState({ sources: typeof source === "string" ? source.split(",").map((index) => ({ label: index })) : [] });
  }

  getIndexOptions = async (searchValue: string) => {
    const { indexService } = this.props;
    const { sources } = this.state;
    const sourceIndexNames = sources.map((op) => op.label);
    let options: EuiComboBoxOptionOption<CatIndex>[] = [];
    try {
      const [res, aliasResponse] = await Promise.all([
        indexService.getDataStreamsAndIndicesNames(searchValue.trim()),
        indexService.getAliases({ search: searchValue.trim() }),
      ]);
      if (res.ok) {
        const dataStreams = res.response.dataStreams.map((label) => ({ label }));
        const indices = res.response.indices
          .filter((index) => {
            return sourceIndexNames.indexOf(index) === -1 && !index.startsWith(".ds-");
          })
          .map((label) => ({ label }));
        options.push({ label: "indices", options: indices });
        options.push({ label: "dataStreams", options: dataStreams });
      } else {
        this.context.notifications.toasts.addDanger(res.error);
      }

      if (aliasResponse && aliasResponse.ok) {
        const aliases = _.uniq(aliasResponse.response.aliases.map((alias) => alias.alias))
          // TODO system alias
          .filter((alias) => !alias.startsWith("."))
          .map((label) => ({ label }));
        options.push({ label: "aliases", options: aliases });
      } else {
        this.context.notifications.toasts.addDanger(aliasResponse.error);
      }
    } catch (err) {
      this.context.notifications.toasts.addDanger(getErrorMessage(err, "There was a problem fetching index options."));
    }
    return options;
  };

  getAllPipelines = async () => {
    const { commonService } = this.props;
    let pipelines: EuiComboBoxOptionOption[] = [];
    const pipelineRes = await commonService.apiCaller({
      endpoint: "ingest.getPipeline",
    });
    if (pipelineRes && pipelineRes.ok) {
      pipelines = _.keys(pipelineRes.response).map((pipeline) => ({ label: pipeline }));
    } else {
      throw new Error(pipelineRes?.error || "");
    }
    return pipelines;
  };

  onClickAction = async () => {
    const { sourceQuery, destination, dataStreams, slices, selectedPipelines, conflicts, sources } = this.state;

    if (!this.validateDestination(destination) || !this.validateSlices(slices)) {
      return;
    }

    const [dest] = destination.map((op) => op.label);

    let isDestAsDataStream = dataStreams.map((ds) => ds.label).indexOf(dest) !== -1;

    try {
      this.setState({ executing: true });
      let reindexReq: ReindexRequest = {
        waitForCompletion: false,
        slices: slices,
        body: {
          conflicts: conflicts,
          source: {
            index: sources.map((item) => item.label).join(","),
            ...JSON.parse(sourceQuery),
          },
          dest: {
            index: destination.map((item) => item.label)[0],
            op_type: isDestAsDataStream ? "create" : "index",
          },
        },
      };
      // set pipeline if available
      if (selectedPipelines && selectedPipelines.length > 0) {
        reindexReq.body.dest.pipeline = selectedPipelines[0].label;
      }
      await this.onReindexConfirm(reindexReq);
    } catch (error) {
      this.context.notifications.toasts.addDanger(`Reindex operation error happened ${error}`);
    } finally {
      this.setState({ executing: false });
    }
  };

  onReindexConfirm = async (reindexRequest: ReindexRequest) => {
    const res = await this.props.commonService.apiCaller<ReindexResponse>({
      endpoint: "transport.request",
      method: REQUEST.POST,
      data: {
        path: `_reindex?slices=${reindexRequest.slices}&wait_for_completion=${reindexRequest.waitForCompletion}`,
        method: REQUEST.POST,
        body: reindexRequest.body,
      },
    });
    if (res && res.ok) {
      // @ts-ignore
      const toast = `Reindex from [${reindexRequest.body.source.index}] to [${reindexRequest.body.dest.index}] success with taskId ${res.response.task}`;
      // back to indices page
      this.onCancel();
      this.context.notifications.toasts.addSuccess(toast);
    } else {
      this.context.notifications.toasts.addDanger(`Reindex operation error ${res?.error}`);
    }
  };

  // validation
  validateDestination = (selectedOptions: EuiComboBoxOptionOption<CatIndex>[]): boolean => {
    const { sources } = this.state;
    if (!selectedOptions || selectedOptions.length != 1) {
      this.setState({ destError: REINDEX_ERROR_PROMPT.DEST_REQUIRED });
      return false;
    }
    const [dest] = selectedOptions.map((op) => op.label);
    // TODO expand with alias
    const invalidDest = sources.map((index) => index.label).indexOf(dest) !== -1;
    if (invalidDest) {
      this.setState({ destError: REINDEX_ERROR_PROMPT.DEST_DIFF_WITH_SOURCE });
      return false;
    }
    return true;
  };
  validateSource = async (sourceIndices: EuiComboBoxOptionOption<CatIndex>[]) => {
    if (sourceIndices.length == 0) {
      return;
    }

    const { commonService } = this.props;

    let errors = [];

    sourceIndices
      .filter((item) => item.value?.status.toLowerCase() === "close")
      .forEach((item) => {
        errors.push(`Index [${item.label}] status is closed`);
      });

    // validate _source for non-closed indices only, closed index won't return the mapping
    const res = await commonService.apiCaller({
      endpoint: "indices.getFieldMapping",
      data: {
        fields: "_source",
        index: sourceIndices
          .filter((item) => item.value?.status.toLowerCase() !== "close")
          .map((item) => item.label)
          .join(","),
      },
    });
    if (res && res.ok) {
      for (const index of sourceIndices) {
        const sourceEnabled = _.get(res.response, [index.label, "mappings", "_source", "mapping", "_source", "enabled"]);
        if (sourceEnabled === false) {
          errors.push(`Index [${index}] didn't store _source, it's required by reindex`);
        }
      }
    } else {
      this.context.notifications.toasts.addDanger(res?.error || "can't validate whether _source is enabled for source");
    }

    this.setState({ sourceErr: errors });
  };

  validateSlices = (slices: string): boolean => {
    const sliceRegex = /^[1-9][0-9]*$|^auto$/;
    if (!sliceRegex.test(slices)) {
      this.setState({ sliceError: REINDEX_ERROR_PROMPT.SLICES_FORMAT_ERROR });
      return false;
    }
    return true;
  };

  onCancel = () => {
    this.props.history.push(ROUTES.INDICES);
  };

  onCreateIndexSuccess = (indexName: string) => {
    const option: EuiComboBoxOptionOption<CatIndex>[] = [{ label: indexName }];
    this.setState({ destination: option });
  };

  // onChange
  onSourceSelection = async (selectedOptions: EuiComboBoxOptionOption<CatIndex>[]) => {
    this.setState({
      sources: selectedOptions,
      sourceErr: [],
    });

    await this.validateSource(selectedOptions);
  };

  onDestinationSelection = (selectedOptions: EuiComboBoxOptionOption<CatIndex>[]) => {
    this.setState({
      destination: selectedOptions,
      destError: null,
    });

    this.validateDestination(selectedOptions);
  };

  onSourceQueryChange = (value: string) => {
    this.setState({ sourceQuery: value });
  };

  onSliceChange = (e: ChangeEvent<HTMLInputElement>) => {
    this.setState({ slices: e.target.value.trim(), sliceError: undefined });
    this.validateSlices(e.target.value);
  };

  onPipelineChange = (selectedOptions: EuiComboBoxOptionOption[]) => {
    this.setState({ selectedPipelines: selectedOptions });
  };

  onConflictsChange = (val: string): void => {
    this.setState({ conflicts: val });
  };

  onSubsetChange = (event: EuiSwitchEvent) => {
    this.setState({ subset: event.target.checked });
  };

  render() {
    const { sources, destination, sourceQuery, destError, slices, sourceErr, advancedSettingsOpen, showCreateIndexFlyout } = this.state;
    const { conflicts, subset, executing } = this.state;

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
            <h3>Advanced Settings</h3>
          </EuiTitle>
        </EuiFlexItem>
      </EuiFlexGroup>
    );

    const subTitleText = (
      <EuiText color="subdued" size="s" style={{ padding: "5px 0px" }}>
        <p style={{ fontWeight: 200 }}>
          With the reindex operation, you can copy all or a subset of documents that you select through a query to another index{" "}
          <EuiLink href={SNAPSHOT_MANAGEMENT_DOCUMENTATION_URL} target="_blank" rel="noopener noreferrer">
            Learn more
          </EuiLink>
        </p>
      </EuiText>
    );

    return (
      <div style={{ padding: "0px 50px" }}>
        <EuiTitle size="l">
          <h1>Reindex</h1>
        </EuiTitle>
        {subTitleText}
        <EuiSpacer />

        <ContentPanel title="Configure source index" titleSize="s">
          <EuiSpacer />
          <CustomFormRow
            label="Specify source index or data streams"
            isInvalid={sourceErr.length > 0}
            error={sourceErr}
            fullWidth
            helpText="Specify one or more indexes or data streams you want to reindex from."
          >
            <IndexSelect
              getIndexOptions={this.getIndexOptions}
              onSelectedOptions={this.onSourceSelection}
              singleSelect={false}
              selectedOption={sources}
            />
          </CustomFormRow>

          <EuiSpacer />
          <CustomFormRow>
            <>
              <EuiRadioGroup
                options={[
                  {
                    id: "all",
                    label: "Reindex all documents",
                  },
                  {
                    id: "subset",
                    label: "Reindex a subset of documents (advanced)",
                  },
                ]}
                idSelected={subset ? "subset" : "all"}
                onChange={(id) => {
                  this.setState({ subset: id === "subset" });
                }}
                name="subsetOption"
                legend={{
                  children: <span>Specify a reindex option</span>,
                }}
              />
              <EuiSpacer />
              {subset && (
                <CustomFormRow
                  label="Query expression"
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
                    value={sourceQuery}
                    onChange={this.onSourceQueryChange}
                    aria-label="Query DSL Editor"
                    height="150px"
                    data-test-subj="queryJsonEditor"
                  />
                </CustomFormRow>
              )}
            </>
          </CustomFormRow>
        </ContentPanel>

        <EuiSpacer />

        <ContentPanel title="Configure destination index" titleSize="s">
          <EuiSpacer />
          <EuiFlexGroup alignItems="flexEnd">
            <EuiFlexItem style={{ maxWidth: "400px" }}>
              <CustomFormRow label="Specify destination index or data streams" isInvalid={!!destError} error={destError}>
                <IndexSelect
                  getIndexOptions={this.getIndexOptions}
                  onSelectedOptions={this.onDestinationSelection}
                  singleSelect={true}
                  selectedOption={destination}
                />
              </CustomFormRow>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiButton onClick={() => this.setState({ showCreateIndexFlyout: true })}>Create Index</EuiButton>
            </EuiFlexItem>
          </EuiFlexGroup>
        </ContentPanel>

        <EuiSpacer />

        <ContentPanel title={advanceTitle}>
          {advancedSettingsOpen && (
            <ReindexAdvancedOptions
              slices={slices}
              onSlicesChange={this.onSliceChange}
              sliceErr={this.state.sliceError}
              getAllPipelines={this.getAllPipelines}
              selectedPipelines={this.state.selectedPipelines}
              onSelectedPipelinesChange={this.onPipelineChange}
              conflicts={conflicts}
              onConflictsChange={this.onConflictsChange}
            />
          )}
        </ContentPanel>

        <EuiSpacer />
        <EuiSpacer />

        <EuiFlexGroup alignItems="center" justifyContent="flexEnd">
          <EuiFlexItem grow={false}>
            <EuiButtonEmpty onClick={this.onCancel} data-test-subj="reindexCancelButton">
              Cancel
            </EuiButtonEmpty>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButton
              fill
              disabled={sourceErr.length > 0}
              onClick={this.onClickAction}
              isLoading={executing}
              data-test-subj="reindexConfirmButton"
            >
              Execute
            </EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup>

        {showCreateIndexFlyout && (
          <CreateIndexFlyout
            commonService={this.props.commonService}
            onSubmitSuccess={this.onCreateIndexSuccess}
            sourceIndices={sources.map((item) => item.label)}
            onCancel={() => this.setState({ showCreateIndexFlyout: false })}
          />
        )}
      </div>
    );
  }
}
