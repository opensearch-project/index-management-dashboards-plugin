/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiSmallButton,
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
import { CoreStart } from "opensearch-dashboards/public";
import { CoreServicesContext } from "../../../../components/core_services";
import { getClusterInfo, getErrorMessage } from "../../../../utils/helpers";
import { IndexSelectItem, ReindexRequest, ReindexResponse } from "../../models/interfaces";
import CustomFormRow from "../../../../components/CustomFormRow";
import { ContentPanel } from "../../../../components/ContentPanel";
import ReindexAdvancedOptions from "../../components/ReindexAdvancedOptions";
import { BREADCRUMBS, ROUTES } from "../../../../utils/constants";
import { CommonService, IndexService } from "../../../../services";
import { RouteComponentProps } from "react-router-dom";
import IndexSelect from "../../components/IndexSelect";
import { DEFAULT_QUERY, REINDEX_ERROR_PROMPT, DEFAULT_SLICE } from "../../utils/constants";
import JSONEditor from "../../../../components/JSONEditor";
import { REQUEST } from "../../../../../utils/constants";
import CreateIndexFlyout from "../../components/CreateIndexFlyout";
import queryString from "query-string";
import { parseIndexNames, checkDuplicate } from "../../utils/helper";
import { jobSchedulerInstance } from "../../../../context/JobSchedulerContext";
import { ReindexJobMetaData } from "../../../../models/interfaces";
import { ListenType } from "../../../../lib/JobScheduler";
import NotificationConfig, { NotificationConfigRef } from "../../../../containers/NotificationConfig";
import { ActionType } from "../../../Notifications/constant";
import { useUpdateUrlWithDataSourceProperties } from "../../../../components/MDSEnabledComponent";

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
  sourceQueryErr?: string;
  advancedSettingsOpen: boolean;
  slices?: string;
  sliceError?: string;
  pipelines: EuiComboBoxOptionOption[];
  selectedPipelines?: EuiComboBoxOptionOption[];
  ignoreConflicts: boolean;
  reindexUniqueDocuments: boolean;
  executing: boolean;
  showCreateIndexFlyout: boolean;
}

class Reindex extends Component<ReindexProps, ReindexState> {
  static contextType = CoreServicesContext;
  notificationRef: NotificationConfigRef | null = null;
  constructor(props: ReindexProps) {
    super(props);

    this.state = {
      sources: [],
      indexOptions: [],
      destination: [],
      sourceQuery: DEFAULT_QUERY,
      pipelines: [],
      advancedSettingsOpen: false,
      ignoreConflicts: false,
      sourceErr: [],
      destError: null,
      subset: false,
      executing: false,
      showCreateIndexFlyout: false,
      reindexUniqueDocuments: false,
    };
  }

  async componentDidMount() {
    this.context.chrome.setBreadcrumbs([
      BREADCRUMBS.INDEX_MANAGEMENT,
      BREADCRUMBS.INDICES,
      { ...BREADCRUMBS.REINDEX, href: `#${this.props.location.pathname}${this.props.location.search}` },
    ]);

    const { source } = queryString.parse(this.props.location.search);

    if (typeof source === "string") {
      const allOptions = await this.getIndexOptions(source);
      const arr = source.split(",");
      if (allOptions && allOptions.length > 0 && allOptions[0].options) {
        const selectedSource = allOptions[0].options.filter((item) => arr.indexOf(item.label) !== -1);
        await this.onSourceSelection(selectedSource);
      }
    }
  }

  getIndexOptions = async (searchValue: string, excludeDataStreamIndex?: boolean): Promise<EuiComboBoxOptionOption<IndexSelectItem>[]> => {
    const { indexService } = this.props;
    let options: EuiComboBoxOptionOption<IndexSelectItem>[] = [];
    try {
      let actualSearchValue = parseIndexNames(searchValue);

      const [indexResponse, dataStreamResponse, aliasResponse] = await Promise.all([
        indexService.getIndices({
          from: 0,
          size: 50, // max page size value
          search: actualSearchValue.join(","),
          indices: [actualSearchValue.join(",")],
          sortDirection: "desc",
          sortField: "index",
          showDataStreams: !excludeDataStreamIndex,
        }),
        indexService.getDataStreams({ search: searchValue.trim() }),
        indexService.getAliases({ search: searchValue.trim() }),
      ]);
      if (indexResponse.ok) {
        const indices = indexResponse.response.indices.map((index) => ({
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
            indices: ds.indices.map((item) => item.index_name),
            writingIndex: ds.indices
              .map((item) => item.index_name)
              .sort()
              .reverse()[0],
          },
        }));
        options.push({ label: "dataStreams", options: dataStreams });
      }

      if (aliasResponse && aliasResponse.ok) {
        const aliases = _.uniq(aliasResponse.response.aliases.map((alias) => alias.alias)).map((name) => {
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
              writingIndex: writingIndex[0],
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
    const {
      sourceQuery,
      destination,
      slices,
      selectedPipelines,
      ignoreConflicts,
      sources,
      subset,
      reindexUniqueDocuments,
      advancedSettingsOpen,
    } = this.state;

    if (!(await this.validateSource(sources)) || !this.validateDestination(destination) || !this.validateSlices(slices)) {
      return;
    }
    // validate query DSL
    if (subset && !(await this.validateQueryDSL(sources, sourceQuery))) {
      return;
    }

    if (advancedSettingsOpen) {
      const result = await this.notificationRef?.validatePromise();
      if (result?.errors) {
        return;
      }
    }

    const [isDestAsDataStream] = destination.map((dest) => dest.value?.isDataStream);

    try {
      this.setState({ executing: true });
      let reindexReq: ReindexRequest = {
        waitForCompletion: false,
        slices: slices === undefined ? DEFAULT_SLICE : slices,
        body: {
          conflicts: ignoreConflicts ? "proceed" : "abort",
          source: {
            index: sources.map((item) => item.label).join(","),
          },
          dest: {
            index: destination.map((item) => item.label)[0],
            op_type: isDestAsDataStream || reindexUniqueDocuments ? "create" : "index",
          },
        },
      };
      // set query DSL
      if (subset) {
        Object.assign(reindexReq.body.source, JSON.parse(sourceQuery));
      }
      // set pipeline if available
      if (selectedPipelines && selectedPipelines.length > 0) {
        reindexReq.body.dest.pipeline = selectedPipelines[0].label;
      }
      const result = await this.onReindexConfirm(reindexReq);
      const destinationItem = destination[0];
      if (result.ok) {
        if (advancedSettingsOpen) {
          this.notificationRef?.associateWithTask({
            taskId: result.response?.taskId || "",
          });
        }
        const clusterInfo = await getClusterInfo({
          commonService: this.props.commonService,
        });
        await jobSchedulerInstance.addJob({
          type: ListenType.REINDEX,
          extras: {
            clusterInfo,
            toastId: result.response?.toastId,
            sourceIndex: reindexReq.body.source.index,
            destIndex: reindexReq.body.dest.index,
            taskId: result.response?.taskId,
            destType: destinationItem.value?.isIndex ? "index" : "other",
            writingIndex: destinationItem.value?.isIndex ? destinationItem.label : destinationItem.value?.writingIndex,
          },
          interval: 30000,
        } as ReindexJobMetaData);
      }

      this.setState({ executing: false });
      // back to indices page
      this.onCancel();
    } catch (error) {
      this.context.notifications.toasts.addDanger(`Reindex operation error happened ${error}`);
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
    let response: {
      ok: boolean;
      response?: {
        toastId: string;
        taskId: string;
      };
    } = {
      ok: res.ok,
    };
    if (res && res.ok) {
      // @ts-ignore
      const toast = `Successfully started reindexing ${reindexRequest.body.source.index}. The reindexed index will be named ${reindexRequest.body.dest.index}.`;
      const toastInstance = (this.context as CoreStart).notifications.toasts.addSuccess(toast, {
        toastLifeTimeMs: 1000 * 60 * 60 * 24 * 5,
      });
      response.response = {
        toastId: toastInstance.id,
        taskId: res.response.task,
      };
    } else {
      this.context.notifications.toasts.addDanger(`Reindex operation error ${res?.error}`);
    }
    return response;
  };

  getAllSelectedIndices = (): string[] => {
    const { sources } = this.state;
    let result: string[] = [];
    sources.forEach((item) => {
      item.value?.isIndex && result.push(item.label);
      item.value?.isAlias && item.value.indices && result.push(...item.value.indices);
      item.value?.isDataStream && item.value.writingIndex && result.push(item.value.writingIndex);
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
      this.setState({ destError: `Index [${dest.label}] status is closed.` });
      return false;
    }

    // if destination is alias, then it must have a writing index behind it
    if (dest.value?.isAlias) {
      if (!dest.value?.writingIndex) {
        this.setState({ destError: `Alias [${dest.label}] don't have writing index behind it.` });
        return false;
      }
    }

    const error = checkDuplicate(sources, selectedOptions);
    if (error) {
      this.setState({ destError: error });
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
        errors.push(`Index [${item.label}] status is closed.`);
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

    const error = checkDuplicate(sourceIndices, this.state.destination);
    error && this.setState({ destError: error });

    this.setState({ sourceErr: errors });
    return errors.length === 0;
  };

  validateSlices = (slices?: string): boolean => {
    if (slices === undefined || slices === "auto") return true;
    const sliceRegex = /^[2-9][0-9]*$/;
    if (!sliceRegex.test(slices)) {
      this.setState({ sliceError: REINDEX_ERROR_PROMPT.SLICES_FORMAT_ERROR });
      return false;
    }
    return true;
  };

  validateQueryDSL = async (sourceIndices: EuiComboBoxOptionOption<IndexSelectItem>[], queryString: string): Promise<boolean> => {
    if (!queryString) return true;
    const { commonService } = this.props;
    const validateRes = await commonService.apiCaller({
      endpoint: "indices.validateQuery",
      data: {
        index: sourceIndices.map((item) => item.label).join(","),
        body: {
          ...JSON.parse(queryString),
        },
      },
    });
    if (validateRes && validateRes.ok) {
      // @ts-ignore
      const valid = validateRes.response.valid;
      if (!valid) {
        this.setState({ sourceQueryErr: "Invalid query expression" });
        return false;
      }
    }
    return true;
  };

  onCancel = () => {
    this.props.history.push(ROUTES.INDICES);
  };

  onCreateIndexSuccess = (indexName: string) => {
    const option: EuiComboBoxOptionOption<IndexSelectItem>[] = [{ label: indexName, value: { isIndex: true } }];
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

  onSourceQueryChange = async (value: string) => {
    this.setState({ sourceQuery: value, sourceQueryErr: undefined });
    await this.validateQueryDSL(this.state.sources, value);
  };

  onSliceChange = (val?: string) => {
    this.setState({ slices: val, sliceError: undefined });
    this.validateSlices(val);
  };

  onPipelineChange = (selectedOptions: EuiComboBoxOptionOption[]) => {
    this.setState({ selectedPipelines: selectedOptions });
  };

  onIgnoreConflictsChange = (e: ChangeEvent<HTMLInputElement>): void => {
    this.setState({ ignoreConflicts: e.target.checked });
  };

  onReindexUniqueDocuments = (e: ChangeEvent<HTMLInputElement>): void => {
    this.setState({ reindexUniqueDocuments: e.target.checked });
  };

  onSubsetChange = (event: EuiSwitchEvent) => {
    this.setState({ subset: event.target.checked });
  };

  render() {
    const { sources, destination, sourceQuery, destError, slices, sourceErr, advancedSettingsOpen, showCreateIndexFlyout } = this.state;
    const { ignoreConflicts: ignoreConflicts, reindexUniqueDocuments, subset, executing, sourceQueryErr } = this.state;

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
            <h3>Advanced settings</h3>
          </EuiTitle>
        </EuiFlexItem>
      </EuiFlexGroup>
    );

    const subTitleText = (
      <CustomFormRow
        fullWidth
        label=""
        helpText={
          <div>
            Use reindex to make extensive changes to your index. Reindex will copy data of the source index into another index.{" "}
            <EuiLink href={this.context.docLinks.links.opensearch.reindexData.base} target="_blank" rel="noopener noreferrer">
              Learn more
            </EuiLink>
          </div>
        }
      >
        <></>
      </CustomFormRow>
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
            label="Specify source indexes or data streams"
            isInvalid={sourceErr.length > 0}
            error={sourceErr}
            fullWidth
            helpText="Specify one or more indexes or data streams you want to reindex from."
          >
            <IndexSelect
              data-test-subj="sourceSelector"
              placeholder="Select indexes or data streams"
              getIndexOptions={this.getIndexOptions}
              onSelectedOptions={this.onSourceSelection}
              singleSelect={false}
              selectedOption={sources}
              excludeList={destination}
            />
          </CustomFormRow>

          <EuiSpacer />
          <CustomFormRow>
            <EuiRadioGroup
              options={[
                {
                  id: "all",
                  label: "Reindex all documents",
                },
                {
                  id: "subset",
                  label: "Reindex a subset of documents (Advanced)",
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
          </CustomFormRow>
          <EuiSpacer />
          {subset ? (
            <CustomFormRow
              fullWidth={true}
              label="Query expression"
              isInvalid={!!sourceQueryErr}
              error={sourceQueryErr}
              labelAppend={
                <EuiText size="xs">
                  <EuiLink href={this.context.docLinks.links.opensearch.queryDSL.base} target="_blank" rel="noopener noreferrer">
                    Learn more about query DSL
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
                height="200px"
                data-test-subj="queryJsonEditor"
              />
            </CustomFormRow>
          ) : null}
        </ContentPanel>

        <EuiSpacer />

        <ContentPanel title="Configure destination index" titleSize="s">
          <EuiSpacer />
          <EuiFlexGroup alignItems="flexEnd">
            <EuiFlexItem style={{ maxWidth: "400px" }}>
              <CustomFormRow label="Specify a destination index or data stream" isInvalid={!!destError} error={destError}>
                <IndexSelect
                  data-test-subj="destinationSelector"
                  placeholder="Select an index or data stream"
                  getIndexOptions={this.getIndexOptions}
                  onSelectedOptions={this.onDestinationSelection}
                  singleSelect={true}
                  selectedOption={destination}
                  excludeDataStreamIndex={true}
                  excludeList={sources}
                  excludeSystemIndex={true}
                />
              </CustomFormRow>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiSmallButton data-test-subj="createIndexButton" onClick={() => this.setState({ showCreateIndexFlyout: true })}>
                Create index
              </EuiSmallButton>
            </EuiFlexItem>
          </EuiFlexGroup>
        </ContentPanel>

        <EuiSpacer />

        <ContentPanel title={advanceTitle} noExtraPadding>
          {advancedSettingsOpen && (
            <>
              <EuiSpacer size="s" />
              <ReindexAdvancedOptions
                slices={slices}
                onSlicesChange={this.onSliceChange}
                sliceErr={this.state.sliceError}
                getAllPipelines={this.getAllPipelines}
                selectedPipelines={this.state.selectedPipelines}
                onSelectedPipelinesChange={this.onPipelineChange}
                ignoreConflicts={ignoreConflicts}
                onIgnoreConflictsChange={this.onIgnoreConflictsChange}
                reindexUniqueDocuments={reindexUniqueDocuments}
                onReindexUniqueDocumentsChange={this.onReindexUniqueDocuments}
              />
              <NotificationConfig ref={(ref) => (this.notificationRef = ref)} actionType={ActionType.REINDEX} />
              <EuiSpacer size="s" />
            </>
          )}
        </ContentPanel>

        <EuiSpacer />

        <EuiFlexGroup alignItems="center" justifyContent="flexEnd">
          <EuiFlexItem grow={false}>
            <EuiButtonEmpty onClick={this.onCancel} data-test-subj="reindexCancelButton">
              Cancel
            </EuiButtonEmpty>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiSmallButton fill onClick={this.onClickAction} isLoading={executing} data-test-subj="reindexConfirmButton">
              Reindex
            </EuiSmallButton>
          </EuiFlexItem>
        </EuiFlexGroup>

        {showCreateIndexFlyout ? (
          <CreateIndexFlyout
            onSubmitSuccess={this.onCreateIndexSuccess}
            sourceIndices={allSelectedIndices}
            onCloseFlyout={() => this.setState({ showCreateIndexFlyout: false })}
          />
        ) : null}
      </div>
    );
  }
}

export default function (props: ReindexProps) {
  // in re-index page, user can't change the data source i.e., its in read-only
  useUpdateUrlWithDataSourceProperties();
  return <Reindex {...props} />;
}
