/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { forwardRef, useState, useEffect, useRef, useImperativeHandle } from "react";
import { EuiConfirmModal } from "@elastic/eui";
import { MonacoDiffEditor } from "react-monaco-editor";
import type { monaco } from "@osd/monaco";
import CustomFormRow from "../CustomFormRow";
import { IJSONEditorRef } from "../JSONEditor";
import { JSONDiffEditorProps } from "./interface";

const JSONDiffEditor = forwardRef(({ value, onChange, ...others }: JSONDiffEditorProps, ref: React.Ref<IJSONEditorRef>) => {
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [editorValue, setEditorValue] = useState(value);
  const focusedRef = useRef(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const editorRef = useRef<monaco.editor.IStandaloneDiffEditor | null>(null);
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
    setEditorValue(value);
    if (isReady) {
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

  useImperativeHandle(ref, () => ({
    validate: () =>
      new Promise((resolve, reject) => {
        try {
          JSON.parse(editorRef.current?.getModifiedEditor().getValue() || "{}");
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
      <MonacoDiffEditor
        {...others}
        onChange={(val) => setEditorValue(val)}
        theme="euiColors"
        language="xjson"
        value={editorValue}
        options={{
          readOnly: others.disabled,
        }}
        editorDidMount={(editor) => {
          editorRef.current = editor;
          setIsReady(true);
        }}
        height="600px"
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
