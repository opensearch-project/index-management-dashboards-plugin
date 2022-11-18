/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import { EuiConfirmModal } from "@elastic/eui";
import { DiffEditorProps } from "@monaco-editor/react";
import * as monacoEditor from "monaco-editor/esm/vs/editor/editor.api";
import { MonacoEditorDiffReact } from "../MonacoEditor";

export interface JSONDiffEditorProps extends Partial<DiffEditorProps> {
  value: string;
  onChange?: (value: JSONDiffEditorProps["value"]) => void;
  "data-test-subj"?: string;
  disabled?: boolean;
}

const JSONDiffEditor: React.SFC<JSONDiffEditorProps> = ({ value, onChange, ...others }) => {
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const focusedRef = useRef(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const editorRef = useRef<monacoEditor.editor.IStandaloneDiffEditor | null>(null);
  const setValue = useCallback(
    (val) => {
      editorRef.current?.getModifiedEditor().setValue(val);
    },
    [editorRef.current]
  );
  const onClickOutsideHandler = useRef(() => {
    if (focusedRef.current) {
      if (others.disabled) {
        return;
      }
      try {
        const value = editorRef.current?.getModifiedEditor().getValue();
        if (!value) {
          throw new Error("Value can not be empty");
        }
        JSON.parse(value);
        onChange && onChange(value);
      } catch (e) {
        setConfirmModalVisible(true);
      }
    }
    focusedRef.current = false;
  });
  const onClickContainer = useRef((e: MouseEvent) => {
    focusedRef.current = true;
    e.stopPropagation();
  });

  useEffect(() => {
    if (isReady) {
      setValue(value);
      inputRef.current?.setAttribute("value", value);
      if (inputRef.current) {
        inputRef.current.value = value;
      }
    }
  }, [value, isReady]);

  useEffect(() => {
    document.body.addEventListener("click", onClickOutsideHandler.current);
    editorRef.current?.getDomNode().addEventListener("click", onClickContainer.current);
    editorRef.current?.getModifiedEditor().getDomNode()?.setAttribute("data-test-subj", "codeEditorContainer");
    return () => {
      document.body.removeEventListener("click", onClickOutsideHandler.current);
      editorRef.current?.getDomNode().addEventListener("click", onClickContainer.current);
    };
  }, [isReady]);

  return (
    <div style={{ height: "600px" }}>
      <textarea
        style={{ display: "none" }}
        ref={inputRef}
        onChange={(e) => {
          try {
            JSON.parse(e.target.value);
            onChange && onChange(e.target.value);
          } catch (e) {
            // do nothing
          }
        }}
        title={`editor-is-ready-${isReady}`}
        data-test-subj={`${others["data-test-subj"] || "json-editor"}-value-display`}
      />
      <MonacoEditorDiffReact
        {...others}
        language="json"
        modified={value}
        options={{
          readOnly: others.disabled,
        }}
        editorDidMount={(a, b, editor) => {
          editorRef.current = editor;
          setIsReady(true);
        }}
      />
      {confirmModalVisible ? (
        <EuiConfirmModal
          title="Format validate error"
          onCancel={() => {
            setConfirmModalVisible(false);
            setTimeout(() => {
              onClickContainer.current(new MouseEvent("click"));
              editorRef.current?.getModifiedEditor().focus();
            }, 0);
          }}
          onConfirm={() => {
            onChange && onChange(value);
            setValue(value);
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
};

export default JSONDiffEditor;
