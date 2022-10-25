/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { render } from "@testing-library/react";
import IndexMapping from "./IndexMapping";

describe("<IndexMapping /> spec", () => {
  it("renders the component", () => {
    const { container } = render(<IndexMapping onChange={() => {}} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it("render mappings with object type", () => {
    const { container } = render(
      <IndexMapping
        onChange={() => {}}
        value={[{ fieldName: "object", type: "object", properties: [{ fieldName: "text", type: "text" }] }]}
      />
    );
    expect(container).toMatchSnapshot();
  });
});
