import { FieldInstance } from "../../lib/field";

export interface SubDetailProps {
  field: FieldInstance;
  sourceType?: "dataStreams" | "alias" | undefined;
  writingIndex?: string;
}
