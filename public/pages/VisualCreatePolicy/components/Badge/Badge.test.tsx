/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { render } from "@testing-library/react";
import Badge from "./Badge";

describe("<Badge /> spec", () => {
  it("renders the component", () => {
    const { container } = render(<Badge text="Some text" number={2} />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
