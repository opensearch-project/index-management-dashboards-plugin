/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from "react";
import {
  EuiComboBoxOptionOption,
  EuiFlexGrid,
  EuiFlexItem,
  EuiSpacer,
  EuiText,
  EuiTableFieldDataColumnType,
  EuiFlexGroup,
  // @ts-ignore
  Criteria,
  // @ts-ignore
  Pagination,
  EuiIcon,
  EuiTableSortingType,
} from "@elastic/eui";
import { ContentPanel, ContentPanelActions } from "../../../../components/ContentPanel";
import { ModalConsumer } from "../../../../components/Modal";
import { DEFAULT_PAGE_SIZE_OPTIONS } from "../../../Rollups/utils/constants";
import { parseTimeunit } from "../../utils/helpers";
import { DimensionItem, MetricItem } from "../../../../../models/interfaces";
import {
  additionalMetricsComponent,
  AGGREGATION_AND_METRIC_SETTINGS,
  BaseAggregationAndMetricsState,
  BaseAggregationColumns,
  BaseMetricsColumns,
  sequenceTableComponents,
  sourceFieldComponents,
} from "../../../Commons/BaseAggregationAndMetricSettings";

interface HistogramAndMetricsProps {
  rollupId: string;
  onChangeStep: (step: number) => void;
  timestamp: EuiComboBoxOptionOption<String>[];
  intervalType: string;
  intervalValue: number;
  timezone: string;
  timeunit: string;
  selectedDimensionField: DimensionItem[];
  selectedMetrics: MetricItem[];
}

interface HistogramAndMetricsState extends BaseAggregationAndMetricsState {
  metricsShown: MetricItem[];
  dimensionsShown: DimensionItem[];
}

const _createFlowAggregateColumns: Readonly<EuiTableFieldDataColumnType<DimensionItem>>[] = [
  {
    field: "field.type",
    name: "Field type",
    align: "left",
    render: (type) => (type == undefined ? "-" : type),
  },
];

const aggregationColumns: Readonly<EuiTableFieldDataColumnType<DimensionItem>>[] = [
  ...BaseAggregationColumns,
  ..._createFlowAggregateColumns,
];

const metricsColumns: EuiTableFieldDataColumnType<MetricItem>[] = BaseMetricsColumns;

export default class HistogramAndMetrics extends Component<HistogramAndMetricsProps, HistogramAndMetricsState> {
  constructor(props: HistogramAndMetricsProps) {
    super(props);
    const { selectedDimensionField, selectedMetrics } = this.props;
    this.state = {
      from: 0,
      size: 10,
      sortField: "sequence",
      sortDirection: "desc",
      metricsShown: selectedMetrics.slice(0, 10),
      dimensionsShown: selectedDimensionField.slice(0, 10),
      dimensionFrom: 0,
      dimensionSize: 10,
      dimensionSortField: "sequence",
      dimensionSortDirection: "desc",
    };
  }

  onTableChange = ({ page: tablePage, sort }: Criteria<MetricItem>): void => {
    const { index: page, size } = tablePage;
    const { field: sortField, direction: sortDirection } = sort;
    const { selectedMetrics } = this.props;
    this.setState({
      from: page * size,
      size,
      sortField,
      sortDirection,
      metricsShown: selectedMetrics.slice(page * size, page * size + size),
    });
  };

  onDimensionTableChange = ({ page: tablePage, sort }: Criteria<DimensionItem>): void => {
    const { index: page, size } = tablePage;
    const { field: sortField, direction: sortDirection } = sort;
    const { selectedDimensionField } = this.props;
    this.setState({
      dimensionFrom: page * size,
      dimensionSize: size,
      dimensionSortField: sortField,
      dimensionSortDirection: sortDirection,
      dimensionsShown: selectedDimensionField.slice(page * size, page * size + size),
    });
  };

  parseMetric = (metrics: MetricItem[]): MetricItem[] => {
    if (metrics.length == 0) return [];
    const result = metrics.map((metric) => ({
      source_field: metric.source_field.label,
      all: false,
      min: metric.min,
      max: metric.max,
      sum: metric.sum,
      avg: metric.avg,
      value_count: metric.value_count,
    }));
    return result;
  };

  parseInterval(intervalType: string, intervalValue: number, timeunit: string): string {
    if (intervalType == "calendar") return "1 " + parseTimeunit(timeunit);
    return intervalValue + " " + parseTimeunit(timeunit);
  }

  render() {
    const {
      onChangeStep,
      intervalType,
      intervalValue,
      timestamp,
      timezone,
      timeunit,
      selectedDimensionField,
      selectedMetrics,
    } = this.props;
    const {
      from,
      size,
      sortDirection,
      sortField,
      metricsShown,
      dimensionFrom,
      dimensionSize,
      dimensionSortDirection,
      dimensionSortField,
      dimensionsShown,
    } = this.state;
    const page = Math.floor(from / size);
    const dimensionPage = Math.floor(dimensionFrom / dimensionSize);
    const pagination: Pagination = {
      pageIndex: page,
      pageSize: size,
      pageSizeOptions: DEFAULT_PAGE_SIZE_OPTIONS,
      totalItemCount: selectedMetrics.length,
    };
    const sorting: EuiTableSortingType<MetricItem> = {
      sort: {
        direction: sortDirection,
        field: sortField,
      },
    };
    const dimensionPagination: Pagination = {
      pageIndex: dimensionPage,
      pageSize: dimensionSize,
      pageSizeOptions: DEFAULT_PAGE_SIZE_OPTIONS,
      totalItemCount: selectedDimensionField.length,
    };

    const dimensionSorting: EuiTableSortingType<DimensionItem> = {
      sort: {
        direction: dimensionSortDirection,
        field: dimensionSortField,
      },
    };

    return (
      <ContentPanel
        actions={
          <ModalConsumer>
            {() => (
              <ContentPanelActions
                actions={[
                  {
                    text: "Edit",
                    buttonProps: {
                      onClick: () => onChangeStep(2),
                    },
                  },
                ]}
              />
            )}
          </ModalConsumer>
        }
        bodyStyles={{ padding: "initial" }}
        title={AGGREGATION_AND_METRIC_SETTINGS}
        titleSize="s"
      >
        <div style={{ padding: "15px" }}>
          <EuiSpacer size="xs" />
          <EuiText size="s">
            <h3>Time aggregation</h3>
          </EuiText>
          <EuiSpacer size="s" />
          <EuiFlexGrid columns={3}>
            <EuiFlexItem>
              <EuiText size="xs">
                <dt>Timestamp field</dt>
                <dd>{timestamp.length ? timestamp[0].label : ""}</dd>
              </EuiText>
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiText size="xs">
                <dt>Interval</dt>
                <dd>{this.parseInterval(intervalType, intervalValue, timeunit)}</dd>
              </EuiText>
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiText size="xs">
                <dt>Timezone</dt>
                <dd>{timezone}</dd>
              </EuiText>
            </EuiFlexItem>
          </EuiFlexGrid>
          <EuiSpacer size="m" />
          <EuiFlexGroup gutterSize="xs">
            <EuiFlexItem grow={false}>
              <EuiText size="s">
                <h3>Additional aggregations {`(${selectedDimensionField.length})`}</h3>
              </EuiText>
            </EuiFlexItem>
          </EuiFlexGroup>

          {sequenceTableComponents(
            selectedDimensionField,
            dimensionsShown,
            aggregationColumns,
            dimensionPagination,
            dimensionSorting,
            this.onDimensionTableChange
          )}

          <EuiSpacer size="s" />

          {additionalMetricsComponent(selectedMetrics)}

          {sourceFieldComponents(selectedMetrics, this.parseMetric(metricsShown), metricsColumns, pagination, sorting, this.onTableChange)}

          <EuiSpacer size="s" />
        </div>
      </ContentPanel>
    );
  }
}
