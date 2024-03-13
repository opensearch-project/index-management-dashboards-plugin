/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component, useContext } from "react";
import _, { debounce, isEqual, get } from "lodash";
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
  EuiButtonIcon,
  EuiToolTip,
} from "@elastic/eui";
import { ContentPanel, ContentPanelActions } from "../../../../components/ContentPanel";
import { DEFAULT_PAGE_SIZE_OPTIONS, DEFAULT_QUERY_PARAMS } from "../../utils/constants";
import CommonService from "../../../../services/CommonService";
import { ICatComposableTemplate } from "../../interface";
import { BREADCRUMBS, IndicesUpdateMode, ROUTES } from "../../../../utils/constants";
import { CoreServicesContext } from "../../../../components/core_services";
import { ServicesContext } from "../../../../services";
import IndexControls, { SearchControlsProps } from "../../components/IndexControls";
import ComposableTemplatesActions, { ComposableTemplatesDeleteAction } from "../ComposableTemplatesActions";
import { CoreStart } from "opensearch-dashboards/public";
import ComponentTemplateBadge from "../../../../components/ComponentTemplateBadge";
import AssociatedTemplatesModal from "../AssociatedTemplatesModal";
import { useComponentMapTemplate } from "../../utils/hooks";
import "./index.scss";
import { DataSourceMenuContext } from "../../../../services/DataSourceMenuContext";

interface ComposableTemplatesProps extends RouteComponentProps {
  commonService: CommonService;
  componentMapTemplate: Record<string, string[]>;
  loading: boolean;
  dataSourceId: string;
  dataSourceLabel: string;
  multiDataSourceEnabled: boolean;
}

type ComposableTemplatesState = {
  totalComposableTemplates: number;
  from: string;
  size: string;
  sortField: keyof ICatComposableTemplate;
  sortDirection: Direction;
  selectedItems: ICatComposableTemplate[];
  composableTemplates: ICatComposableTemplate[];
  loading: boolean;
  dataSourceId: string;
  dataSourceLabel: string;
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
      sortField: keyof ICatComposableTemplate;
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
      selectedTypes: [],
      dataSourceId: props.dataSourceId,
      dataSourceLabel: props.dataSourceLabel,
    };

    this.getComposableTemplates = debounce(this.getComposableTemplatesOriginal, 500, { leading: true });
  }

  getComposableTemplates: () => Promise<void> | undefined;

  static getDerivedStateFromProps(nextProps: ComposableTemplatesProps, prevState: ComposableTemplatesState) {
    if (nextProps.dataSourceId != prevState.dataSourceId || nextProps.dataSourceLabel != prevState.dataSourceLabel) {
      return {
        dataSourceId: nextProps.dataSourceId,
        dataSourceLabel: nextProps.dataSourceLabel,
      };
    }
    return null;
  }

  async componentDidUpdate(prevProps: ComposableTemplatesProps, prevState: ComposableTemplatesState) {
    const prevQuery = this.getQueryState(prevState);
    const currQuery = this.getQueryState(this.state);
    if (!_.isEqual(prevQuery, currQuery)) {
      await this.getComposableTemplates();
    }
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

  getComposableTemplatesOriginal = async (): Promise<void> => {
    this.setState({ loading: true });
    const { search } = this.state;
    const { history, commonService } = this.props;
    const queryObject = this.getQueryState(this.state);
    const queryParamsString = queryString.stringify(queryObject);
    history.replace({ ...this.props.location, search: queryParamsString });

    const allComposableTemplatesResponse = await commonService.apiCaller<{
      component_templates?: ICatComposableTemplate[];
    }>({
      endpoint: "transport.request",
      data: {
        method: "GET",
        path: `/_component_template/*${search}*`,
      },
      hideLog: true,
    });

    let listResponse: ICatComposableTemplate[] = [];

    if (!allComposableTemplatesResponse.ok) {
      listResponse = [];
      if (allComposableTemplatesResponse.error !== "Not Found") {
        this.context.notifications.toasts.addDanger(allComposableTemplatesResponse.error);
      }
    } else {
      listResponse = allComposableTemplatesResponse.response.component_templates || [];
    }
    const payload = {
      composableTemplates: listResponse,
      totalComposableTemplates: listResponse.length,
      selectedItems: this.state.selectedItems
        .map((item) => listResponse.find((remoteItem) => remoteItem.name === item.name))
        .filter((item) => item),
    } as ComposableTemplatesState;

    this.setState({
      ...payload,
      loading: false,
    });
  };

  onTableChange = ({ page: tablePage, sort }: Criteria<ICatComposableTemplate>): void => {
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

  onSelectionChange = (selectedItems: ICatComposableTemplate[]): void => {
    this.setState({ selectedItems });
  };

  onSearchChange = (params: Parameters<SearchControlsProps["onSearchChange"]>[0]): void => {
    this.setState({ from: "0", ...params }, () => this.getComposableTemplates());
  };

  getFinalItems = (allTemplates: ICatComposableTemplate[]) => {
    const { from, size, sortDirection, sortField, selectedTypes } = this.state;
    const fromNumber = Number(from);
    const sizeNumber = Number(size);
    const componentMapTemplate = this.props.componentMapTemplate;
    // enhance with component map
    let listResponse = (allTemplates || []).map((item) => ({
      ...item,
      usedBy: componentMapTemplate[item.name] || [],
      associatedCount: (componentMapTemplate[item.name] || []).length,
    }));

    // sort
    listResponse = listResponse.sort((a, b) => {
      if (sortDirection === "asc") {
        if (get(a, sortField, 0) < get(b, sortField, 0)) {
          return -1;
        }

        return 1;
      } else {
        if (get(a, sortField, 0) > get(b, sortField, 0)) {
          return -1;
        }

        return 1;
      }
    });

    // filter by types
    listResponse = listResponse.filter((item) => {
      if (!selectedTypes.length) {
        return true;
      }

      return selectedTypes.every((type) => !!item.component_template.template[type as IndicesUpdateMode]);
    });

    //pagination
    return listResponse.slice(fromNumber * sizeNumber, (fromNumber + 1) * sizeNumber);
  };

  render() {
    const { totalComposableTemplates, from, size, sortField, sortDirection, composableTemplates, loading } = this.state;

    const pagination: Pagination = {
      pageIndex: Number(from),
      pageSize: Number(size),
      pageSizeOptions: DEFAULT_PAGE_SIZE_OPTIONS,
      totalItemCount: Number(totalComposableTemplates),
    };

    const sorting: EuiTableSortingType<ICatComposableTemplate> = {
      sort: {
        direction: sortDirection,
        field: sortField,
      },
    };

    const selection: EuiTableSelectionType<ICatComposableTemplate> = {
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
                    selectedItems={this.state.selectedItems.map((item) => item.name)}
                    onDelete={this.getComposableTemplates}
                  />
                ),
              },
              {
                text: "Create component template",
                buttonProps: {
                  fill: true,
                  onClick: () => {
                    this.props.history.push(ROUTES.CREATE_COMPOSABLE_TEMPLATE);
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
              <span>Component templates</span>
            </EuiTitle>
            <EuiFormRow
              fullWidth
              helpText={
                <div>
                  Component templates are reusable building blocks for composing index or data stream templates. You can define component
                  templates with common index configurations and associate them to an index template.{" "}
                  <EuiLink external target="_blank" href={(this.context as CoreStart).docLinks.links.opensearch.indexTemplates.composable}>
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
            selectedTypes: this.state.selectedTypes,
          }}
          onSearchChange={this.onSearchChange}
        />
        <EuiHorizontalRule margin="xs" />

        <EuiBasicTable
          className="ISM-component-templates-table"
          data-test-subj="templatesTable"
          loading={this.state.loading || this.props.loading}
          columns={[
            {
              field: "name",
              name: "Name",
              sortable: true,
              render: (value: string) => {
                return (
                  <Link to={`${ROUTES.CREATE_COMPOSABLE_TEMPLATE}/${value}`}>
                    <EuiLink data-test-subj={`templateDetail-${value}`}>{value}</EuiLink>
                  </Link>
                );
              },
            },
            {
              field: "templateTypes",
              name: "Type",
              truncateText: true,
              textOnly: false,
              render: (value: string, record: ICatComposableTemplate) => {
                return <ComponentTemplateBadge template={record.component_template.template} />;
              },
            },
            {
              field: "component_template._meta.description",
              name: "Description",
              sortable: true,
              render: (value: string, record: ICatComposableTemplate) => {
                return record.component_template._meta?.description || "-";
              },
            },
            {
              field: "associatedCount",
              name: "Associated index templates",
              sortable: true,
              align: "right",
            },
            {
              field: "actions",
              name: "Actions",
              align: "right",
              actions: [
                {
                  render: (record: ICatComposableTemplate) => {
                    return (
                      <AssociatedTemplatesModal
                        componentTemplate={record.name}
                        onUnlink={/* istanbul ignore next */ () => this.getComposableTemplates()}
                        renderProps={({ setVisible }) => (
                          <EuiToolTip content="View associated index templates">
                            <EuiButtonIcon
                              aria-label="View associated index templates"
                              iconType="kqlSelector"
                              data-test-subj={`ViewAssociatedIndexTemplates-${record.name}`}
                              onClick={() => setVisible(true)}
                              className="icon-hover-info"
                            />
                          </EuiToolTip>
                        )}
                      />
                    );
                  },
                },
                {
                  render: (record: ICatComposableTemplate) => {
                    return (
                      <ComposableTemplatesDeleteAction
                        selectedItems={[record.name]}
                        onDelete={() => {
                          this.getComposableTemplates();
                        }}
                        renderDeleteButton={({ triggerDelete }) => (
                          <EuiToolTip content="Delete component template">
                            <EuiButtonIcon
                              aria-label="Delete component template"
                              color="danger"
                              iconType="trash"
                              onClick={triggerDelete}
                              className="icon-hover-danger"
                              data-test-subj={`DeleteComponentTemplate-${record.name}`}
                            />
                          </EuiToolTip>
                        )}
                      />
                    );
                  },
                },
              ],
            },
          ]}
          isSelectable={true}
          itemId="name"
          items={this.getFinalItems(composableTemplates)}
          onChange={this.onTableChange}
          pagination={pagination}
          selection={selection}
          sorting={sorting}
          noItemsMessage={
            loading ? undefined : isEqual(
                {
                  search: this.state.search,
                },
                defaultFilter
              ) ? (
              <EuiEmptyPrompt
                body={
                  <EuiText>
                    <p>You have no templates.</p>
                  </EuiText>
                }
                actions={[
                  <EuiButton
                    fill
                    onClick={() => {
                      this.props.history.push(ROUTES.CREATE_COMPOSABLE_TEMPLATE);
                    }}
                    data-test-subj="CreateComponentTemplateWhenNoTemplateFound"
                  >
                    Create component template
                  </EuiButton>,
                ]}
              />
            ) : (
              <EuiEmptyPrompt
                body={
                  <EuiText>
                    <p>There are no templates matching your applied filters. Reset your filters to view your templates.</p>
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

export default function ComposableTemplatesContainer(
  props: Omit<ComposableTemplatesProps, "commonService" | "loading" | "componentMapTemplate">
) {
  const context = useContext(ServicesContext);
  const dataSourceMenuProps = useContext(DataSourceMenuContext);
  const { componentMapTemplate, loading } = useComponentMapTemplate();
  return (
    <ComposableTemplates
      {...props}
      loading={loading}
      componentMapTemplate={componentMapTemplate}
      commonService={context?.commonService as CommonService}
      dataSourceId={dataSourceMenuProps.dataSourceId}
      dataSourceLabel={dataSourceMenuProps.dataSourceLabel}
      multiDataSourceEnabled={dataSourceMenuProps.multiDataSourceEnabled}
    />
  );
}
