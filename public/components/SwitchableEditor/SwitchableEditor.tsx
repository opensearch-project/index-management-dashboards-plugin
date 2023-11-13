/*
 *   Copyright OpenSearch Contributors
 *
 *   Licensed under the Apache License, Version 2.0 (the "License").
 *   You may not use this file except in compliance with the License.
 *   A copy of the License is located at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   or in the "license" file accompanying this file. This file is distributed
 *   on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 *   express or implied. See the License for the specific language governing
 *   permissions and limitations under the License.
 */

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

export type ISwitchableEditorRef = IJSONEditorRef;

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
