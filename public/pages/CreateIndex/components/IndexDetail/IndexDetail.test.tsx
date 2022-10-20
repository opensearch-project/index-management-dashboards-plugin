/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { render } from "@testing-library/react";
import IndexDetail from "./IndexDetail";

describe("<IndexDetail /> spec", () => {
  it("renders the component", () => {
    const { container } = render(<IndexDetail />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
