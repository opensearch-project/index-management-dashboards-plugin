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
import { MappingsProperties, MappingsPropertiesObject } from "../../../models/interfaces";

export interface IndexMappingsAll {
  properties?: MappingsProperties;
  [key: string]: any;
}

export interface IndexMappingsObjectAll {
  properties?: MappingsPropertiesObject;
  [key: string]: any;
}

export interface IndexMappingProps {
  value?: IndexMappingsAll;
  oldValue?: IndexMappingsAll;
  originalValue?: IndexMappingsAll;
  onChange: (value: IndexMappingProps["value"]) => void;
  isEdit?: boolean;
  oldMappingsEditable?: boolean; // in template edit case, existing mappings is editable
  readonly?: boolean;
  docVersion: string;
}

export enum EDITOR_MODE {
  JSON = "JSON",
  VISUAL = "VISUAL",
}

export interface IIndexMappingsRef {
  validate: () => Promise<string>;
  getJSONEditorValue: () => string;
}
