/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export const DEFAULT_SLICE = "1";

export const DEFAULT_QUERY = JSON.stringify({ query: { match_all: {} } }, null, 2);

export const REINDEX_ERROR_PROMPT = {
  DEST_REQUIRED: "Destination is required.",
  DEST_HEALTH_RED: "Destination health status is red.",
  SLICES_FORMAT_ERROR: "Slices must be positive integer or auto",
};
