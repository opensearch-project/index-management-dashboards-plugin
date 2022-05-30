/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import queryString from "query-string";
import { SnapshotsQueryParams } from "../models/interfaces";
import { DEFAULT_QUERY_PARAMS } from "../utils/constants";

export function getURLQueryParams(location: { search: string }): SnapshotsQueryParams {
  const { from, size, sortField, sortDirection, search } = queryString.parse(location.search);
  return <SnapshotsQueryParams>{
    // @ts-ignore
    from: isNaN(parseInt(from, 10)) ? DEFAULT_QUERY_PARAMS.from : parseInt(from, 10),
    // @ts-ignore
    size: isNaN(parseInt(size, 10)) ? DEFAULT_QUERY_PARAMS.size : parseInt(size, 10),
    search: typeof search !== "string" ? DEFAULT_QUERY_PARAMS.search : search,
    sortField: typeof sortField !== "string" ? "id" : sortField,
    sortDirection: typeof sortDirection !== "string" ? DEFAULT_QUERY_PARAMS.sortDirection : sortDirection,
  };
}
