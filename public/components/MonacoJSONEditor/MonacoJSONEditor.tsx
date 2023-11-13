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
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | undefined>(undefined);
    const hasBindEventRef = useRef<boolean>(false);
    useDiagnosticsOptions({
      monaco,
      diagnosticsOptions,
    });
    const onClickOutsideHandler = useRef(() => {
      if (others.disabled) {
        return;
      }
      try {
        const v = editorRef.current?.getValue();
        if (!v) {
          throw new Error("Value can not be empty");
        }
        JSON.parse(v);
        setConfirmModalVisible(false);
        if (onChange) onChange(v);
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
      // eslint-disable-next-line react-hooks/exhaustive-deps
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
      editorRef.current?.getDomNode()?.setAttribute("data-test-subj", "codeEditorContainer");
      if (editorRef.current && isReady && !hasBindEventRef.current) {
        editorRef.current.onDidBlurEditorWidget(onClickOutsideHandler.current);
        hasBindEventRef.current = true;
      }
    }, [isReady]);

    useEffect(() => {
      return () => {
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
        <div
          style={{
            height: others?.height || undefined,
          }}
          className={confirmModalVisible ? "monaco-json-editor-validate-error ism-monaco-editor" : "ism-monaco-editor"}
        >
          <MonacoEditor
            height="600px"
            {...others}
            onChange={(val) => setEditorValue(val)}
            theme="ismJSONTheme"
            language="json"
            value={editorValue}
            options={{
              readOnly: others.disabled || others.readOnly,
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
