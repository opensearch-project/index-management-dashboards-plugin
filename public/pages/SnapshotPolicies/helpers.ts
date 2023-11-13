/*
 *   Copyright OpenSearch Contributors
 *
 *   Licensed under the Apache License, Version 2.0 (the "License").
 *   You may not use this file except in compliance with the License.
 *   A copy of the License is located at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   or in the "license" file accompanying this file. This file is distributed
 *   on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 *   express or implied. See the License for the specific language governing
 *   permissions and limitations under the License.
 */

/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import queryString from "query-string";
import moment from "moment";
import { SMPoliciesQueryParams } from "../../models/interfaces";
import { DEFAULT_QUERY_PARAMS, PROMPT_TEXT } from "./constants";

export function getSMPoliciesQueryParamsFromURL(location: { search: string }): SMPoliciesQueryParams {
  const { from, size, sortField, sortOrder, search } = queryString.parse(location.search);
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return <SMPoliciesQueryParams>{
    // @ts-ignore
    from: isNaN(parseInt(from, 10)) ? DEFAULT_QUERY_PARAMS.from : parseInt(from, 10),
    // @ts-ignore
    size: isNaN(parseInt(size, 10)) ? DEFAULT_QUERY_PARAMS.size : parseInt(size, 10),
    search: typeof search !== "string" ? DEFAULT_QUERY_PARAMS.search : search,
    sortField: typeof sortField !== "string" ? "name" : sortField,
    sortOrder: typeof sortOrder !== "string" ? DEFAULT_QUERY_PARAMS.sortOrder : sortOrder,
  };
}

export const getMessagePrompt = (loading: boolean) => {
  if (loading) return PROMPT_TEXT.LOADING;
  return PROMPT_TEXT.NO_POLICIES;
};

export const renderTimestampMillis = (time?: number): string => {
  if (time == null) return "-";
  const momentTime = moment(time).local();
  if (time && momentTime.isValid()) return momentTime.format("MM/DD/YY h:mm a");
  return "-";
};

export const renderTimestampSecond = (time: number): string => {
  const momentTime = moment.unix(time).local();
  if (time && momentTime.isValid()) return momentTime.format("MM/DD/YY h:mm a");
  return "-";
};
