/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { forwardRef, useState, useEffect, useImperativeHandle } from "react";
import { EuiConfirmModal } from "@elastic/eui";
import type { MonacoDiffEditorProps } from "react-monaco-editor";
import { IJSONEditorRef } from "../JSONEditor";

export interface JSONDiffEditorProps extends Partial<MonacoDiffEditorProps> {
  value: string;
  onChange?: (value: JSONDiffEditorProps["value"]) => void;
  "data-test-subj"?: string;
  disabled?: boolean;
}

const JSONDiffEditor = forwardRef(({ value, onChange, ...others }: JSONDiffEditorProps, ref: React.Ref<IJSONEditorRef>) => {
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [editorValue, setEditorValue] = useState(value);

  useEffect(() => {
    setEditorValue(value);
  }, [value]);

  useImperativeHandle(ref, () => ({
    validate: () =>
      new Promise((resolve, reject) => {
        try {
          JSON.parse(editorValue || "{}");
          resolve("");
        } catch (e) {
          setConfirmModalVisible(true);
          reject("Format validate error");
        }
      }),
  }));

  return (
    <div>
      <textarea
        style={{ display: "none" }}
        onChange={(e) => {
          try {
            JSON.parse(e.target.value);
            onChange && onChange(e.target.value);
          } catch (e) {
            // do nothing
          }
        }}
        title={`editor-is-ready-true`}
        data-test-subj={`${others["data-test-subj"] || "json-editor"}-value-display`}
      />
      {confirmModalVisible ? (
        <EuiConfirmModal
          title="Format validate error"
          onCancel={() => {
            setConfirmModalVisible(false);
          }}
          onConfirm={() => {
            onChange && onChange(value);
            setEditorValue(value);
            setConfirmModalVisible(false);
          }}
          cancelButtonText="Close to modify"
          confirmButtonText="Continue with data reset"
        >
          Your input does not match the validation of json format, please modify the error line with error aside
        </EuiConfirmModal>
      ) : null}
    </div>
  );
});

export default JSONDiffEditor;
