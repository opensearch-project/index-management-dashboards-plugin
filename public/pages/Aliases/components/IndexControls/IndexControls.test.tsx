/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { render } from "@testing-library/react";
// @ts-ignore
import userEvent from "@testing-library/user-event";
import IndexControls from "./IndexControls";

describe("<IndexControls /> spec", () => {
  it("renders the component", async () => {
    const { container } = render(<IndexControls value={{ search: "testing", status: "1" }} onSearchChange={() => {}} />);

    expect(container.firstChild).toMatchSnapshot();
  });
});
