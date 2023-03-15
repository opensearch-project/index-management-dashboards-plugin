/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { forwardRef, useState, useEffect, useRef, useImperativeHandle, useCallback } from "react";
import { EuiFormRow } from "@elastic/eui";
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
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | undefined>(undefined);
    useDiagnosticsOptions({
      monaco,
      diagnosticsOptions,
    });
    const onClickOutsideHandler = useRef(() => {
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
      return () => {
        onClickOutsideHandler.current();
      };
    }, []);

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

    useEffect(() => {
      const editor = monaco.editor.create(containerRef.current as HTMLDivElement, {
        value: editorValue,
        language: "json",
        readOnly: others.readOnly,
        theme: "ismJSONTheme",
      });
      editorRef.current = editor;
      setIsReady(true);
      editor.onDidChangeModelContent(() => {
        const val = editor.getValue();
        setEditorValue(val);
      });
      editor.onDidBlurEditorWidget(onClickOutsideHandler.current);
      editor.getDomNode()?.setAttribute("data-test-subj", "codeEditorContainer");
      editor.layout();
      return () => {
        editor.dispose();
      };
    }, []);

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
          ref={containerRef}
          style={{
            height: others?.height || "600px",
          }}
          className={confirmModalVisible ? "monaco-json-editor-validate-error" : ""}
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
  }
);

export default MonacoJSONEditor;
