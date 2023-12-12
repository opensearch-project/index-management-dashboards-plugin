/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { EuiHealth, EuiLink, EuiTableFieldDataColumnType } from "@elastic/eui";
import IndexDetail, { IndexDetailModalProps } from "../containers/IndexDetail";
import { ManagedCatIndex } from "../../../../server/models/interfaces";
import { ROUTES, SortDirection } from "../../../utils/constants";

const renderNumber = (value) => {
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

const getColumns = (props: IColumnOptions): EuiTableFieldDataColumnType<ManagedCatIndex>[] => {
  return [
    {
      field: "index",
      name: "Index",
      sortable: true,
      truncateText: false,
      textOnly: true,
      width: "250px",
      render: (index: string) => {
        return <IndexDetail {...props} index={index} />;
      },
    },
    {
      field: "health",
      name: "Health",
      sortable: true,
      truncateText: true,
      textOnly: true,
      render: (health: string, item: ManagedCatIndex) => {
        const color = health ? HEALTH_TO_COLOR[health] : "subdued";
        const text = health || item.status;
        return (
          <EuiHealth color={color} className="indices-health">
            {text}
          </EuiHealth>
        );
      },
    },
    {
      field: "data_stream",
      name: "Data stream",
      sortable: true,
      truncateText: true,
      textOnly: true,
      width: "120px",
      render: (data_stream) => (data_stream ? <EuiLink href={`#${ROUTES.CREATE_DATA_STREAM}/${data_stream}`}>{data_stream}</EuiLink> : "-"),
    },
    {
      field: "managed",
      name: "Managed by policy",
      sortable: true,
      truncateText: true,
      textOnly: true,
      render: renderNumber,
    },
    {
      field: "status",
      name: "Status",
      sortable: true,
      truncateText: true,
      textOnly: true,
      render: (status: string, item: ManagedCatIndex) => {
        return <span className="camel-first-letter">{item.extraStatus || status}</span>;
      },
    },
    {
      field: "store.size",
      name: "Total size",
      sortable: true,
      truncateText: true,
      textOnly: true,
      dataType: "number",
      render: renderNumber,
    },
    {
      field: "pri.store.size",
      name: "Size of primaries",
      sortable: true,
      truncateText: true,
      textOnly: true,
      dataType: "number",
      render: renderNumber,
    },
    {
      field: "docs.count",
      name: "Total documents",
      sortable: true,
      truncateText: true,
      textOnly: true,
      dataType: "number",
      render: (count: string) => <span title={count}>{count || "-"}</span>,
    },
    {
      field: "docs.deleted",
      name: "Deleted documents",
      sortable: true,
      truncateText: true,
      textOnly: true,
      dataType: "number",
      render: (deleted: string) => <span title={deleted}>{deleted || "-"}</span>,
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
