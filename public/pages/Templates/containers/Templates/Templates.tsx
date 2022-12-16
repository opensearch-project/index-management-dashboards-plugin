/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component, useContext } from "react";
import { debounce } from "lodash";
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
} from "@elastic/eui";
import { ContentPanel, ContentPanelActions } from "../../../../components/ContentPanel";
import { DEFAULT_PAGE_SIZE_OPTIONS, DEFAULT_QUERY_PARAMS } from "../../utils/constants";
import CommonService from "../../../../services/CommonService";
import { ITemplate } from "../../interface";
import { BREADCRUMBS, ROUTES } from "../../../../utils/constants";
import { CoreServicesContext } from "../../../../components/core_services";
import { ServicesContext } from "../../../../services";
import IndexControls, { SearchControlsProps } from "../../components/IndexControls";
import TemplatesActions from "../TemplatesActions";

interface TemplatesProps extends RouteComponentProps {
  commonService: CommonService;
}

type TemplatesState = {
  totalTemplates: number;
  from: string;
  size: string;
  sortField: keyof ITemplate;
  sortDirection: Direction;
  selectedItems: ITemplate[];
  templates: ITemplate[];
  loading: boolean;
} & SearchControlsProps["value"];

class Templates extends Component<TemplatesProps, TemplatesState> {
  static contextType = CoreServicesContext;
  constructor(props: TemplatesProps) {
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
      sortField: keyof ITemplate;
      sortDirection: Direction;
    };
    this.state = {
      totalTemplates: 0,
      from,
      size,
      search,
      sortField,
      sortDirection,
      selectedItems: [],
      templates: [],
      loading: false,
    };

    this.getTemplates = debounce(this.getTemplates, 500, { leading: true });
  }

  componentDidMount() {
    this.context.chrome.setBreadcrumbs([BREADCRUMBS.INDEX_MANAGEMENT, BREADCRUMBS.TEMPLATES]);
    this.getTemplates();
  }

  getQueryState = (state: TemplatesState) => {
    return Object.keys(DEFAULT_QUERY_PARAMS).reduce((total, key) => {
      return {
        ...total,
        [key]: state[key as keyof typeof DEFAULT_QUERY_PARAMS],
      };
    }, {} as TemplatesState);
  };

  getTemplates = async (): Promise<void> => {
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
      name: `${queryObject.search}*`,
      s: `${queryObject.sortField}:${queryObject.sortDirection}`,
    };

    const getTemplatesResponse = await commonService.apiCaller<ITemplate[]>({
      endpoint: "cat.templates",
      data: payload,
    });

    if (getTemplatesResponse.ok) {
      // group by alias name
      const responseGroupByAliasName: ITemplate[] = getTemplatesResponse.response;
      const totalTemplates = responseGroupByAliasName.length;
      const payload = {
        templates: responseGroupByAliasName.slice(fromNumber * sizeNumber, (fromNumber + 1) * sizeNumber),
        totalTemplates,
        selectedItems: this.state.selectedItems
          .map((item) => responseGroupByAliasName.find((remoteItem) => remoteItem.name === item.name))
          .filter((item) => item),
      } as TemplatesState;
      this.setState(payload);
    } else {
      this.context.notifications.toasts.addDanger(getTemplatesResponse.error);
    }

    // Avoiding flicker by showing/hiding the "Data stream" column only after the results are loaded.
    this.setState({ loading: false });
  };

  onTableChange = ({ page: tablePage, sort }: Criteria<ITemplate>): void => {
    const { index: page, size } = tablePage || {};
    const { field: sortField, direction: sortDirection } = sort || {};
    this.setState(
      {
        from: "" + page,
        size: "" + size,
        sortField: sortField || DEFAULT_QUERY_PARAMS.sortField,
        sortDirection: sortDirection as Direction,
      },
      () => this.getTemplates()
    );
  };

  onSelectionChange = (selectedItems: ITemplate[]): void => {
    this.setState({ selectedItems });
  };

  onSearchChange = (params: Parameters<SearchControlsProps["onSearchChange"]>[0]): void => {
    this.setState({ from: "0", ...params }, () => this.getTemplates());
  };

  render() {
    const { totalTemplates, from, size, sortField, sortDirection, templates } = this.state;

    const pagination: Pagination = {
      pageIndex: Number(from),
      pageSize: Number(size),
      pageSizeOptions: DEFAULT_PAGE_SIZE_OPTIONS,
      totalItemCount: Number(totalTemplates),
    };

    const sorting: EuiTableSortingType<ITemplate> = {
      sort: {
        direction: sortDirection,
        field: sortField,
      },
    };

    const selection: EuiTableSelectionType<ITemplate> = {
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
                  <TemplatesActions selectedItems={this.state.selectedItems} onDelete={this.getTemplates} history={this.props.history} />
                ),
              },
              {
                text: "Create Template",
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
        title="Templates"
      >
        <IndexControls
          value={{
            search: this.state.search,
          }}
          onSearchChange={this.onSearchChange}
        />
        <EuiHorizontalRule margin="xs" />

        <EuiBasicTable
          data-test-subj="templatesTable"
          columns={[
            {
              field: "name",
              name: "Template name",
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
              field: "index_patterns",
              name: "Index patterns or wildcards",
              sortable: true,
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
          items={templates}
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
              <h4>You have no templates.</h4>
              <EuiButton
                fill
                color="primary"
                style={{
                  marginTop: 20,
                }}
                onClick={() => {
                  this.props.history.push(ROUTES.CREATE_TEMPLATE);
                }}
              >
                Create template
              </EuiButton>
            </div>
          }
        />
      </ContentPanel>
    );
  }
}

export default function TemplatesContainer(props: Omit<TemplatesProps, "commonService">) {
  const context = useContext(ServicesContext);
  return <Templates {...props} commonService={context?.commonService as CommonService} />;
}
