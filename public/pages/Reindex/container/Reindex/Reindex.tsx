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
import { IndexSelectItem, ReindexRequest, ReindexResponse } from "../../models/interfaces";
import CustomFormRow from "../../../../components/CustomFormRow";
import { ContentPanel } from "../../../../components/ContentPanel";
import ReindexAdvancedOptions from "../../components/ReindexAdvancedOptions";
import { BREADCRUMBS, DSL_DOCUMENTATION_URL, REINDEX_DOCUMENTATION_URL, ROUTES } from "../../../../utils/constants";
import { CommonService, IndexService } from "../../../../services";
import { RouteComponentProps } from "react-router-dom";
import IndexSelect from "../../components/IndexSelect";
import { DEFAULT_QUERY, DEFAULT_SLICE, REINDEX_ERROR_PROMPT } from "../../utils/constants";
import JSONEditor from "../../../../components/JSONEditor";
import { REQUEST } from "../../../../../utils/constants";
import CreateIndexFlyout from "../../components/CreateIndexFlyout";
import queryString from "query-string";

interface ReindexProps extends RouteComponentProps {
  commonService: CommonService;
  indexService: IndexService;
}

interface ReindexState {
  indexOptions: EuiComboBoxOptionOption<IndexSelectItem>[];
  sources: EuiComboBoxOptionOption<IndexSelectItem>[];
  sourceErr: string[];
  destination: EuiComboBoxOptionOption<IndexSelectItem>[];
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
    const { indexService } = this.props;
    this.context.chrome.setBreadcrumbs([BREADCRUMBS.INDEX_MANAGEMENT, BREADCRUMBS.INDICES, BREADCRUMBS.REINDEX]);

    const { source } = queryString.parse(this.props.location.search);

    if (typeof source === "string") {
      const res = await indexService.getIndices({
        from: 0,
        size: 10,
        search: source,
        terms: source,
        sortDirection: "desc",
        sortField: "index",
        showDataStreams: false,
      });
      if (res && res.ok) {
        const arr = source.split(",");
        const selectedSource = res.response.indices
          .filter((item) => arr.indexOf(item.index) !== -1)
          .map((item) => ({
            label: item.index,
            value: {
              isIndex: true,
              status: item.status,
              health: item.health,
            },
          }));
        await this.onSourceSelection(selectedSource);
      } else {
        this.context.notifications.toasts.addDanger(res?.error || "Get index detail error");
      }
    }
  }

  getIndexOptions = async (searchValue: string) => {
    const { indexService } = this.props;
    let options: EuiComboBoxOptionOption<IndexSelectItem>[] = [];
    try {
      const [indexResponse, dataStreamResponse, aliasResponse] = await Promise.all([
        indexService.getIndices({
          from: 0,
          size: 10,
          search: searchValue,
          terms: [searchValue.trim()],
          sortDirection: "desc",
          sortField: "index",
          showDataStreams: false,
        }),
        indexService.getDataStreams({ search: searchValue.trim() }),
        indexService.getAliases({ search: searchValue.trim() }),
      ]);
      if (indexResponse.ok) {
        const indices = indexResponse.response.indices
          .filter((index) => {
            return !index.index.startsWith(".ds-");
          })
          .map((index) => ({
            label: index.index,
            value: { isIndex: true, status: index.status, health: index.health },
          }));
        options.push({ label: "indices", options: indices });
      } else {
        this.context.notifications.toasts.addDanger(indexResponse.error);
      }

      if (dataStreamResponse && dataStreamResponse.ok) {
        const dataStreams = dataStreamResponse.response.dataStreams.map((ds) => ({
          label: ds.name,
          health: ds.status.toLowerCase(),
          value: {
            isDataStream: true,
            indices: ds.indices.map((item) => item.index_name).slice(0, 1),
          },
        }));
        options.push({ label: "dataStreams", options: dataStreams });
      }

      if (aliasResponse && aliasResponse.ok) {
        const aliases = _.uniq(aliasResponse.response.aliases.map((alias) => alias.alias))
          // TODO system alias
          .filter((alias) => !alias.startsWith("."))
          .map((name) => {
            const indexBelongsToAlias = aliasResponse.response.aliases.filter((alias) => alias.alias === name).map((alias) => alias.index);
            let writingIndex = aliasResponse.response.aliases
              .filter((alias) => alias.alias === name && alias.is_write_index === "true")
              .map((alias) => alias.index);
            if (writingIndex.length === 0 && indexBelongsToAlias.length === 1) {
              // set writing index when there is only 1 index for alias
              writingIndex = indexBelongsToAlias;
            }
            return {
              label: name,
              value: {
                isAlias: true,
                indices: indexBelongsToAlias,
                writingIndex: writingIndex,
              },
            };
          });
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
      if (pipelineRes.error.indexOf("Not Found") === -1) {
        throw new Error(pipelineRes?.error || "");
      }
    }
    return pipelines;
  };

  onClickAction = async () => {
    const { sourceQuery, destination, slices, selectedPipelines, conflicts, sources } = this.state;

    if (!(await this.validateSource(sources)) || !this.validateDestination(destination) || !this.validateSlices(slices)) {
      return;
    }

    const [isDestAsDataStream] = destination.map((dest) => dest.value?.isDataStream);

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

  getAllSelectedIndices = (): string[] => {
    const { sources } = this.state;
    let result: string[] = [];
    sources.forEach((item) => {
      item.value?.isIndex && result.push(item.label);
      item.value?.isAlias && item.value.indices && result.push(...item.value.indices);
      item.value?.isDataStream && item.value.indices && result.push(...item.value.indices);
    });
    return result;
  };

  // validation
  validateDestination = (selectedOptions: EuiComboBoxOptionOption<IndexSelectItem>[]): boolean => {
    const { sources } = this.state;
    if (!selectedOptions || selectedOptions.length != 1) {
      this.setState({ destError: REINDEX_ERROR_PROMPT.DEST_REQUIRED });
      return false;
    }

    const [dest] = selectedOptions;
    if (dest.value?.health === "red") {
      this.setState({ destError: `Index [${dest.label}] ${REINDEX_ERROR_PROMPT.HEALTH_RED}` });
      return false;
    }

    if (dest.value?.status === "close") {
      this.setState({ destError: `Index [${dest.label}] status is closed` });
      return false;
    }

    // if destination is alias, then it must have a writing index behind it
    if (dest.value?.isAlias) {
      if (!dest.value?.writingIndex || dest.value.writingIndex.length !== 1) {
        this.setState({ destError: `Alias [${dest.label}] don't have writing index behind it` });
        return false;
      }
    }

    let expandedSource: string[] = [],
      expandedDestination: string[] = [];
    sources.forEach((item) => {
      expandedSource.push(item.label);
      item.value?.isAlias && item.value.indices && expandedSource.push(...item.value.indices);
    });

    selectedOptions.forEach((item) => {
      expandedDestination.push(item.label);
      item.value?.isAlias && item.value.writingIndex && expandedDestination.push(...item.value.writingIndex);
    });

    const duplication = _.intersection(expandedSource, expandedDestination);
    if (duplication.length > 0) {
      this.setState({ destError: `Index [${duplication.join(",")}] both exists in source and destination` });
      return false;
    }
    return true;
  };

  validateSource = async (sourceIndices: EuiComboBoxOptionOption<IndexSelectItem>[]): Promise<boolean> => {
    if (sourceIndices.length == 0) {
      this.setState({ sourceErr: [REINDEX_ERROR_PROMPT.SOURCE_REQUIRED] });
      return false;
    }

    let errors = [];

    for (const source of sourceIndices) {
      if (source.value?.health === "red") {
        errors.push(`Index [${source.label}] ${REINDEX_ERROR_PROMPT.HEALTH_RED}`);
      }
    }

    const { commonService } = this.props;

    sourceIndices
      .filter((item) => item.value?.status === "close")
      .forEach((item) => {
        errors.push(`Index [${item.label}] status is closed`);
      });

    // validate _source for non-closed indices only, closed index won't return the mapping
    const res = await commonService.apiCaller({
      endpoint: "indices.getFieldMapping",
      data: {
        fields: "_source",
        index: sourceIndices
          .filter((item) => item.value?.status !== "close")
          .map((item) => item.label)
          .join(","),
      },
    });
    if (res && res.ok) {
      for (const index of sourceIndices) {
        const sourceEnabled = _.get(res.response, [index.label, "mappings", "_source", "mapping", "_source", "enabled"]);
        if (sourceEnabled === false) {
          errors.push(`Index [${index.label}] _sources is not enabled`);
        }
      }
    } else {
      this.context.notifications.toasts.addDanger(res?.error || "can't validate whether _source is enabled for source");
    }

    this.setState({ sourceErr: errors });
    return errors.length === 0;
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
    const option: EuiComboBoxOptionOption<IndexSelectItem>[] = [{ label: indexName }];
    this.setState({ destination: option, showCreateIndexFlyout: false, destError: null });
  };

  // onChange
  onSourceSelection = async (selectedOptions: EuiComboBoxOptionOption<IndexSelectItem>[]) => {
    this.setState({
      sources: selectedOptions,
      sourceErr: [],
    });

    await this.validateSource(selectedOptions);
  };

  onDestinationSelection = (selectedOptions: EuiComboBoxOptionOption<IndexSelectItem>[]) => {
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
          <EuiLink href={REINDEX_DOCUMENTATION_URL} target="_blank" rel="noopener noreferrer">
            Learn more
          </EuiLink>
        </p>
      </EuiText>
    );

    // expand data streams and aliases
    const allSelectedIndices = this.getAllSelectedIndices();

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
              data-test-subj="sourceSelector"
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
                data-test-subj="subsetOption"
                legend={{
                  children: <span>Specify a reindex option</span>,
                }}
              />
              <EuiSpacer />
              {subset ? (
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
              ) : null}
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
                  data-test-subj="destinationSelector"
                  getIndexOptions={this.getIndexOptions}
                  onSelectedOptions={this.onDestinationSelection}
                  singleSelect={true}
                  selectedOption={destination}
                />
              </CustomFormRow>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiButton data-test-subj="createIndexButton" onClick={() => this.setState({ showCreateIndexFlyout: true })}>
                Create Index
              </EuiButton>
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
            <EuiButton fill onClick={this.onClickAction} isLoading={executing} data-test-subj="reindexConfirmButton">
              Reindex
            </EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup>

        {showCreateIndexFlyout ? (
          <CreateIndexFlyout
            commonService={this.props.commonService}
            onSubmitSuccess={this.onCreateIndexSuccess}
            sourceIndices={allSelectedIndices}
            onCloseFlyout={() => this.setState({ showCreateIndexFlyout: false })}
          />
        ) : null}
      </div>
    );
  }
}
