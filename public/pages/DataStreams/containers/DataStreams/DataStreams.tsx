/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component, useContext } from "react";
import _, { debounce, isEqual } from "lodash";
import { Link, RouteComponentProps } from "react-router-dom";
import queryString from "query-string";
import {
  EuiHorizontalRule,
  EuiBasicTable,
  Criteria,
  EuiTableSortingType,
  Direction,
  Pagination,
  EuiTableSelectionType,
  EuiButton,
  EuiLink,
  EuiTitle,
  EuiFormRow,
  EuiEmptyPrompt,
  EuiText,
  EuiHealth,
  EuiToolTip,
} from "@elastic/eui";
import { ContentPanel, ContentPanelActions } from "../../../../components/ContentPanel";
import { DEFAULT_PAGE_SIZE_OPTIONS, DEFAULT_QUERY_PARAMS, HEALTH_TO_COLOR } from "../../utils/constants";
import CommonService from "../../../../services/CommonService";
import { DataStreamStats, DataStreamWithStats } from "../../interface";
import { BREADCRUMBS, ROUTES } from "../../../../utils/constants";
import { CoreServicesContext } from "../../../../components/core_services";
import { ServicesContext } from "../../../../services";
import IndexControls, { SearchControlsProps } from "../../components/IndexControls";
import DataStreamsActions from "../DataStreamsActions";
import { CoreStart } from "opensearch-dashboards/public";
import { DataStream } from "../../../../../server/models/interfaces";
import { DataSourceMenuContext } from "../../../../services/DataSourceMenuContext";

interface DataStreamsProps extends RouteComponentProps {
  commonService: CommonService;
  dataSourceId: string;
  dataSourceLabel: string;
  multiDataSourceEnabled: boolean;
}

type DataStreamsState = {
  totalDataStreams: number;
  from: string;
  size: string;
  sortField: keyof DataStreamWithStats;
  sortDirection: Direction;
  selectedItems: DataStreamWithStats[];
  dataStreams: DataStreamWithStats[];
  loading: boolean;
  dataSourceId: string;
  dataSourceLabel: string;
} & SearchControlsProps["value"];

const defaultFilter = {
  search: DEFAULT_QUERY_PARAMS.search,
};

export const healthExplanation = {
  green: "All shards are assigned.",
  yellow: "All primary shards are assigned, but one or more replica shards are unassigned.",
  red: "One or more primary shards are unassigned, so some data is unavailable.",
};

class DataStreams extends Component<DataStreamsProps, DataStreamsState> {
  static contextType = CoreServicesContext;
  constructor(props: DataStreamsProps) {
    super(props);
    const {
      from = DEFAULT_QUERY_PARAMS.from,
      size = DEFAULT_QUERY_PARAMS.size,
      search = DEFAULT_QUERY_PARAMS.search,
      sortField = DEFAULT_QUERY_PARAMS.sortField,
      sortDirection = DEFAULT_QUERY_PARAMS.sortDirection,
    } = queryString.parse(props.history.location.search) as {
      from: string;
      size: string;
      search: string;
      sortField: keyof DataStreamWithStats;
      sortDirection: Direction;
    };
    this.state = {
      ...defaultFilter,
      totalDataStreams: 0,
      from,
      size,
      search,
      sortField,
      sortDirection,
      selectedItems: [],
      dataStreams: [],
      loading: false,
      dataSourceId: props.dataSourceId,
      dataSourceLabel: props.dataSourceLabel,
    };

    this.getDataStreams = debounce(this.getDataStreams, 500, { leading: true });
  }

  static getDerivedStateFromProps(nextProps: DataStreamsProps, prevState: DataStreamsState) {
    if (nextProps.dataSourceId != prevState.dataSourceId || nextProps.dataSourceLabel != prevState.dataSourceLabel) {
      return {
        dataSourceId: nextProps.dataSourceId,
        dataSourceLabel: nextProps.dataSourceLabel,
      };
    }
    return null;
  }

  async componentDidUpdate(prevProps: DataStreamsProps, prevState: DataStreamsState) {
    const prevQuery = this.getQueryState(prevState);
    const currQuery = this.getQueryState(this.state);
    if (!_.isEqual(prevQuery, currQuery)) {
      await this.getDataStreams();
    }
  }

  componentDidMount() {
    this.context.chrome.setBreadcrumbs([BREADCRUMBS.INDEX_MANAGEMENT, BREADCRUMBS.DATA_STREAMS]);
    this.getDataStreams();
  }

  getQueryState = (state: DataStreamsState) => {
    return Object.keys(DEFAULT_QUERY_PARAMS).reduce((total, key) => {
      return {
        ...total,
        [key]: state[key as keyof typeof DEFAULT_QUERY_PARAMS],
      };
    }, {} as DataStreamsState);
  };

  getDataStreams = async (): Promise<void> => {
    this.setState({ loading: true });
    const { from, size, sortDirection, sortField } = this.state;
    const fromNumber = Number(from);
    const sizeNumber = Number(size);
    const { history, commonService } = this.props;
    const queryObject = this.getQueryState(this.state);
    const queryParamsString = queryString.stringify(queryObject);
    history.replace({ ...this.props.location, search: queryParamsString });

    let allDataStreams: DataStreamWithStats[] = [];
    let error = "";
    let totalDataStreams = 0;
    let dataStreams: DataStreamWithStats[] = [];

    const [allDataStreamsResponse, dataStreamDetailInfoResponse] = await Promise.all([
      commonService.apiCaller<{
        data_streams: DataStream[];
      }>({
        endpoint: "transport.request",
        data: {
          method: "GET",
          path: `_data_stream/*${queryObject.search}*`,
        },
      }),
      await commonService.apiCaller<{
        data_streams: DataStreamStats[];
      }>({
        endpoint: "transport.request",
        data: {
          method: "GET",
          path: `_data_stream/*${queryObject.search}*/_stats?human=true`,
        },
      }),
    ]);

    if (allDataStreamsResponse.ok && dataStreamDetailInfoResponse.ok) {
      allDataStreams = (allDataStreamsResponse.response?.data_streams || [])
        .map((item) => {
          const findItem = (dataStreamDetailInfoResponse.response?.data_streams || []).find(
            (statsItem) => statsItem.data_stream === item.name
          );
          if (!findItem) {
            return undefined;
          }

          return {
            ...findItem,
            ...item,
          };
        })
        .filter((item) => item) as DataStreamWithStats[];
      totalDataStreams = allDataStreams.length;
      allDataStreams.sort((a, b) => {
        if (sortDirection === "asc") {
          if (a[sortField] < b[sortField]) {
            return -1;
          }

          return 1;
        } else {
          if (a[sortField] > b[sortField]) {
            return -1;
          }

          return 1;
        }
      });
      dataStreams = allDataStreams.slice(fromNumber * sizeNumber, (fromNumber + 1) * sizeNumber);
    } else {
      error = allDataStreamsResponse.error || dataStreamDetailInfoResponse.error || "";
    }

    if (!error) {
      const payload = {
        dataStreams,
        totalDataStreams,
        selectedItems: this.state.selectedItems
          .map((item) => allDataStreams.find((remoteItem) => remoteItem.name === item.name))
          .filter((item) => item) as DataStreamWithStats[],
      };
      this.setState(payload);
    } else {
      this.context.notifications.toasts.addDanger(error);
    }

    // Avoiding flicker by showing/hiding the "Data stream" column only after the results are loaded.
    this.setState({ loading: false });
  };

  onTableChange = ({ page: tablePage, sort }: Criteria<DataStreamWithStats>): void => {
    const { index: page, size } = tablePage || {};
    const { field: sortField, direction: sortDirection } = sort || {};
    this.setState(
      {
        from: "" + page,
        size: "" + size,
        sortField: sortField || DEFAULT_QUERY_PARAMS.sortField,
        sortDirection: sortDirection as Direction,
      },
      () => this.getDataStreams()
    );
  };

  onSelectionChange = (selectedItems: DataStreamWithStats[]): void => {
    this.setState({ selectedItems });
  };

  onSearchChange = (params: Parameters<SearchControlsProps["onSearchChange"]>[0]): void => {
    this.setState({ from: "0", ...params }, () => this.getDataStreams());
  };

  render() {
    const { totalDataStreams, from, size, sortField, sortDirection, dataStreams } = this.state;

    const pagination: Pagination = {
      pageIndex: Number(from),
      pageSize: Number(size),
      pageSizeOptions: DEFAULT_PAGE_SIZE_OPTIONS,
      totalItemCount: Number(totalDataStreams),
    };

    const sorting: EuiTableSortingType<DataStreamWithStats> = {
      sort: {
        direction: sortDirection,
        field: sortField,
      },
    };

    const selection: EuiTableSelectionType<DataStreamWithStats> = {
      onSelectionChange: this.onSelectionChange,
    };
    return (
      <ContentPanel
        actions={
          <ContentPanelActions
            actions={[
              {
                text: "",
                children: (
                  <DataStreamsActions
                    selectedItems={this.state.selectedItems}
                    onDelete={this.getDataStreams}
                    history={this.props.history}
                  />
                ),
              },
              {
                text: "Create data stream",
                buttonProps: {
                  fill: true,
                  onClick: () => {
                    this.props.history.push(ROUTES.CREATE_DATA_STREAM);
                  },
                },
              },
            ]}
          />
        }
        bodyStyles={{ padding: "initial" }}
        title={
          <>
            <EuiTitle>
              <span>Data streams</span>
            </EuiTitle>
            <EuiFormRow
              fullWidth
              helpText={
                <div>
                  Data streams simplify the management of time-series data. Data streams are composed of multiple backing indexes. Search
                  requests are routed to all backing indexes, while indexing requests are routed to the latest write index.{" "}
                  <EuiLink target="_blank" external href={(this.context as CoreStart).docLinks.links.opensearch.dataStreams}>
                    Learn more
                  </EuiLink>
                </div>
              }
            >
              <></>
            </EuiFormRow>
          </>
        }
      >
        <IndexControls
          value={{
            search: this.state.search,
          }}
          onSearchChange={this.onSearchChange}
        />
        <EuiHorizontalRule margin="xs" />

        <EuiBasicTable
          data-test-subj="dataStreamsTable"
          loading={this.state.loading}
          columns={[
            {
              field: "name",
              name: "Data stream name",
              sortable: true,
              render: (value: unknown) => {
                return (
                  <Link to={`${ROUTES.CREATE_DATA_STREAM}/${value}/readonly`}>
                    <EuiLink>{value}</EuiLink>
                  </Link>
                );
              },
            },
            {
              field: "status",
              name: "Status",
              sortable: true,
              render: (health: string, item) => {
                const healthLowerCase = health?.toLowerCase() as "green" | "yellow" | "red";
                const color = health ? HEALTH_TO_COLOR[healthLowerCase] : "subdued";
                const text = (health || item.status || "").toLowerCase();
                return (
                  <EuiToolTip content={healthExplanation[healthLowerCase] || ""}>
                    <EuiHealth color={color} className="indices-health">
                      {text}
                    </EuiHealth>
                  </EuiToolTip>
                );
              },
            },
            {
              field: "template",
              name: "Template",
              sortable: true,
              render: (value: unknown) => {
                return (
                  <Link to={`${ROUTES.CREATE_TEMPLATE}/${value}`}>
                    <EuiLink>{value}</EuiLink>
                  </Link>
                );
              },
            },
            {
              field: "backing_indices",
              name: "Backing indexes count",
              sortable: true,
              align: "right",
            },
            {
              field: "store_size_bytes",
              name: "Total size",
              sortable: true,
              align: "right",
              render: (value, record) => {
                return <>{record.store_size || ""}</>;
              },
            },
          ]}
          isSelectable={true}
          itemId="name"
          items={dataStreams}
          onChange={this.onTableChange}
          pagination={pagination}
          selection={selection}
          sorting={sorting}
          noItemsMessage={
            isEqual(
              {
                search: this.state.search,
              },
              defaultFilter
            ) ? (
              <EuiEmptyPrompt
                body={
                  <EuiText>
                    <p>You have no data streams.</p>
                  </EuiText>
                }
                actions={[
                  <EuiButton
                    fill
                    onClick={() => {
                      this.props.history.push(ROUTES.CREATE_DATA_STREAM);
                    }}
                  >
                    Create data stream
                  </EuiButton>,
                ]}
              />
            ) : (
              <EuiEmptyPrompt
                body={
                  <EuiText>
                    <p>There are no data streams matching your applied filters. Reset your filters to view your data streams.</p>
                  </EuiText>
                }
                actions={[
                  <EuiButton
                    fill
                    onClick={() => {
                      this.setState(defaultFilter, () => {
                        this.getDataStreams();
                      });
                    }}
                  >
                    Reset filters
                  </EuiButton>,
                ]}
              />
            )
          }
        />
      </ContentPanel>
    );
  }
}

export default function DataStreamsContainer(props: Omit<DataStreamsProps, "commonService">) {
  const context = useContext(ServicesContext);
  const { dataSourceId, dataSourceLabel, multiDataSourceEnabled } = useContext(DataSourceMenuContext);
  return (
    <DataStreams
      {...props}
      commonService={context?.commonService as CommonService}
      dataSourceId={dataSourceId}
      dataSourceLabel={dataSourceLabel}
      multiDataSourceEnabled={multiDataSourceEnabled}
    />
  );
}
