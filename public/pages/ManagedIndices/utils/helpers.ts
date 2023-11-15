/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import queryString from "query-string";
import { DEFAULT_QUERY_PARAMS } from "./constants";
import { ManagedIndicesQueryParams } from "../models/interfaces";

export function getURLQueryParams(location: { search: string }): ManagedIndicesQueryParams {
  const { from, size, search, sortField, sortDirection, showDataStreams } = queryString.parse(location.search);

  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return <ManagedIndicesQueryParams>{
    // @ts-ignore
    from: isNaN(parseInt(from, 10)) ? DEFAULT_QUERY_PARAMS.from : parseInt(from, 10),
    // @ts-ignore
    size: isNaN(parseInt(size, 10)) ? DEFAULT_QUERY_PARAMS.size : parseInt(size, 10),
    search: typeof search !== "string" ? DEFAULT_QUERY_PARAMS.search : search,
    sortField: typeof sortField !== "string" ? DEFAULT_QUERY_PARAMS.sortField : sortField,
    sortDirection: typeof sortDirection !== "string" ? DEFAULT_QUERY_PARAMS.sortDirection : sortDirection,
    showDataStreams: showDataStreams === undefined ? DEFAULT_QUERY_PARAMS.showDataStreams : "true" === showDataStreams,
  };
}
