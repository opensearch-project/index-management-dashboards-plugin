/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component, useContext } from "react";
import _ from "lodash";
import { RouteComponentProps } from "react-router-dom";
import queryString from "query-string";
import {
  EuiHorizontalRule,
  EuiBasicTable,
  Criteria,
  EuiTableSortingType,
  Direction,
  Pagination,
  EuiTableSelectionType,
  Query,
} from "@elastic/eui";
import { ContentPanel, ContentPanelActions } from "../../../../components/ContentPanel";
import { DEFAULT_PAGE_SIZE_OPTIONS, DEFAULT_QUERY_PARAMS } from "../../utils/constants";
import CommonService from "../../../../services/CommonService";
import { IAlias } from "../../interface";
import { BREADCRUMBS, ROUTES } from "../../../../utils/constants";
import { getErrorMessage } from "../../../../utils/helpers";
import { CoreServicesContext } from "../../../../components/core_services";
import { ServicesContext } from "../../../../services";
import IndexControls from "../../components/IndexControls";

interface AliasesProps extends RouteComponentProps {
  commonService: CommonService;
}

interface AliasesState {
  totalAliases: number;
  from: string;
  size: string;
  search: string;
  query: Query;
  sortField: keyof IAlias;
  sortDirection: Direction;
  selectedItems: IAlias[];
  aliases: IAlias[];
  loading: boolean;
}

class Aliases extends Component<AliasesProps, AliasesState> {
  static contextType = CoreServicesContext;
  constructor(props: AliasesProps) {
    super(props);
    const {
      from = DEFAULT_QUERY_PARAMS.from,
      size = DEFAULT_QUERY_PARAMS.size,
      search = DEFAULT_QUERY_PARAMS.search,
      sortField = DEFAULT_QUERY_PARAMS.sortField,
      sortDirection = DEFAULT_QUERY_PARAMS.sortDirection,
    } = queryString.parse(location.search) as {
      from: string;
      size: string;
      search: string;
      sortField: keyof IAlias;
      sortDirection: Direction;
    };
    this.state = {
      totalAliases: 0,
      from,
      size,
      search,
      query: Query.parse(search),
      sortField,
      sortDirection,
      selectedItems: [],
      aliases: [],
      loading: false,
    };

    this.getAliases = _.debounce(this.getAliases, 500, { leading: true });
  }

  async componentDidMount() {
    this.context.chrome.setBreadcrumbs([BREADCRUMBS.INDEX_MANAGEMENT, BREADCRUMBS.INDICES]);
    await this.getAliases();
  }

  getQueryState = (state: AliasesState) => {
    return Object.keys(DEFAULT_QUERY_PARAMS).reduce((total, key) => {
      return {
        ...total,
        [key]: state[key as keyof typeof DEFAULT_QUERY_PARAMS],
      };
    }, {} as AliasesState);
  };

  getAliases = async (): Promise<void> => {
    this.setState({ loading: true });
    try {
      const { history, commonService } = this.props;
      const queryObject = this.getQueryState(this.state);
      const queryParamsString = queryString.stringify(queryObject);
      history.replace({ ...this.props.location, search: queryParamsString });

      const getIndicesResponse = await commonService.apiCaller<IAlias[]>({
        endpoint: "cat.aliases",
        data: {
          format: "json",
        },
      });

      if (getIndicesResponse.ok) {
        const aliases: IAlias[] = getIndicesResponse.response.map((item) => ({
          ...item,
          aliasId: `${item.alias}-${item.index}`,
        }));
        const totalAliases = aliases.length;
        const payload = {
          aliases,
          totalAliases,
          selectedItems: this.state.selectedItems
            .map((item) => aliases.find((remoteItem) => remoteItem.index === item.index))
            .filter((item) => item),
        } as AliasesState;
        this.setState(payload);
      } else {
        this.context.notifications.toasts.addDanger(getIndicesResponse.error);
      }
    } catch (err) {
      this.context.notifications.toasts.addDanger(getErrorMessage(err, "There was a problem loading the indices"));
    }

    // Avoiding flicker by showing/hiding the "Data stream" column only after the results are loaded.
    this.setState({ loading: false });
  };

  onTableChange = ({ page: tablePage, sort }: Criteria<IAlias>): void => {
    const { index: page, size } = tablePage || {};
    const { field: sortField, direction: sortDirection } = sort || {};
    this.setState({
      from: "" + page,
      size: "" + size,
      sortField: sortField || DEFAULT_QUERY_PARAMS.sortField,
      sortDirection: sortDirection as Direction,
    });
  };

  onSelectionChange = (selectedItems: IAlias[]): void => {
    this.setState({ selectedItems });
  };

  resetFilters = (): void => {
    this.setState({ search: DEFAULT_QUERY_PARAMS.search, query: Query.parse(DEFAULT_QUERY_PARAMS.search) });
  };

  onSearchChange = ({ query }: { query: string }): void => {
    this.setState({ from: "0", search: query });
    this.getAliases();
  };

  render() {
    const { totalAliases, from, size, sortField, sortDirection, aliases } = this.state;

    const pagination: Pagination = {
      pageIndex: Number(from),
      pageSize: Number(size),
      pageSizeOptions: DEFAULT_PAGE_SIZE_OPTIONS,
      totalItemCount: Number(totalAliases),
    };

    const sorting: EuiTableSortingType<IAlias> = {
      sort: {
        direction: sortDirection,
        field: sortField,
      },
    };

    const selection: EuiTableSelectionType<IAlias> = {
      onSelectionChange: this.onSelectionChange,
    };
    return (
      <ContentPanel
        actions={
          <ContentPanelActions
            actions={[
              {
                text: "Create Alias",
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
        title="Aliases"
      >
        <IndexControls search={this.state.search} onSearchChange={this.onSearchChange} />
        <EuiHorizontalRule margin="xs" />

        <EuiBasicTable
          columns={[
            {
              field: "alias",
              name: "Alias Name",
              sortable: true,
            },
            {
              field: "index",
              name: "Index Name",
              sortable: true,
            },
          ]}
          isSelectable={true}
          itemId="aliasId"
          items={aliases}
          onChange={this.onTableChange}
          pagination={pagination}
          selection={selection}
          sorting={sorting}
        />
      </ContentPanel>
    );
  }
}

export default function AliasContainer(props: Omit<AliasesProps, "commonService">) {
  const context = useContext(ServicesContext);
  return <Aliases {...props} commonService={context?.commonService as CommonService} />;
}
