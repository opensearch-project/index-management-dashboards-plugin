/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { OuiDataGridColumn } from "@opensearch-project/oui";
import IndexDetail, { IndexDetailModalProps } from "../containers/IndexDetail";
import { ManagedCatIndex } from "../../../../server/models/interfaces";
import { ROUTES, SortDirection } from "../../../utils/constants";

export const renderNumber = (value) => {
  return value || "-";
};

export const DEFAULT_PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

export const DEFAULT_QUERY_PARAMS = {
  from: 0,
  size: 20,
  search: "",
  sortField: "name",
  sortDirection: SortDirection.DESC,
  showDataStreams: false,
};

export const HEALTH_TO_COLOR: {
  [health: string]: string;
  green: string;
  yellow: string;
  red: string;
} = {
  green: "success",
  yellow: "warning",
  red: "danger",
};

interface IColumnOptions extends Omit<IndexDetailModalProps, "index"> {}

const getColumns = (props: IColumnOptions): OuiDataGridColumn[] => {
  return [
    {
      id: "index",
      displayAsText: "Index",
      isSortable: true,
      initialWidth: 320,
    },
    {
      id: "health",
      displayAsText: "Health",
      isSortable: true,
    },
    {
      id: "data_stream",
      displayAsText: "Data stream",
      isSortable: true,
      initialWidth: 120,
    },
    {
      id: "managed",
      displayAsText: "Managed by policy",
      isSortable: false,
    },
    {
      id: "status",
      displayAsText: "Status",
      isSortable: true,
    },
    {
      id: "store.size",
      displayAsText: "Total size",
      isSortable: true,
      schema: "numeric",
    },
    {
      id: "pri.store.size",
      displayAsText: "Size of primaries",
      isSortable: true,
      schema: "numeric",
    },
    {
      id: "docs.count",
      displayAsText: "Total documents",
      isSortable: true,
      schema: "numeric",
    },
    {
      id: "docs.deleted",
      displayAsText: "Deleted documents",
      isSortable: true,
      schema: "numeric",
    },
    {
      id: "pri",
      displayAsText: "Primaries",
      isSortable: true,
      schema: "numeric",
    },
    {
      id: "rep",
      displayAsText: "Replicas",
      isSortable: true,
      schema: "numeric",
    },
  ];
};

export const indicesColumns = (isDataStreamColumnVisible: boolean, options: IColumnOptions): OuiDataGridColumn[] => {
  let columns = getColumns(options);

  if (!isDataStreamColumnVisible) {
    columns = columns.filter((column) => column.id !== "data_stream");
  }

  return columns;
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
