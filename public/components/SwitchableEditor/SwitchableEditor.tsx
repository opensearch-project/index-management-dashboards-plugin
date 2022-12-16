/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiSpacer, EuiSwitch } from "@elastic/eui";
import React, { forwardRef, useState } from "react";
import JSONEditor, { IJSONEditorRef } from "../JSONEditor";
import JSONDiffEditor, { JSONDiffEditorProps } from "../JSONDiffEditor";

export interface SwitchableEditorProps extends JSONDiffEditorProps {
  mode: "json" | "diff";
}

export interface ISwitchableEditorRef extends IJSONEditorRef {}

const SwitchableEditor = forwardRef(({ mode, ...others }: SwitchableEditorProps, ref: React.Ref<ISwitchableEditorRef>) => {
  const [checked, setChecked] = useState(false);
  return (
    <>
      {mode === "diff" ? (
        <>
          <EuiSpacer />
          <EuiSwitch label="Compare previously saved settings" checked={checked} onChange={(e) => setChecked(e.target.checked)} />
          <EuiSpacer />
        </>
      ) : null}
      {checked ? <JSONDiffEditor {...others} ref={ref} /> : <JSONEditor {...others} ref={ref} />}
    </>
  );
});

export default SwitchableEditor;
