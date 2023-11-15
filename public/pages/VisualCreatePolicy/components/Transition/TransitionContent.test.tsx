/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { render } from "@testing-library/react";
import TransitionContent from "./TransitionContent";

describe("<TransitionContent /> spec", () => {
  it("renders the component", () => {
    const { container } = render(<TransitionContent transition={{ state_name: "some_state", conditions: { min_index_age: "30d" } }} />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
