import type { MonacoDiffEditorProps } from "react-monaco-editor";
import { JSONEditorProps } from "../JSONEditor";
import { DiagnosticsOptions } from "../MonacoJSONEditor";

export interface JSONDiffEditorProps extends JSONEditorProps, Pick<MonacoDiffEditorProps, "original"> {
  diagnosticsOptions?: DiagnosticsOptions;
  value: string;
  onChange?: (value: JSONDiffEditorProps["value"]) => void;
  "data-test-subj"?: string;
  disabled?: boolean;
}
