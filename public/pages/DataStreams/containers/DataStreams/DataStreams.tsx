/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component, useContext } from "react";
import { debounce, isEqual } from "lodash";
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
} from "@elastic/eui";
import { ContentPanel, ContentPanelActions } from "../../../../components/ContentPanel";
import { DEFAULT_PAGE_SIZE_OPTIONS, DEFAULT_QUERY_PARAMS } from "../../utils/constants";
import CommonService from "../../../../services/CommonService";
import { DataStreamStats } from "../../interface";
import { BREADCRUMBS, ROUTES } from "../../../../utils/constants";
import { CoreServicesContext } from "../../../../components/core_services";
import { ServicesContext } from "../../../../services";
import IndexControls, { SearchControlsProps } from "../../components/IndexControls";
import DataStreamsActions from "../DataStreamsActions";
import { CoreStart } from "opensearch-dashboards/public";
import { DataStream } from "../../../../../server/models/interfaces";
import { TemplateConvert } from "../../../CreateIndexTemplate/components/TemplateType";

interface DataStreamsProps extends RouteComponentProps {
  commonService: CommonService;
}

type DataStreamWithStats = DataStream & DataStreamStats;

type DataStreamsState = {
  totalDataStreams: number;
  from: string;
  size: string;
  sortField: keyof DataStreamWithStats;
  sortDirection: Direction;
  selectedItems: DataStream[];
  dataStreams: DataStreamWithStats[];
  loading: boolean;
} & SearchControlsProps["value"];

const defaultFilter = {
  search: DEFAULT_QUERY_PARAMS.search,
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
      sortField: keyof DataStream;
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
    };

    this.getDataStreams = debounce(this.getDataStreams, 500, { leading: true });
  }

  componentDidMount() {
    this.context.chrome.setBreadcrumbs([BREADCRUMBS.INDEX_MANAGEMENT, BREADCRUMBS.TEMPLATES]);
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
    const { from, size } = this.state;
    const fromNumber = Number(from);
    const sizeNumber = Number(size);
    const { history, commonService } = this.props;
    const queryObject = this.getQueryState(this.state);
    const queryParamsString = queryString.stringify(queryObject);
    history.replace({ ...this.props.location, search: queryParamsString });

    const payload: any = {
      format: "json",
      name: `*${queryObject.search}*`,
      s: `${queryObject.sortField}:${queryObject.sortDirection}`,
    };

    let allDataStreams: DataStreamWithStats[] = [];
    let error = "";
    let totalDataStreams = 0;

    let allDataStreamsResponse = await commonService.apiCaller<{
      data_streams: DataStream[];
    }>({
      endpoint: "transport.request",
      data: {
        method: "GET",
        path: "_data_stream/*",
      },
    });
    let dataStreams: DataStream[] = [];

    if (allDataStreamsResponse.ok) {
      const dataStreamsResponse = allDataStreamsResponse?.response?.data_streams || [];
      const dataStreams = dataStreamsResponse.slice(fromNumber * sizeNumber, (fromNumber + 1) * sizeNumber);
      const dataStreamDetailInfoResponse = await commonService.apiCaller<{
        data_streams: DataStreamStats[];
      }>({
        endpoint: "transport.request",
        data: {
          method: "GET",
          path: `_data_stream/${dataStreams.map((item) => item.name).join(",")}/_stats?human=true`,
        },
      });
      totalDataStreams = dataStreamsResponse.length;
      if (dataStreamDetailInfoResponse.ok) {
        allDataStreams = dataStreamsResponse.map((item) => {
          const findItem =
            (dataStreamDetailInfoResponse.response?.data_streams || []).find((detailItem) => detailItem.data_stream === item.name) ||
            ({} as DataStreamStats);
          return {
            ...findItem,
            ...item,
          };
        });
      } else {
        error = dataStreamDetailInfoResponse.error;
      }
    } else {
      error = allDataStreamsResponse.error;
    }

    if (!error) {
      const payload = {
        dataStreams: allDataStreams,
        totalDataStreams,
        selectedItems: this.state.selectedItems
          .map((item) => dataStreams.find((remoteItem) => remoteItem.name === item.name))
          .filter((item) => item),
      } as DataStreamsState;
      this.setState(payload);
    } else {
      this.context.notifications.toasts.addDanger(error);
    }

    // Avoiding flicker by showing/hiding the "Data stream" column only after the results are loaded.
    this.setState({ loading: false });
  };

  onTableChange = ({ page: tablePage, sort }: Criteria<DataStream>): void => {
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

  onSelectionChange = (selectedItems: DataStream[]): void => {
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

    const selection: EuiTableSelectionType<DataStream> = {
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
                text: "Create template",
                buttonProps: {
                  fill: true,
                  onClick: () => {
                    this.props.history.push(ROUTES.CREATE_TEMPLATE);
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
                  A data stream is internally composed of multiple backing indices. Search requests are routed to all the backing indices,
                  while indexing requests are routed to the latest write index.{" "}
                  <EuiLink target="_blank" external href={(this.context as CoreStart).docLinks.links.opensearch.dataStreams}>
                    Learn more.
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
              render: (value: string) => {
                return (
                  <Link to={`${ROUTES.CREATE_TEMPLATE}/${value}/readonly`}>
                    <EuiLink>{value}</EuiLink>
                  </Link>
                );
              },
            },
            {
              field: "backing_indices",
              name: "backing indices count",
              align: "right",
            },
            {
              field: "store_size_bytes",
              name: "Total size",
              sortable: true,
              render: (value, record: DataStreamWithStats) => {
                return <>{record.store_size || ""}</>;
              },
            },
            {
              field: "order",
              name: "Priority",
              sortable: true,
              align: "right",
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
                      this.props.history.push(ROUTES.CREATE_TEMPLATE);
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
  return <DataStreams {...props} commonService={context?.commonService as CommonService} />;
}
