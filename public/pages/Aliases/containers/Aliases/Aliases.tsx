/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component, useContext, useState } from "react";
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
  EuiButtonEmpty,
  EuiButton,
  EuiFlyout,
  EuiFlyoutHeader,
  EuiFlyoutBody,
  EuiText,
} from "@elastic/eui";
import { ContentPanel, ContentPanelActions } from "../../../../components/ContentPanel";
import { DEFAULT_PAGE_SIZE_OPTIONS, DEFAULT_QUERY_PARAMS } from "../../utils/constants";
import CommonService from "../../../../services/CommonService";
import { IAlias } from "../../interface";
import { BREADCRUMBS } from "../../../../utils/constants";
import { CoreServicesContext } from "../../../../components/core_services";
import { ServicesContext } from "../../../../services";
import IndexControls, { SearchControlsProps } from "../../components/IndexControls";
import CreateAlias from "../CreateAlias";
import AliasesActions from "../AliasActions";

interface AliasesProps extends RouteComponentProps {
  commonService: CommonService;
}

interface AliasesState {
  totalAliases: number;
  from: string;
  size: string;
  search: string;
  status: string;
  sortField: keyof IAlias;
  sortDirection: Direction;
  selectedItems: IAlias[];
  aliases: IAlias[];
  loading: boolean;
  aliasCreateFlyoutVisible: boolean;
  aliasEditFlyoutVisible: boolean;
}

function IndexNameDisplay(props: { indices: string[]; alias: string }) {
  const [hide, setHide] = useState(true);
  const [tableParams, setTableParams] = useState<Criteria<IAlias>>({});
  const { index, size } = tableParams.page || {
    index: 0,
    size: 10,
  };

  return (
    <>
      <span>{props.indices.slice(0, 3).join(",")}</span>
      {props.indices.length <= 3 ? null : (
        <EuiButtonEmpty data-test-subj={`${props.indices.length - 3} more`} onClick={() => setHide(!hide)}>
          {props.indices.length - 3} more
        </EuiButtonEmpty>
      )}
      {hide ? null : (
        <EuiFlyout onClose={() => setHide(!hide)}>
          <EuiFlyoutHeader hasBorder>
            <EuiText size="m">
              <h2 title={`Indices in ${props.alias} (${props.indices.length})`}>
                Indices in {props.alias} ({props.indices.length})
              </h2>
            </EuiText>
          </EuiFlyoutHeader>
          <EuiFlyoutBody>
            <EuiBasicTable
              data-test-subj="indices-table"
              columns={[
                {
                  name: "Index",
                  field: "index",
                },
              ]}
              items={props.indices.slice(index * size, (index + 1) * size).map((index) => ({ index }))}
              onChange={setTableParams}
              pagination={{
                pageIndex: index,
                pageSize: size,
                totalItemCount: props.indices.length,
              }}
            />
          </EuiFlyoutBody>
        </EuiFlyout>
      )}
    </>
  );
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
      status = DEFAULT_QUERY_PARAMS.status,
    } = queryString.parse(props.history.location.search) as {
      from: string;
      size: string;
      search: string;
      sortField: keyof IAlias;
      sortDirection: Direction;
      status: string;
    };
    this.state = {
      totalAliases: 0,
      from,
      size,
      status,
      search,
      sortField,
      sortDirection,
      selectedItems: [],
      aliases: [],
      loading: false,
      aliasCreateFlyoutVisible: false,
      aliasEditFlyoutVisible: false,
    };

    this.getAliases = _.debounce(this.getAliases, 500, { leading: true });
  }

  componentDidMount() {
    this.context.chrome.setBreadcrumbs([BREADCRUMBS.INDEX_MANAGEMENT, BREADCRUMBS.ALIASES]);
    this.getAliases();
  }

  getQueryState = (state: AliasesState) => {
    return Object.keys(DEFAULT_QUERY_PARAMS).reduce((total, key) => {
      return {
        ...total,
        [key]: state[key as keyof typeof DEFAULT_QUERY_PARAMS],
      };
    }, {} as AliasesState);
  };

  groupResponse = (array: IAlias[]) => {
    const groupedMap: Record<string, IAlias & { order: number }> = {};
    array.forEach((item, index) => {
      groupedMap[item.alias] = groupedMap[item.alias] || {
        ...item,
        order: index,
        indexArray: [],
      };
      groupedMap[item.alias].indexArray.push(item.index);
    });
    const result = Object.values(groupedMap);
    result.sort((a, b) => a.order - b.order);
    return Object.values(groupedMap).sort();
  };

  getAliases = async (): Promise<void> => {
    this.setState({ loading: true });
    const { from, size, status } = this.state;
    const fromNumber = Number(from);
    const sizeNumber = Number(size);
    const { history, commonService } = this.props;
    const queryObject = this.getQueryState(this.state);
    const queryParamsString = queryString.stringify(queryObject);
    history.replace({ ...this.props.location, search: queryParamsString });

    const payload: any = {
      format: "json",
      name: `${queryObject.search}*`,
      s: `${queryObject.sortField}:${queryObject.sortDirection}`,
      expand_wildcards: status,
    };
    if (!status) {
      delete payload.expand_wildcards;
    }

    const getAliasesResponse = await commonService.apiCaller<IAlias[]>({
      endpoint: "cat.aliases",
      data: payload,
    });

    if (getAliasesResponse.ok) {
      // group by alias name
      const responseGroupByAliasName: IAlias[] = this.groupResponse(getAliasesResponse.response);
      const totalAliases = responseGroupByAliasName.length;
      const payload = {
        aliases: responseGroupByAliasName.slice(fromNumber * sizeNumber, (fromNumber + 1) * sizeNumber),
        totalAliases,
        selectedItems: this.state.selectedItems
          .map((item) => responseGroupByAliasName.find((remoteItem) => remoteItem.alias === item.alias))
          .filter((item) => item),
      } as AliasesState;
      this.setState(payload);
    } else {
      this.context.notifications.toasts.addDanger(getAliasesResponse.error);
    }

    // Avoiding flicker by showing/hiding the "Data stream" column only after the results are loaded.
    this.setState({ loading: false });
  };

  onTableChange = ({ page: tablePage, sort }: Criteria<IAlias>): void => {
    const { index: page, size } = tablePage || {};
    const { field: sortField, direction: sortDirection } = sort || {};
    this.setState(
      {
        from: "" + page,
        size: "" + size,
        sortField: sortField || DEFAULT_QUERY_PARAMS.sortField,
        sortDirection: sortDirection as Direction,
      },
      () => this.getAliases()
    );
  };

  onSelectionChange = (selectedItems: IAlias[]): void => {
    this.setState({ selectedItems });
  };

  onSearchChange = (params: Parameters<SearchControlsProps["onSearchChange"]>[0]): void => {
    this.setState({ from: "0", ...params }, () => this.getAliases());
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
                text: "",
                children: (
                  <AliasesActions
                    onUpdateAlias={() => {
                      this.setState({ aliasEditFlyoutVisible: true });
                    }}
                    selectedItems={this.state.selectedItems}
                    onDelete={this.getAliases}
                  />
                ),
              },
              {
                text: "Create Alias",
                buttonProps: {
                  fill: true,
                  onClick: () => {
                    this.setState({
                      aliasCreateFlyoutVisible: true,
                    });
                  },
                },
              },
            ]}
          />
        }
        bodyStyles={{ padding: "initial" }}
        title="Aliases"
      >
        <IndexControls
          value={{
            search: this.state.search,
            status: this.state.status,
          }}
          onSearchChange={this.onSearchChange}
        />
        <EuiHorizontalRule margin="xs" />

        <EuiBasicTable
          data-test-subj="aliases-table"
          columns={[
            {
              field: "alias",
              name: "Alias Name",
              sortable: true,
            },
            {
              field: "indexArray",
              name: "Index Name",
              render: (value: string[], record) => {
                return <IndexNameDisplay indices={value} alias={record.alias} />;
              },
            },
          ]}
          isSelectable={true}
          itemId="alias"
          items={aliases}
          onChange={this.onTableChange}
          pagination={pagination}
          selection={selection}
          sorting={sorting}
          noItemsMessage={
            <div
              style={{
                textAlign: "center",
              }}
            >
              <h4>You have no aliases.</h4>
              <EuiButton
                fill
                color="primary"
                style={{
                  marginTop: 20,
                }}
                onClick={() => {
                  this.setState({
                    aliasCreateFlyoutVisible: true,
                  });
                }}
              >
                Create alias
              </EuiButton>
            </div>
          }
        />
        <CreateAlias
          visible={this.state.aliasCreateFlyoutVisible}
          onSuccess={() => {
            this.getAliases();
            this.setState({ aliasCreateFlyoutVisible: false });
          }}
          onClose={() => this.setState({ aliasCreateFlyoutVisible: false })}
        />
        <CreateAlias
          visible={this.state.aliasEditFlyoutVisible}
          onSuccess={() => {
            this.getAliases();
            this.setState({ aliasEditFlyoutVisible: false });
          }}
          onClose={() => this.setState({ aliasEditFlyoutVisible: false })}
          alias={this.state.selectedItems[0]}
        />
      </ContentPanel>
    );
  }
}

export default function AliasContainer(props: Omit<AliasesProps, "commonService">) {
  const context = useContext(ServicesContext);
  return <Aliases {...props} commonService={context?.commonService as CommonService} />;
}
