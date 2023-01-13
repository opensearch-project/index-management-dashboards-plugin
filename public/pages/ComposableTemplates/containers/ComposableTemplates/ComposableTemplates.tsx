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
  Direction,
  Pagination,
  EuiTableSelectionType,
  EuiButton,
  EuiLink,
  EuiTitle,
  EuiFormRow,
  EuiEmptyPrompt,
  EuiText,
  EuiTableSortingType,
} from "@elastic/eui";
import { ContentPanel, ContentPanelActions } from "../../../../components/ContentPanel";
import { DEFAULT_PAGE_SIZE_OPTIONS, DEFAULT_QUERY_PARAMS } from "../../utils/constants";
import CommonService from "../../../../services/CommonService";
import { IComposableTemplate } from "../../interface";
import { BREADCRUMBS, ROUTES } from "../../../../utils/constants";
import { CoreServicesContext } from "../../../../components/core_services";
import { ServicesContext } from "../../../../services";
import IndexControls, { SearchControlsProps } from "../../components/IndexControls";
import ComposableTemplatesActions from "../ComposableTemplatesActions";
import { CoreStart } from "opensearch-dashboards/public";
import { TemplateItemRemote } from "../../../../../models/interfaces";
import { TemplateConvert } from "../../../CreateIndexTemplate/components/TemplateType";

interface ComposableTemplatesProps extends RouteComponentProps {
  commonService: CommonService;
}

type ComposableTemplatesState = {
  totalComposableTemplates: number;
  from: string;
  size: string;
  sortField: keyof IComposableTemplate;
  sortDirection: Direction;
  selectedItems: IComposableTemplate[];
  composableTemplates: IComposableTemplate[];
  loading: boolean;
} & SearchControlsProps["value"];

const defaultFilter = {
  search: DEFAULT_QUERY_PARAMS.search,
};

class ComposableTemplates extends Component<ComposableTemplatesProps, ComposableTemplatesState> {
  static contextType = CoreServicesContext;
  constructor(props: ComposableTemplatesProps) {
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
      sortField: keyof IComposableTemplate;
      sortDirection: Direction;
    };
    this.state = {
      ...defaultFilter,
      totalComposableTemplates: 0,
      from,
      size,
      search,
      sortField,
      sortDirection,
      selectedItems: [],
      composableTemplates: [],
      loading: false,
    };

    this.getComposableTemplates = debounce(this.getComposableTemplates, 500, { leading: true });
  }

  componentDidMount() {
    this.context.chrome.setBreadcrumbs([BREADCRUMBS.INDEX_MANAGEMENT, BREADCRUMBS.TEMPLATES]);
    this.getComposableTemplates();
  }

  getQueryState = (state: ComposableTemplatesState) => {
    return Object.keys(DEFAULT_QUERY_PARAMS).reduce((total, key) => {
      return {
        ...total,
        [key]: state[key as keyof typeof DEFAULT_QUERY_PARAMS],
      };
    }, {} as ComposableTemplatesState);
  };

  getComposableTemplates = async (): Promise<void> => {
    this.setState({ loading: true });
    const { from, size, search } = this.state;
    const fromNumber = Number(from);
    const sizeNumber = Number(size);
    const { history, commonService } = this.props;
    const queryObject = this.getQueryState(this.state);
    const queryParamsString = queryString.stringify(queryObject);
    history.replace({ ...this.props.location, search: queryParamsString });

    const allComposableTemplatesResponse = await commonService.apiCaller<{
      component_templates?: IComposableTemplate[];
    }>({
      endpoint: "transport.request",
      data: {
        method: "GET",
        path: `_component_template/*${search}*`,
      },
    });

    let listResponse: IComposableTemplate[] = [];

    if (!allComposableTemplatesResponse.ok) {
      listResponse = [];
      this.context.notifications.toasts.addDanger(allComposableTemplatesResponse.error);
    } else {
      listResponse = allComposableTemplatesResponse.response.component_templates || [];
      const payload = {
        composableTemplates: listResponse.slice(fromNumber * sizeNumber, (fromNumber + 1) * sizeNumber),
        totalComposableTemplates: listResponse.length,
        selectedItems: this.state.selectedItems
          .map((item) => listResponse.find((remoteItem) => remoteItem.name === item.name))
          .filter((item) => item),
      } as ComposableTemplatesState;
      this.setState(payload);
    }

    this.setState({ loading: false });
  };

  onTableChange = ({ page: tablePage, sort }: Criteria<IComposableTemplate>): void => {
    const { index: page, size } = tablePage || {};
    const { field: sortField, direction: sortDirection } = sort || {};
    this.setState(
      {
        from: "" + page,
        size: "" + size,
        sortField: sortField || DEFAULT_QUERY_PARAMS.sortField,
        sortDirection: sortDirection as Direction,
      },
      () => this.getComposableTemplates()
    );
  };

  onSelectionChange = (selectedItems: IComposableTemplate[]): void => {
    this.setState({ selectedItems });
  };

  onSearchChange = (params: Parameters<SearchControlsProps["onSearchChange"]>[0]): void => {
    this.setState({ from: "0", ...params }, () => this.getComposableTemplates());
  };

  render() {
    const { totalComposableTemplates, from, size, sortField, sortDirection, composableTemplates } = this.state;

    const pagination: Pagination = {
      pageIndex: Number(from),
      pageSize: Number(size),
      pageSizeOptions: DEFAULT_PAGE_SIZE_OPTIONS,
      totalItemCount: Number(totalComposableTemplates),
    };

    const sorting: EuiTableSortingType<IComposableTemplate> = {
      sort: {
        direction: sortDirection,
        field: sortField,
      },
    };

    const selection: EuiTableSelectionType<IComposableTemplate> = {
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
                  <ComposableTemplatesActions
                    selectedItems={this.state.selectedItems}
                    onDelete={this.getComposableTemplates}
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
              <span>Composable templates</span>
            </EuiTitle>
            <EuiFormRow
              fullWidth
              helpText={
                <div>
                  Composable templates let you initialize new templates with predefined mappings and settings.{" "}
                  <EuiLink external target="_blank" href={(this.context as CoreStart).docLinks.links.opensearch.indexTemplates.composable}>
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
          data-test-subj="templatesTable"
          loading={this.state.loading}
          columns={[
            {
              field: "name",
              name: "composable template name",
              sortable: true,
              render: (value: string) => {
                return (
                  <Link to={`${ROUTES.CREATE_TEMPLATE}/${value}/readonly`}>
                    <EuiLink>{value}</EuiLink>
                  </Link>
                );
              },
            },
          ]}
          isSelectable={true}
          itemId="name"
          items={composableTemplates}
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
                    <p>You have no composable templates.</p>
                  </EuiText>
                }
                actions={[
                  <EuiButton
                    fill
                    onClick={() => {
                      this.props.history.push(ROUTES.CREATE_TEMPLATE);
                    }}
                  >
                    Create composable template
                  </EuiButton>,
                ]}
              />
            ) : (
              <EuiEmptyPrompt
                body={
                  <EuiText>
                    <p>There are no composable templates matching your applied filters. Reset your filters to view your templates.</p>
                  </EuiText>
                }
                actions={[
                  <EuiButton
                    fill
                    onClick={() => {
                      this.setState(defaultFilter, () => {
                        this.getComposableTemplates();
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

export default function ComposableTemplatesContainer(props: Omit<ComposableTemplatesProps, "commonService">) {
  const context = useContext(ServicesContext);
  return <ComposableTemplates {...props} commonService={context?.commonService as CommonService} />;
}
