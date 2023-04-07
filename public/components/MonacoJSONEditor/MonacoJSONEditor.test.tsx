/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { render } from "@testing-library/react";
import MonacoJSONEditor from "./index";

describe("<MonacoJSONEditor /> spec", () => {
  it("renders the component", () => {
    render(<MonacoJSONEditor value={JSON.stringify({ name: "test" })} />);
    expect(document.body.children).toMatchSnapshot();
  });
});
