/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { forwardRef, useState, useEffect, useRef, useImperativeHandle, useCallback } from "react";
import { EuiFormRow } from "@elastic/eui";
import MonacoEditor from "react-monaco-editor";
import { monaco } from "@osd/monaco";
import { IJSONEditorRef } from "../JSONEditor";
import { MonacoJSONEditorProps } from "./interface";
import { useDiagnosticsOptions, useModel } from "./hooks";
import "./MonacoJSONEditor.scss";

const MonacoJSONEditor = forwardRef(
  ({ value, onChange, diagnosticsOptions, path, ...others }: MonacoJSONEditorProps, ref: React.Ref<IJSONEditorRef>) => {
    const [confirmModalVisible, setConfirmModalVisible] = useState(false);
    const [isReady, setIsReady] = useState(false);
    const [editorValue, setEditorValue] = useState(value);
    const focusedRef = useRef(false);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | undefined>(undefined);
    useDiagnosticsOptions({
      monaco,
      diagnosticsOptions,
    });
    const onClickOutsideHandler = useRef(() => {
      if (focusedRef.current) {
        if (others.disabled) {
          return;
        }
        try {
          const value = editorRef.current?.getValue();
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
      [setEditorValue, isReady, inputRef.current]
    );
    const valueRef = useRef(editorValue);
    valueRef.current = editorValue;

    useEffect(() => {
      setAllValue(value);
    }, [value, setAllValue]);

    useModel({
      editor: editorRef.current,
      path,
    });

    useEffect(() => {
      document.body.addEventListener("click", onClickOutsideHandler.current);
      editorRef.current?.getDomNode()?.addEventListener("click", onClickContainer.current);
      editorRef.current?.getDomNode()?.setAttribute("data-test-subj", "codeEditorContainer");
      return () => {
        document.body.removeEventListener("click", onClickOutsideHandler.current);
        editorRef.current?.getDomNode()?.removeEventListener("click", onClickContainer.current);
      };
    }, [isReady]);

    useImperativeHandle(ref, () => ({
      validate: () =>
        new Promise((resolve, reject) => {
          try {
            JSON.parse(editorRef.current?.getValue() || "{}");
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
              onChange && onChange(e.target.value);
            } catch (e) {
              // do nothing
            }
          }}
          title={`editor-is-ready-${isReady}`}
          data-test-subj={`${others["data-test-subj"] || "jsonEditor"}-valueDisplay`}
        />
        <div
          style={{
            height: others?.height || undefined,
          }}
          className={confirmModalVisible ? "monaco-json-editor-validate-error" : ""}
        >
          <MonacoEditor
            height="600px"
            {...others}
            onChange={(val) => setEditorValue(val)}
            theme="ismJSONTheme"
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
  }
);

export default MonacoJSONEditor;
