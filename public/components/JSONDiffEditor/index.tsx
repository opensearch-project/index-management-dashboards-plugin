/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { forwardRef } from "react";
import { EuiDelayRender, EuiLoadingContent } from "@elastic/eui";
import type { JSONDiffEditorProps } from "./interface";
import { IJSONEditorRef } from "../JSONEditor";

const LazyBaseEditor = React.lazy(() => (process?.env?.NODE_ENV === "test" ? import("./JSONTextArea") : import("./JSONDiffEditor")));

const Fallback = () => (
  <EuiDelayRender>
    <EuiLoadingContent lines={3} />
  </EuiDelayRender>
);

const JSONDiffEditor = forwardRef((props: JSONDiffEditorProps, ref: React.Ref<IJSONEditorRef>) => {
  return (
    <React.Suspense fallback={<Fallback />}>
      <LazyBaseEditor {...props} ref={ref} />
    </React.Suspense>
  );
});

export default JSONDiffEditor;
export * from "./interface";
