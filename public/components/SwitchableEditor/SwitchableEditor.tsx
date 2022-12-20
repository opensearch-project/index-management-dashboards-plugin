/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiSpacer, EuiSwitch } from "@elastic/eui";
import React, { forwardRef, useRef, useState } from "react";
import JSONEditor, { IJSONEditorRef } from "../JSONEditor";
import JSONDiffEditor, { JSONDiffEditorProps } from "../JSONDiffEditor";
import { Modal } from "../Modal";
import "./SwitchableEditor.scss";

export interface SwitchableEditorProps extends JSONDiffEditorProps {
  mode: "json" | "diff";
}

export interface ISwitchableEditorRef extends IJSONEditorRef {}

const SwitchableEditor = forwardRef(({ mode, ...others }: SwitchableEditorProps, ref: React.Ref<ISwitchableEditorRef>) => {
  const [checked, setChecked] = useState(false);
  const diffEditorRef = useRef<IJSONEditorRef>(null);
  return (
    <>
      {mode === "diff" ? (
        <>
          <EuiSpacer />
          <EuiSwitch label="Compare previously saved settings" checked={checked} onChange={(e) => setChecked(e.target.checked)} />
          <EuiSpacer />
        </>
      ) : null}
      <Modal.SimpleModal
        visible={checked}
        onClose={() => setChecked(false)}
        onOk={async () => {
          (await diffEditorRef.current?.validate()) as string;
          setChecked(true);
          others.onChange && others.onChange(diffEditorRef.current?.getValue() || "{}");
        }}
        title="Edit in diff mode"
        maxWidth={false}
        className="switch-diff-editor-modal"
        style={{
          width: "100vw",
          height: "95vh",
          top: "5vh",
        }}
        content={<JSONDiffEditor height="100%" {...others} ref={diffEditorRef} />}
      />
      <JSONEditor {...others} ref={ref} />
    </>
  );
});

export default SwitchableEditor;
