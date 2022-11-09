/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { render } from "@testing-library/react";
import AdvancedSettings from "./index";

describe("<FormGenerator /> spec", () => {
  it("render the component", () => {
    render(<AdvancedSettings value={{ a: "foo" }} accordionProps={{ id: "test", initialIsOpen: false }} />);
    expect(document.body.children).toMatchSnapshot();
  });
});
