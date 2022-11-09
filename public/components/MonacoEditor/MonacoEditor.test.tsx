/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { render } from "@testing-library/react";
import { MonacoEditorReact } from "./MonacoEditor";

describe("<MonacoEditor /> spec", () => {
  it("renders the component", () => {
    render(<MonacoEditorReact value={JSON.stringify({ name: "test" })} />);
    expect(document.body.children).toMatchSnapshot();
  });
});
