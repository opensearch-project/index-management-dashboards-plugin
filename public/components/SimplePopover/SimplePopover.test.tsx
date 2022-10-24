/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { render } from "@testing-library/react";
import SimplePopover from "./SimplePopover";

describe("<SimplePopover /> spec", () => {
  it("renders the component", () => {
    render(<SimplePopover button={<div>123</div>} />);
    expect(document.body.children).toMatchSnapshot();
  });
});
