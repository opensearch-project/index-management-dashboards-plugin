/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiSpacer, EuiSwitch } from "@elastic/eui";
import React, { forwardRef, useRef, useState, useImperativeHandle } from "react";
import JSONEditor, { IJSONEditorRef } from "../JSONEditor";
import MonacoJSONEditor, { MonacoJSONEditorProps } from "../MonacoJSONEditor";
import JSONDiffEditor, { JSONDiffEditorProps } from "../JSONDiffEditor";
import "./SwitchableEditor.scss";

export interface SwitchableEditorProps extends JSONDiffEditorProps, Pick<MonacoJSONEditorProps, "diagnosticsOptions" | "path"> {
  mode: "json" | "diff";
}

export interface ISwitchableEditorRef extends IJSONEditorRef {}

const SwitchableEditor = forwardRef(
  ({ mode, diagnosticsOptions, path, ...others }: SwitchableEditorProps, ref: React.Ref<ISwitchableEditorRef>) => {
    const [checked, setChecked] = useState(false);
    const editorRef = useRef<IJSONEditorRef>(null);
    useImperativeHandle(ref, () => ({
      getValue: () => editorRef.current?.getValue() || "",
      setValue: (...args) => editorRef.current?.setValue(...args),
      validate: () => editorRef.current?.validate() || Promise.resolve("Not ready"),
    }));
    return (
      <>
        {mode === "diff" ? (
          <>
            <EuiSpacer />
            <EuiSwitch
              label="Compare previously saved settings"
              checked={checked}
              onChange={async (e) => {
                const targetChecked = e.target.checked;
                const validateResult = await editorRef.current?.validate();
                if (!validateResult) {
                  setChecked(targetChecked);
                }
              }}
            />
            <EuiSpacer />
          </>
        ) : null}
        {checked ? (
          diagnosticsOptions ? (
            <MonacoJSONEditor path={path} {...others} ref={ref} />
          ) : (
            <JSONDiffEditor {...others} ref={editorRef} />
          )
        ) : (
          <JSONEditor {...others} ref={editorRef} />
        )}
      </>
    );
  }
);

export default SwitchableEditor;
