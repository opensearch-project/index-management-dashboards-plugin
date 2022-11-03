/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import Editor, { EditorProps, DiffEditorProps, DiffEditor } from "@monaco-editor/react";

export const MonacoEditorReact: React.SFC<EditorProps> = (props) => {
  return <Editor {...props} />;
};

export const MonacoEditorDiffReact: React.SFC<DiffEditorProps> = (props) => {
  return <DiffEditor {...props} />;
};
