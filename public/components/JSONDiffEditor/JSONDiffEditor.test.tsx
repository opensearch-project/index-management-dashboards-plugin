/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { render } from "@testing-library/react";
import JSONDiffEditor from "./index";

describe("<JSONDiffEditor /> spec", () => {
  it("renders the component", () => {
    render(<JSONDiffEditor value={JSON.stringify({ name: "test" })} />);
    expect(document.body.children).toMatchSnapshot();
  });
});
