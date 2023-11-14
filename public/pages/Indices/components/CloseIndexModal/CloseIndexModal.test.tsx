/*
 *   Copyright OpenSearch Contributors
 *
 *   Licensed under the Apache License, Version 2.0 (the "License").
 *   You may not use this file except in compliance with the License.
 *   A copy of the License is located at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   or in the "license" file accompanying this file. This file is distributed
 *   on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 *   express or implied. See the License for the specific language governing
 *   permissions and limitations under the License.
 */

import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { render, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CloseIndexModal from "./CloseIndexModal";

describe("<CloseIndexModal /> spec", () => {
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
    userEvent.type(getByPlaceholderText("close"), "close");
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
