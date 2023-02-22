/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import { RouteComponentProps } from "react-router-dom";
import { FieldInstance } from "../../lib/field";

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
}
