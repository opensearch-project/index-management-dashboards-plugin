/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect, forwardRef, useImperativeHandle, useRef } from "react";
import { EuiCodeEditor, EuiCodeEditorProps, EuiCompressedFormRow } from "@elastic/eui";

export interface JSONEditorProps extends Partial<EuiCodeEditorProps> {
  disabled?: boolean;
  value: string;
  onChange?: (value: JSONEditorProps["value"]) => void;
}

export interface IJSONEditorRef {
  validate: () => Promise<string>;
  getValue: () => string;
  setValue: (val: string) => void;
}

const JSONEditor = forwardRef(({ value, onChange, disabled, ...others }: JSONEditorProps, ref: React.Ref<IJSONEditorRef>) => {
  const [tempEditorValue, setTempEditorValue] = useState(value);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const valueRef = useRef(tempEditorValue);
  valueRef.current = tempEditorValue;

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
    getValue: () => valueRef.current,
    setValue: (val) => setTempEditorValue(val),
  }));

  return (
    <>
      <textarea
        readOnly
        style={{ display: "none" }}
        value={tempEditorValue}
        data-test-subj={`${others["data-test-subj"] || "jsonEditor"}-valueDisplay`}
      />
      <EuiCodeEditor
        readOnly={disabled}
        {...others}
        style={{
          ...others.style,
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
        <EuiCompressedFormRow
          fullWidth
          isInvalid={confirmModalVisible}
          error="Your input does not match the validation of json format, please fix the error line with error aside."
        >
          <></>
        </EuiCompressedFormRow>
      )}
    </>
  );
});

export default JSONEditor;
