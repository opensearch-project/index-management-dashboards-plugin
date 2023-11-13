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

import { monaco } from "@osd/monaco";
import { JSONSchema4 } from "@types/json-schema";
import { JSONEditorProps } from "../JSONEditor";

export type DiagnosticsOptions = Omit<monaco.languages.json.DiagnosticsOptions, "schemas"> & {
  schemas?: Array<
    Omit<Required<monaco.languages.json.DiagnosticsOptions>["schemas"][number], "schema"> & {
      schema?: JSONSchema4;
    }
  >;
};

export interface MonacoJSONEditorProps extends JSONEditorProps {
  diagnosticsOptions?: DiagnosticsOptions;
  value: string;
  onChange?: (value: MonacoJSONEditorProps["value"]) => void;
  "data-test-subj"?: string;
  disabled?: boolean;
  path?: string;
}
