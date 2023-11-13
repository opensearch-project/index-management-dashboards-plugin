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
import { RouteComponentProps } from "react-router-dom";
import { FieldInstance } from "../../lib/field";
import { TemplateItem } from "../../../models/interfaces";

export interface TemplateDetailProps {
  templateName?: string;
  onCancel?: () => void;
  onSubmitSuccess?: (templateName: string) => void;
  readonly?: boolean;
  history: RouteComponentProps["history"];
}

export interface SubDetailProps {
  history: RouteComponentProps["history"];
  field: FieldInstance;
  isEdit: boolean;
  readonly?: boolean;
  withoutPanel?: boolean;
  columns?: 3 | 4;
}

export enum FLOW_ENUM {
  SIMPLE = "simple",
  COMPONENTS = "components",
}

export interface TemplateItemEdit extends TemplateItem {
  _meta?: {
    flow?: FLOW_ENUM;
    [prop: string]: any;
  };
}
