/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { Conflicts } from "elasticsearch";

export interface ReindexRequest {
  waitForCompletion: boolean;
  slices?: number | string;
  maxDocs?: number;
  body: {
    conflicts?: Conflicts;
    source: {
      index: string;
      [key: string]: any;
    };
    dest: {
      index: string;
      pipeline?: string;
      op_type?: string;
    };
  };
  script?: {
    source: string;
    lang: string;
  };
}
export interface ReindexResponse {
  task: string;
}

export interface IndexSelectItem {
  status?: string;
  health?: string;
  isIndex?: boolean;
  isDataStream?: boolean;
  isAlias?: boolean;
  indices?: string[];
  writingIndex?: string;
}
