import { monaco } from "@osd/monaco";
import { JSONSchema4 } from "@types/json-schema";
import { JSONEditorProps } from "../JSONEditor";

export type DiagnosticsOptions = Omit<monaco.languages.json.DiagnosticsOptions, "schemas"> & {
  schemas?: (Omit<Required<monaco.languages.json.DiagnosticsOptions>["schemas"][number], "schema"> & {
    schema?: JSONSchema4;
  })[];
};

export interface MonacoJSONEditorProps extends JSONEditorProps {
  diagnosticsOptions?: DiagnosticsOptions;
  value: string;
  onChange?: (value: MonacoJSONEditorProps["value"]) => void;
  "data-test-subj"?: string;
  disabled?: boolean;
  path?: string;
}
