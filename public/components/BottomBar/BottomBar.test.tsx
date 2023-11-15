/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { render } from "@testing-library/react";
import BottomBar from "./BottomBar";

describe("<FormGenerator /> spec", () => {
  it("render the component", () => {
    render(<BottomBar />);
    expect(document.body.children).toMatchSnapshot();
  });
});
