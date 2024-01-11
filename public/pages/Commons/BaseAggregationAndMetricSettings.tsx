/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Fragment } from "react";

import { EuiFlexItem, EuiText, EuiBasicTable, EuiTableFieldDataColumnType, EuiPanel, EuiFlexGroup, EuiIcon } from "@elastic/eui";

import { EuiBasicTableColumn, EuiTableSortingType } from "@opensearch-project/oui";
import { Criteria, CriteriaWithPagination } from "@opensearch-project/oui/src/eui_components/basic_table/basic_table";
import { Pagination } from "@opensearch-project/oui/src/eui_components/basic_table/pagination_bar";
import { DimensionItem, MetricItem } from "../../../models/interfaces";

export const AGGREGATION_AND_METRIC_SETTINGS = "Aggregation and metrics settings";

export interface BaseAggregationAndMetricsState {
  from: number;
  size: number;
  sortField: string;
  sortDirection: string;
  dimensionFrom: number;
  dimensionSize: number;
  dimensionSortField: string;
  dimensionSortDirection: string;
}

export const BaseAggregationColumns: Array<Readonly<EuiTableFieldDataColumnType<DimensionItem>>> = [
  {
    field: "sequence",
    name: "Sequence",
    sortable: true,
    align: "left",
    dataType: "number",
  },
  {
    field: "field.label",
    name: "Field name",
    align: "left",
  },
  {
    field: "aggregationMethod",
    name: "Aggregation method",
    align: "left",
  },
  {
    field: "interval",
    name: "Interval",
    dataType: "number",
    align: "left",
    render: (interval: null | number) => {
      if (interval == null) return "-";
      else return `${interval}`;
    },
  },
];

export const BaseMetricsColumns: Array<Readonly<EuiTableFieldDataColumnType<MetricItem>>> = [
  {
    field: "source_field",
    name: "Field Name",
  },
  {
    field: "min",
    name: "Min",
    align: "center",
    render: (min: boolean) => min && <EuiIcon type="check" />,
  },
  {
    field: "max",
    name: "Max",
    align: "center",
    render: (max: boolean) => max && <EuiIcon type="check" />,
  },
  {
    field: "sum",
    name: "Sum",
    align: "center",
    render: (sum: boolean) => sum && <EuiIcon type="check" />,
  },
  {
    field: "avg",
    name: "Avg",
    align: "center",
    render: (avg: boolean) => avg && <EuiIcon type="check" />,
  },
  {
    field: "value_count",
    name: "Value count",
    align: "center",
    render: (value_count: boolean) => value_count && <EuiIcon type="check" />,
  },
];

export function sequenceTableComponents(
  selectedDimensionField: string | any[],
  items: any[],
  columns: Array<Readonly<EuiTableFieldDataColumnType<DimensionItem>>> | Array<EuiBasicTableColumn<any>>,
  pagination: Pagination | undefined,
  sorting: EuiTableSortingType<DimensionItem> | undefined,
  onChange: ((criteria: Criteria<any>) => void) | ((criteria: CriteriaWithPagination<any>) => void) | undefined
) {
  if (selectedDimensionField.length === 0) {
    return (
      <EuiText>
        <dd>No fields added for aggregation</dd>
      </EuiText>
    );
  }

  return (
    <Fragment>
      <EuiPanel>
        <EuiBasicTable
          items={items}
          rowHeader="sequence"
          columns={columns}
          tableLayout="auto"
          noItemsMessage="No fields added for aggregations"
          pagination={pagination}
          sorting={sorting}
          onChange={onChange}
        />
      </EuiPanel>
    </Fragment>
  );
}

export function additionalMetricsComponent(selectedMetrics: string | any[]) {
  return (
    <EuiFlexGroup gutterSize="xs">
      <EuiFlexItem grow={false}>
        <EuiText>
          <h3>Additional metrics</h3>
        </EuiText>
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <EuiText color="subdued" textAlign="left">
          <h3>{`(${selectedMetrics.length})`}</h3>
        </EuiText>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
}

export function sourceFieldComponents(
  selectedMetrics: string | any[],
  items: any[],
  columns: Array<Readonly<EuiTableFieldDataColumnType<MetricItem>>> | Array<EuiBasicTableColumn<any>>,
  pagination: Pagination | undefined,
  sorting: EuiTableSortingType<MetricItem> | undefined,
  onChange: ((criteria: Criteria<any>) => void) | ((criteria: CriteriaWithPagination<any>) => void) | undefined
) {
  if (selectedMetrics.length === 0) {
    return (
      <EuiText>
        <dd>No fields added for metrics</dd>
      </EuiText>
    );
  }

  return (
    <Fragment>
      <EuiPanel>
        <EuiBasicTable
          items={items}
          rowHeader="source_field"
          columns={columns}
          tableLayout="auto"
          pagination={pagination}
          sorting={sorting}
          onChange={onChange}
          noItemsMessage="No fields added for metrics"
        />
      </EuiPanel>
    </Fragment>
  );
}
