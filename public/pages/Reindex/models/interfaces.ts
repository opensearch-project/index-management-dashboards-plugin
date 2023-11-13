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
