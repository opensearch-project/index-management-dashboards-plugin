/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import type { MonacoDiffEditorProps } from "react-monaco-editor";
import { JSONEditorProps } from "../JSONEditor";

export interface JSONDiffEditorProps extends JSONEditorProps, Pick<MonacoDiffEditorProps, "original"> {
  value: string;
  onChange?: (value: JSONDiffEditorProps["value"]) => void;
  "data-test-subj"?: string;
  disabled?: boolean;
}
