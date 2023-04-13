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
