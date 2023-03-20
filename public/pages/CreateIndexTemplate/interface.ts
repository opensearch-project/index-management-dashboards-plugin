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
