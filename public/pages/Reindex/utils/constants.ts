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

export const DATA_STREAM_REGEX = /^.ds-(.*)-\d{6}$/;

export const DEFAULT_SLICE = "1";

export const DEFAULT_QUERY = JSON.stringify({ query: { match_all: {} } }, null, 2);

export const REINDEX_ERROR_PROMPT = {
  DEST_REQUIRED: "Destination is required.",
  SOURCE_REQUIRED: "Source is required.",
  HEALTH_RED: "health status is red.",
  SLICES_FORMAT_ERROR: "Must be an integer greater than or equal to 2.",
};
