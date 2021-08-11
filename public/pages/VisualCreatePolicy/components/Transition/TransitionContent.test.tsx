/*
 * SPDX-License-Identifier: Apache-2.0
 *
 * The OpenSearch Contributors require contributions made to
 * this file be licensed under the Apache-2.0 license or a
 * compatible open source license.
 *
 * Modifications Copyright OpenSearch Contributors. See
 * GitHub history for details.
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
