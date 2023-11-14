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

export const DEFAULT_INDEX_SETTINGS = {
  "index.number_of_shards": 1,
  "index.number_of_replicas": 1,
};

export const INDEX_BLOCKS_WRITE_SETTING = "index.blocks.write";
export const INDEX_BLOCKS_READONLY_SETTING = "index.blocks.read_only";
export const INDEX_ROUTING_ALLOCATION_SETTING = "index.routing.allocation.require";
