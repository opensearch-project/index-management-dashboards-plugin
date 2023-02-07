import { RouteComponentProps } from "react-router-dom";
import { FieldInstance } from "../../lib/field";
import { DataStream } from "../../../server/models/interfaces";

export interface DataStreamDetailProps {
  templateName?: string;
  onCancel?: () => void;
  onSubmitSuccess?: (templateName: string) => void;
  readonly?: boolean;
  history: RouteComponentProps["history"];
}

export interface SubDetailProps extends DataStreamDetailProps {
  field: FieldInstance;
  isEdit: boolean;
}

export interface DataStreamInEdit extends DataStream {
  matchedTemplate?: string;
}
