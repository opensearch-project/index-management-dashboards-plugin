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
import React, { forwardRef, useState, useEffect, useRef, useImperativeHandle, useCallback } from "react";
import { EuiFormRow } from "@elastic/eui";
import { MonacoDiffEditor } from "react-monaco-editor";
import { monaco } from "@osd/monaco";
import CustomFormRow from "../CustomFormRow";
import { IJSONEditorRef } from "../JSONEditor";
import { JSONDiffEditorProps } from "./interface";
import "./JSONDiffEditor.scss";

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
        const v = editorRef.current?.getModifiedEditor().getValue();
        if (!v) {
          throw new Error("Value cannot be empty");
        }
        JSON.parse(v);
        if (onChange) onChange(v);
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
  const setAllValue = useCallback(
    (val: string) => {
      setEditorValue(val);
      if (isReady) {
        inputRef.current?.setAttribute("value", val);
        if (inputRef.current) {
          inputRef.current.value = val;
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setEditorValue, isReady, inputRef.current]
  );
  const valueRef = useRef(editorValue);
  valueRef.current = editorValue;

  useEffect(() => {
    setAllValue(value);
  }, [value, setAllValue]);

  useEffect(() => {
    document.body.addEventListener("click", onClickOutsideHandler.current);
    editorRef.current?.getDomNode().addEventListener("click", onClickContainer.current);
    editorRef.current?.getModifiedEditor().getDomNode()?.setAttribute("data-test-subj", "codeEditorContainer");
    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      document.body.removeEventListener("click", onClickOutsideHandler.current);
      // eslint-disable-next-line react-hooks/exhaustive-deps
      editorRef.current?.getDomNode().removeEventListener("click", onClickContainer.current);
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
    getValue: () => valueRef.current,
    setValue: (val: string) => setAllValue(val),
  }));

  return (
    <>
      <textarea
        style={{ display: "none" }}
        ref={inputRef}
        onChange={(e) => {
          try {
            JSON.parse(e.target.value);
            if (onChange) onChange(e.target.value);
          } catch (err) {
            // do nothing
          }
        }}
        title={`editor-is-ready-${isReady}`}
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
      <div
        style={{
          height: others?.height || undefined,
        }}
        className={confirmModalVisible ? "json-diff-editor-validate-error" : ""}
      >
        <MonacoDiffEditor
          height="600px"
          {...others}
          onChange={(val) => setEditorValue(val)}
          theme="euiColors"
          language="json"
          value={editorValue}
          options={{
            readOnly: others.disabled,
          }}
          editorDidMount={(editor) => {
            editorRef.current = editor;
            setIsReady(true);
          }}
        />
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
    </>
  );
});

export default JSONDiffEditor;
