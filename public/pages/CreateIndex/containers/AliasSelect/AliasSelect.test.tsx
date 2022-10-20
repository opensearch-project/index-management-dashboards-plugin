/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { render } from "@testing-library/react";
import AliasSelect from "./AliasSelect";

describe("<AliasSelect /> spec", () => {
  it("renders the component", () => {
    const { container } = render(<AliasSelect onChange={() => {}} />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
