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

import { RouteComponentProps } from "react-router-dom";
import { FieldInstance } from "../../lib/field";
import { IComposableTemplate } from "../../../models/interfaces";
import { IndicesUpdateMode } from "../../utils/constants";

export interface TemplateDetailProps {
  templateName?: string;
  onCancel?: () => void;
  onSubmitSuccess?: (templateName: string) => void;
  readonly?: boolean;
  history: RouteComponentProps["history"];
}

export interface SubDetailProps extends TemplateDetailProps {
  field: FieldInstance;
  isEdit: boolean;
  noPanel?: boolean;
}

export interface ComponentTemplateEdit extends IComposableTemplate {
  name: string;
  includes?: {
    [IndicesUpdateMode.alias]?: boolean;
    [IndicesUpdateMode.mappings]?: boolean;
    [IndicesUpdateMode.settings]?: boolean;
  };
}
