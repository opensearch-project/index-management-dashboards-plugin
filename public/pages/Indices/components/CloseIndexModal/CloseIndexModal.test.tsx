/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CloseIndexModal from "./CloseIndexModal";

describe("<CloseIndexModal /> spec", () => {
  it("renders the component", async () => {
    render(<CloseIndexModal selectedItems={[]} visible onConfirm={() => {}} onClose={() => {}} />);

    expect(document.body.children).toMatchSnapshot();
  });

  it("Close button should be disabled unless a 'close' was input", async () => {
    const { getByPlaceholderText } = render(<CloseIndexModal selectedItems={[]} visible onConfirm={() => {}} onClose={() => {}} />);
    expect(document.querySelector(".euiButton")).toHaveAttribute("disabled");
    userEvent.type(getByPlaceholderText("close"), "close");
    expect(document.querySelector(".euiButton")).not.toHaveAttribute("disabled");
  });
});
