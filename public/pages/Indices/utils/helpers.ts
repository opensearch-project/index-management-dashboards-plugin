/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import queryString from "query-string";
import { DEFAULT_QUERY_PARAMS } from "./constants";
import { IndicesQueryParams } from "../models/interfaces";

export function getURLQueryParams(location: { search: string }): IndicesQueryParams {
  const { from, size, search, sortField, sortDirection, showDataStreams } = queryString.parse(location.search);
  return <IndicesQueryParams>{
    // @ts-ignore
    from: isNaN(parseInt(from, 10)) ? DEFAULT_QUERY_PARAMS.from : parseInt(from, 10),
    // @ts-ignore
    size: isNaN(parseInt(size, 10)) ? DEFAULT_QUERY_PARAMS.size : parseInt(size, 10),
    search: typeof search !== "string" ? DEFAULT_QUERY_PARAMS.search : search,
    sortField: typeof sortField !== "string" ? "index" : sortField,
    sortDirection: typeof sortDirection !== "string" ? DEFAULT_QUERY_PARAMS.sortDirection : sortDirection,
    showDataStreams: showDataStreams === undefined ? DEFAULT_QUERY_PARAMS.showDataStreams : showDataStreams === "true",
  };
}
