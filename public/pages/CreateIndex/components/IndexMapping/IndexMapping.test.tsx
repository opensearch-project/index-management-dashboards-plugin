/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { render } from "@testing-library/react";
import IndexMapping from "./IndexMapping";

describe("<IndexMapping /> spec", () => {
  it("renders the component", () => {
    const { container } = render(<IndexMapping />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
