/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { EuiHealth, EuiTableFieldDataColumnType } from "@elastic/eui";
import IndexDetail, { IndexDetailModalProps } from "../containers/IndexDetail";
import { IndicesActionsProps } from "../containers/IndicesActions";
import { ManagedCatIndex } from "../../../../server/models/interfaces";
import { SortDirection } from "../../../utils/constants";

export const DEFAULT_PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

export const DEFAULT_QUERY_PARAMS = {
  from: 0,
  size: 20,
  search: "",
  sortField: "name",
  sortDirection: SortDirection.DESC,
  showDataStreams: false,
};

const HEALTH_TO_COLOR: {
  [health: string]: string;
  green: string;
  yellow: string;
  red: string;
} = {
  green: "success",
  yellow: "warning",
  red: "danger",
};

interface IColumnOptions extends Omit<IndicesActionsProps, "selectedItems">, Pick<IndexDetailModalProps, "onUpdateIndex"> {}

const getColumns = (props: IColumnOptions): EuiTableFieldDataColumnType<ManagedCatIndex>[] => {
  return [
    {
      field: "index",
      name: "Index",
      sortable: true,
      truncateText: false,
      textOnly: true,
      width: "250px",
      render: (index: string, record) => {
        return <IndexDetail {...props} record={record} index={index} />;
      },
    },
    {
      field: "health",
      name: "Health",
      sortable: true,
      truncateText: true,
      textOnly: true,
      align: "right",
      render: (health: string, item: ManagedCatIndex) => {
        const color = health ? HEALTH_TO_COLOR[health] : "subdued";
        const text = health || item.status;
        return <EuiHealth color={color}>{text}</EuiHealth>;
      },
    },
    {
      field: "data_stream",
      name: "Data stream",
      sortable: true,
      truncateText: true,
      textOnly: true,
      align: "right",
      width: "120px",
      render: (data_stream) => data_stream || "-",
    },
    {
      field: "managed",
      name: "Managed by Policy",
      sortable: false,
      truncateText: true,
      textOnly: true,
      align: "right",
      width: "140px",
    },
    {
      field: "status",
      name: "Status",
      truncateText: true,
      textOnly: true,
      align: "right",
      render: (status: string, item: ManagedCatIndex) => {
        return item.extraStatus || status;
      },
    },
    {
      field: "store.size",
      name: "Total size",
      sortable: true,
      truncateText: true,
      textOnly: true,
      dataType: "number",
    },
    {
      field: "pri.store.size",
      name: "Primaries size",
      sortable: true,
      truncateText: true,
      textOnly: true,
      dataType: "number",
    },
    {
      field: "docs.count",
      name: "Total documents",
      sortable: true,
      truncateText: true,
      textOnly: true,
      dataType: "number",
      render: (count: string) => <span title={count}>{count}</span>,
    },
    {
      field: "docs.deleted",
      name: "Deleted documents",
      sortable: true,
      truncateText: true,
      textOnly: true,
      dataType: "number",
      render: (deleted: string) => <span title={deleted}>{deleted}</span>,
    },
    {
      field: "pri",
      name: "Primaries",
      sortable: true,
      truncateText: true,
      textOnly: true,
      dataType: "number",
    },
    {
      field: "rep",
      name: "Replicas",
      sortable: true,
      truncateText: true,
      textOnly: true,
      dataType: "number",
    },
  ];
};

export const indicesColumns = (
  isDataStreamColumnVisible: boolean,
  options: IColumnOptions
): EuiTableFieldDataColumnType<ManagedCatIndex>[] => {
  return isDataStreamColumnVisible ? getColumns(options) : getColumns(options).filter((col) => col["field"] !== "data_stream");
};

export const DEFAULT_QUERY = JSON.stringify(
  {
    query: {
      match_all: {},
    },
  },
  null,
  4
);

export const REINDEX_ERROR_PROMPT = {
  DEST_REQUIRED: "Destination is required.",
  DEST_DIFF_WITH_SOURCE: "Destination must be different with source",
  SLICES_FORMAT_ERROR: "Slices must be positive integer or auto",
};
