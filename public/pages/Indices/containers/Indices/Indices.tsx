/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useContext } from "react";
import _ from "lodash";
import { RouteComponentProps } from "react-router-dom";
import queryString from "query-string";
import {
  EuiBasicTable,
  EuiHorizontalRule,
  // @ts-ignore
  Criteria,
  EuiTableSortingType,
  Direction,
  // @ts-ignore
  Pagination,
  EuiTableSelectionType,
  ArgsWithError,
  ArgsWithQuery,
  Query,
  EuiTitle,
} from "@elastic/eui";
import { ContentPanel, ContentPanelActions } from "../../../../components/ContentPanel";
import IndexControls from "../../components/IndexControls";
import IndexEmptyPrompt from "../../components/IndexEmptyPrompt";
import { DEFAULT_PAGE_SIZE_OPTIONS, DEFAULT_QUERY_PARAMS, indicesColumns } from "../../utils/constants";
import IndexService from "../../../../services/IndexService";
import CommonService from "../../../../services/CommonService";
import { DataStream, ManagedCatIndex } from "../../../../../server/models/interfaces";
import { getURLQueryParams } from "../../utils/helpers";
import { IndicesQueryParams } from "../../models/interfaces";
import { BREADCRUMBS, PLUGIN_NAME, ROUTES } from "../../../../utils/constants";
import { getErrorMessage } from "../../../../utils/helpers";
import { CoreServicesContext } from "../../../../components/core_services";
import { SECURITY_EXCEPTION_PREFIX } from "../../../../../server/utils/constants";
import IndicesActions from "../IndicesActions";
import { destroyListener, EVENT_MAP, listenEvent } from "../../../../JobHandler";
import "./index.scss";
import { DataSourceMenuContext, DataSourceMenuProperties } from "../../../../services/DataSourceMenuContext";
import MDSEnabledComponent from "../../../../components/MDSEnabledComponent";
import { getApplication, getNavigationUI, getUISettings } from "../../../../services/Services";
import { TopNavControlButtonData, TopNavControlIconData, TopNavControlTextData } from "src/plugins/navigation/public";
import { EuiSpacer } from "@opensearch-project/oui";

interface IndicesProps extends RouteComponentProps, DataSourceMenuProperties {
  indexService: IndexService;
  commonService: CommonService;
}

interface IndicesState extends DataSourceMenuProperties {
  totalIndices: number;
  from: number;
  size: number;
  search: string;
  query: Query;
  sortField: keyof ManagedCatIndex;
  sortDirection: Direction;
  selectedItems: ManagedCatIndex[];
  indices: ManagedCatIndex[];
  loadingIndices: boolean;
  showDataStreams: boolean;
  isDataStreamColumnVisible: boolean;
  useUpdatedUX: boolean;
}

export class Indices extends MDSEnabledComponent<IndicesProps, IndicesState> {
  static contextType = CoreServicesContext;

  constructor(props: IndicesProps) {
    super(props);
    const { from, size, search, sortField, sortDirection, showDataStreams } = getURLQueryParams(this.props.location);
    const uiSettings = getUISettings();
    const useUpdatedUX = uiSettings.get("home:useNewHomePage");
    this.state = {
      ...this.state,
      totalIndices: 0,
      from,
      size,
      search,
      query: Query.parse(search),
      sortField,
      sortDirection,
      selectedItems: [],
      indices: [],
      loadingIndices: true,
      showDataStreams,
      isDataStreamColumnVisible: showDataStreams,
      useUpdatedUX: useUpdatedUX,
    };

    this.getIndices = _.debounce(this.getIndices, 500, { leading: true });
  }

  async componentDidMount() {
    const breadCrumbs = this.state.useUpdatedUX ? [BREADCRUMBS.INDICES] : [BREADCRUMBS.INDEX_MANAGEMENT, BREADCRUMBS.INDICES];
    this.context.chrome.setBreadcrumbs(breadCrumbs);
    listenEvent(EVENT_MAP.REINDEX_COMPLETE, this.getIndices);
    listenEvent(EVENT_MAP.SHRINK_COMPLETE, this.getIndices);
    listenEvent(EVENT_MAP.SPLIT_COMPLETE, this.getIndices);
    listenEvent(EVENT_MAP.OPEN_COMPLETE, this.getIndices);
    await this.getIndices();
    if (this.state.useUpdatedUX) {
      this.context.chrome.setBreadcrumbs([
        { text: BREADCRUMBS.INDICES.text.concat(` (${this.state.totalIndices})`), href: BREADCRUMBS.INDICES.href },
      ]);
    }
  }

  componentWillUnmount(): void {
    destroyListener(EVENT_MAP.REINDEX_COMPLETE, this.getIndices);
    destroyListener(EVENT_MAP.SHRINK_COMPLETE, this.getIndices);
    destroyListener(EVENT_MAP.SPLIT_COMPLETE, this.getIndices);
    destroyListener(EVENT_MAP.OPEN_COMPLETE, this.getIndices);
  }

  async componentDidUpdate(prevProps: IndicesProps, prevState: IndicesState) {
    const prevQuery = this.getQueryObjectFromState(prevState);
    const currQuery = this.getQueryObjectFromState(this.state);
    if (!_.isEqual(prevQuery, currQuery)) {
      await this.getIndices();
    }
    if (this.state.useUpdatedUX) {
      this.context.chrome.setBreadcrumbs([
        { text: BREADCRUMBS.INDICES.text.concat(` (${this.state.totalIndices})`), href: BREADCRUMBS.INDICES.href },
      ]);
    }
  }

  getQueryObjectFromState({
    from,
    size,
    search,
    sortField,
    sortDirection,
    showDataStreams,
    dataSourceId,
  }: IndicesState): IndicesQueryParams {
    const queryObj = { from, size, search, sortField, sortDirection, showDataStreams };
    if (!this.props.multiDataSourceEnabled) {
      // don't send dataSourceId, if MDS is not enabled
      return queryObj;
    }
    return { ...queryObj, dataSourceId };
  }

  getIndices = async (): Promise<void> => {
    this.setState({ loadingIndices: true });
    try {
      const { indexService, history } = this.props;
      const queryObject = this.getQueryObjectFromState(this.state);
      const queryParamsString = queryString.stringify({
        ...queryObject,
      });
      history.replace({ ...this.props.location, search: queryParamsString });

      const getIndicesResponse = await indexService.getIndices({
        ...queryObject,
        terms: this.getTermClausesFromState(),
        indices: this.getFieldClausesFromState("indices"),
        dataStreams: this.getFieldClausesFromState("data_streams"),
      });

      if (getIndicesResponse.ok) {
        const { indices, totalIndices } = getIndicesResponse.response;
        const payload = {
          indices,
          totalIndices,
          selectedItems: this.state.selectedItems
            .map((item) => indices.find((remoteItem) => remoteItem.index === item.index))
            .filter((item) => item),
        } as IndicesState;
        this.setState(payload);
      } else {
        this.context.notifications.toasts.addDanger(getIndicesResponse.error);
      }
    } catch (err) {
      this.context.notifications.toasts.addDanger(getErrorMessage(err, "There was a problem loading the indices"));
    }

    // Avoiding flicker by showing/hiding the "Data stream" column only after the results are loaded.
    const { showDataStreams } = this.state;
    this.setState({ loadingIndices: false, isDataStreamColumnVisible: showDataStreams });
  };

  getDataStreams = async (): Promise<DataStream[]> => {
    const { indexService } = this.props;
    const serverResponse = await indexService.getDataStreams();
    if (!serverResponse.ok) {
      if (serverResponse.error.startsWith(SECURITY_EXCEPTION_PREFIX)) {
        this.context.notifications.toasts.addWarning(serverResponse.error);
      }
    }
    return serverResponse.response.dataStreams;
  };

  toggleShowDataStreams = () => {
    const { showDataStreams } = this.state;
    this.setState({ showDataStreams: !showDataStreams });
  };

  getFieldClausesFromState = (clause: string): string[] => {
    const { query } = this.state;
    return _.flatten((query.ast.getFieldClauses(clause) || []).map((field) => field.value));
  };

  getTermClausesFromState = (): string[] => {
    const { query } = this.state;
    return (query.ast.getTermClauses() || []).map((term) => term.value);
  };

  onTableChange = ({ page: tablePage, sort }: Criteria<ManagedCatIndex>): void => {
    const { index: page, size } = tablePage;
    const { field: sortField, direction: sortDirection } = sort;
    this.setState({ from: page * size, size, sortField, sortDirection });
  };

  onSelectionChange = (selectedItems: ManagedCatIndex[]): void => {
    this.setState({ selectedItems });
  };

  onSearchChange = ({ query, queryText, error }: ArgsWithQuery | ArgsWithError): void => {
    if (error) {
      return;
    }

    this.setState({ from: 0, search: queryText, query });
  };

  resetFilters = (): void => {
    this.setState({ search: DEFAULT_QUERY_PARAMS.search, query: Query.parse(DEFAULT_QUERY_PARAMS.search) });
  };

  render() {
    const {
      totalIndices,
      from,
      size,
      search,
      sortField,
      sortDirection,
      indices,
      loadingIndices,
      showDataStreams,
      isDataStreamColumnVisible,
    } = this.state;

    const filterIsApplied = !!search;
    const page = Math.floor(from / size);

    const pagination: Pagination = {
      pageIndex: page,
      pageSize: size,
      pageSizeOptions: DEFAULT_PAGE_SIZE_OPTIONS,
      totalItemCount: totalIndices,
    };

    const sorting: EuiTableSortingType<ManagedCatIndex> = {
      sort: {
        direction: sortDirection,
        field: sortField,
      },
    };

    const selection: EuiTableSelectionType<ManagedCatIndex> = {
      onSelectionChange: this.onSelectionChange,
    };

    const { HeaderControl } = getNavigationUI();
    const { setAppRightControls } = getApplication();

    const { history } = this.props;

    return this.state.useUpdatedUX ? (
      <>
        <HeaderControl
          setMountPoint={setAppRightControls}
          controls={[
            {
              id: "Notification settings",
              label: "Notification Settings",
              fill: false,
              // href: `${PLUGIN_NAME}#/create-index`,
              testId: "notificationSettingsButton",
              controlType: "button",
              color: "secondary",
            } as TopNavControlButtonData,
            {
              id: "Create index",
              label: "Create Index",
              fill: true,
              iconType: "plus",
              href: `${PLUGIN_NAME}#/create-index`,
              testId: "createIndexButton",
              controlType: "button",
              color: "primary",
            } as TopNavControlButtonData,
          ]}
        />
        <div id="test" style={{ padding: "0px" }}>
          <ContentPanel>
            <IndexControls
              search={search}
              onSearchChange={this.onSearchChange}
              onRefresh={this.getIndices}
              showDataStreams={showDataStreams}
              getDataStreams={this.getDataStreams}
              toggleShowDataStreams={this.toggleShowDataStreams}
              selectedItems={this.state.selectedItems}
            />

            <EuiBasicTable
              columns={indicesColumns(isDataStreamColumnVisible, {
                history,
              })}
              loading={this.state.loadingIndices}
              isSelectable={true}
              itemId="index"
              items={indices}
              noItemsMessage={
                <IndexEmptyPrompt filterIsApplied={filterIsApplied} loading={loadingIndices} resetFilters={this.resetFilters} />
              }
              onChange={this.onTableChange}
              pagination={pagination}
              selection={selection}
              sorting={sorting}
            />
          </ContentPanel>
        </div>
      </>
    ) : (
      <ContentPanel
        actions={
          <ContentPanelActions
            actions={[
              {
                text: "Refresh",
                buttonProps: {
                  iconType: "refresh",
                  onClick: this.getIndices,
                },
              },
              {
                children: (
                  <IndicesActions
                    {...this.props}
                    onDelete={this.getIndices}
                    onClose={this.getIndices}
                    onShrink={this.getIndices}
                    selectedItems={this.state.selectedItems}
                    getIndices={this.getIndices}
                  />
                ),
                text: "",
              },
              {
                text: "Create Index",
                buttonProps: {
                  fill: true,
                  onClick: () => {
                    this.props.history.push(ROUTES.CREATE_INDEX);
                  },
                },
              },
            ]}
          />
        }
        bodyStyles={{ padding: "initial" }}
        title="Indexes"
        itemCount={totalIndices}
      >
        <IndexControls
          search={search}
          onSearchChange={this.onSearchChange}
          onRefresh={this.getIndices}
          showDataStreams={showDataStreams}
          getDataStreams={this.getDataStreams}
          toggleShowDataStreams={this.toggleShowDataStreams}
          selectedItems={this.state.selectedItems}
        />

        <EuiHorizontalRule margin="xs" />

        <EuiBasicTable
          columns={indicesColumns(isDataStreamColumnVisible, {
            history,
          })}
          loading={this.state.loadingIndices}
          isSelectable={true}
          itemId="index"
          items={indices}
          noItemsMessage={<IndexEmptyPrompt filterIsApplied={filterIsApplied} loading={loadingIndices} resetFilters={this.resetFilters} />}
          onChange={this.onTableChange}
          pagination={pagination}
          selection={selection}
          sorting={sorting}
        />
      </ContentPanel>
    );
  }
}

export default function (props: Omit<IndicesProps, keyof DataSourceMenuProperties>) {
  const dataSourceMenuProps = useContext(DataSourceMenuContext);
  return <Indices {...props} {...dataSourceMenuProps} />;
}
