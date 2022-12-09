/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { EuiCodeEditor, EuiConfirmModal, EuiCodeEditorProps } from "@elastic/eui";

export interface JSONEditorProps extends Partial<EuiCodeEditorProps> {
  value: string;
  onChange?: (value: JSONEditorProps["value"]) => void;
}

export interface IJSONEditorRef {
  validate: () => Promise<string>;
}

const JSONEditor = forwardRef(({ value, onChange, ...others }: JSONEditorProps, ref: React.Ref<IJSONEditorRef>) => {
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
        {...others}
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
          } catch (e) {
            setConfirmModalVisible(true);
          }
        }}
      />
      {confirmModalVisible ? (
        <EuiConfirmModal
          title="Format validate error"
          onCancel={() => setConfirmModalVisible(false)}
          onConfirm={() => {
            onChange && onChange(value);
            setTempEditorValue(value);
            setConfirmModalVisible(false);
          }}
          cancelButtonText="Close to modify"
          confirmButtonText="Continue with data reset"
        >
          Your input does not match the validation of json format, please modify the error line with error aside
        </EuiConfirmModal>
      ) : null}
    </>
  );
});

export default JSONEditor;
