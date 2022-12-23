/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export const DATA_STREAM_REGEX = /^.ds-(.*)-\d{6}$/;

export const DEFAULT_QUERY = JSON.stringify({ query: { match_all: {} } }, null, 2);

export const REINDEX_ERROR_PROMPT = {
  DEST_REQUIRED: "Destination is required.",
  SOURCE_REQUIRED: "Source is required.",
  HEALTH_RED: "health status is red.",
  SLICES_FORMAT_ERROR: "Must be an integer greater or equal to 2.",
};
