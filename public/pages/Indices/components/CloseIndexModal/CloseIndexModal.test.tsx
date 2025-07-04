/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { render, fireEvent } from "@testing-library/react";
import userEventModule from "@testing-library/user-event";
import CloseIndexModal from "./CloseIndexModal";

describe("<CloseIndexModal /> spec", () => {
  const userEvent = userEventModule.setup();

  it("renders the component", async () => {
    render(<CloseIndexModal selectedItems={[]} visible onConfirm={() => {}} onClose={() => {}} />);
    expect(document.body.children).toMatchSnapshot();
  });

  it("calls close when cancel button clicked", () => {
    const onClose = jest.fn();
    const { getByTestId } = render(<CloseIndexModal selectedItems={[]} visible onConfirm={() => {}} onClose={onClose} />);
    fireEvent.click(getByTestId("Close Cancel button"));
    expect(onClose).toHaveBeenCalled();
  });

  it("Close button should be disabled unless a 'close' was input", async () => {
    const { getByPlaceholderText } = render(<CloseIndexModal selectedItems={[]} visible onConfirm={() => {}} onClose={() => {}} />);
    expect(document.querySelector(".euiButton")).toHaveAttribute("disabled");
    await userEvent.type(getByPlaceholderText("close"), "close");
    expect(document.querySelector(".euiButton")).not.toHaveAttribute("disabled");
  });

  it("Show warning when system indices are selected", async () => {
    render(<CloseIndexModal selectedItems={[".kibana", ".tasks", "test-index"]} visible onConfirm={() => {}} onClose={() => {}} />);
    expect(document.querySelector(".euiCallOut")).not.toHaveAttribute("hidden");
  });

  it("No warning if no system indices are selected", async () => {
    render(<CloseIndexModal selectedItems={["test-index1", "test-index2"]} visible onConfirm={() => {}} onClose={() => {}} />);
    expect(document.querySelector(".euiCallOut")).toHaveAttribute("hidden");
  });
});
