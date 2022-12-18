/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { EuiCodeEditor, EuiCodeEditorProps, EuiFormRow } from "@elastic/eui";

export interface JSONEditorProps extends Partial<EuiCodeEditorProps> {
  disabled?: boolean;
  value: string;
  onChange?: (value: JSONEditorProps["value"]) => void;
}

export interface IJSONEditorRef {
  validate: () => Promise<string>;
}

const JSONEditor = forwardRef(({ value, onChange, disabled, ...others }: JSONEditorProps, ref: React.Ref<IJSONEditorRef>) => {
  const [tempEditorValue, setTempEditorValue] = useState(value);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);

  useEffect(() => {
    setTempEditorValue(value);
  }, [value]);

  useImperativeHandle(ref, () => ({
    validate: () =>
      new Promise((resolve, reject) => {
        try {
          JSON.parse(tempEditorValue);
          setConfirmModalVisible(false);
          resolve("");
        } catch (e) {
          setConfirmModalVisible(true);
          reject("Format validate error");
        }
      }),
  }));

  return (
    <>
      <textarea
        readOnly
        style={{ display: "none" }}
        value={tempEditorValue}
        data-test-subj={`${others["data-test-subj"] || "json-editor"}-value-display`}
      />
      <EuiCodeEditor
        readOnly={disabled}
        {...others}
        style={{
          border: confirmModalVisible ? "1px solid red" : undefined,
        }}
        mode="json"
        value={tempEditorValue}
        onChange={setTempEditorValue}
        onBlur={() => {
          if (others.readOnly) {
            return;
          }
          try {
            JSON.parse(tempEditorValue);
            onChange && onChange(tempEditorValue);
            setConfirmModalVisible(false);
          } catch (e) {
            setConfirmModalVisible(true);
          }
        }}
      />
      {confirmModalVisible && (
        <EuiFormRow
          fullWidth
          isInvalid={confirmModalVisible}
          error="Your input does not match the validation of json format, please fix the error line with error aside."
        >
          <></>
        </EuiFormRow>
      )}
    </>
  );
});

export default JSONEditor;
