/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { render } from "@testing-library/react";
import EuiFormCustomLabel from "./EuiFormCustomLabel";

describe("<EuiFormCustomLabel /> spec", () => {
  it("renders the component", () => {
    const { container } = render(<EuiFormCustomLabel title="Some title" helpText="Some helpful text" />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
