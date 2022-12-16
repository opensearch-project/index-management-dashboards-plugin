/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { render } from "@testing-library/react";
import SwitchableEditor from "./index";

describe("<SwitchableEditor /> spec", () => {
  it("renders the component", () => {
    render(<SwitchableEditor mode="diff" value={JSON.stringify({ name: "test" })} />);
    // EuiOverlayMask appends an element to the body so we should have three (used to be two, after upgrading appears to have 3 now), an empty div from react-test-library
    // and our EuiOverlayMask element
    expect(document.body.children).toMatchSnapshot();
  });
});
