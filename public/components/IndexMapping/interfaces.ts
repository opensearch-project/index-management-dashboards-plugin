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
