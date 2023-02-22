/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
export interface IAlias {
  alias: string;
  index: string;
  filter: string;
  "routing.index": string;
  "routing.search": string;
  is_write_index: string;
  indexArray: string[];
}
