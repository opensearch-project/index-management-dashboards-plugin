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

import React, { forwardRef, useState, useEffect, useImperativeHandle, useRef } from "react";
import { EuiFormRow } from "@elastic/eui";
import type { MonacoDiffEditorProps } from "react-monaco-editor";
import { IJSONEditorRef } from "../JSONEditor";
import CustomFormRow from "../CustomFormRow";

export interface JSONDiffEditorProps extends Partial<MonacoDiffEditorProps> {
  value: string;
  onChange?: (value: JSONDiffEditorProps["value"]) => void;
  "data-test-subj"?: string;
  disabled?: boolean;
}

const JSONDiffEditor = forwardRef(({ value, onChange, ...others }: JSONDiffEditorProps, ref: React.Ref<IJSONEditorRef>) => {
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [editorValue, setEditorValue] = useState(value);
  const valueRef = useRef(editorValue);
  valueRef.current = editorValue;

  useEffect(() => {
    setEditorValue(value);
  }, [value]);

  useImperativeHandle(ref, () => ({
    validate: () =>
      new Promise((resolve, reject) => {
        try {
          JSON.parse(valueRef.current || "{}");
          resolve("");
        } catch (e) {
          setConfirmModalVisible(true);
          reject("Format validate error");
        }
      }),
    getValue: () => valueRef.current,
    setValue: (val: string) => setEditorValue(val),
  }));

  return (
    <div>
      <textarea
        style={{ display: "none" }}
        value={editorValue}
        onChange={(e) => {
          setEditorValue(e.target.value);
        }}
        onBlur={(e) => {
          try {
            JSON.parse(e.target.value);
            if (onChange) onChange(e.target.value);
          } catch (err) {
            // do nothing
            setConfirmModalVisible(true);
          }
        }}
        title={`editor-is-ready-true`}
        data-test-subj={`${others["data-test-subj"] || "jsonEditor"}-valueDisplay`}
      />
      <div style={{ display: "flex", marginBottom: 12 }}>
        <div style={{ flexGrow: 1 }}>
          <CustomFormRow label="Original" helpText="The original value">
            <></>
          </CustomFormRow>
        </div>
        <div style={{ flexGrow: 1 }}>
          <CustomFormRow label="Modified" helpText="The value you modified">
            <></>
          </CustomFormRow>
        </div>
      </div>
      {confirmModalVisible && (
        <EuiFormRow
          fullWidth
          isInvalid={confirmModalVisible}
          error="Your input does not match the validation of json format, please fix the error line with error aside."
        >
          <></>
        </EuiFormRow>
      )}
    </div>
  );
});

export default JSONDiffEditor;
