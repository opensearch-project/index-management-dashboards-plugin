/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export const DEFAULT_INDEX_SETTINGS = {
  "index.number_of_shards": 1,
  "index.number_of_replicas": 1,
};

export const INDEX_BLOCKS_WRITE_SETTING = "index.blocks.write";
export const INDEX_BLOCKS_READONLY_SETTING = "index.blocks.read_only";
export const INDEX_ROUTING_ALLOCATION_SETTING = "index.routing.allocation.require";
