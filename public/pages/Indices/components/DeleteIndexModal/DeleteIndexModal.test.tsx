/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DeleteIndexModal from "./DeleteIndexModal";

describe("<DeleteIndexModal /> spec", () => {
  it("renders the component", async () => {
    const { getByText } = render(<DeleteIndexModal selectedItems={[".kibana", "test"]} visible onConfirm={() => {}} onClose={() => {}} />);

    await waitFor(() => expect(getByText("You are trying to delete system-like index, please be careful.")).toBeInTheDocument());
    expect(document.body.children).toMatchSnapshot();
  });

  it("Delete button should be disabled unless a 'delete' was input", async () => {
    const { getByPlaceholderText } = render(
      <DeleteIndexModal selectedItems={[".kibana", "test"]} visible onConfirm={() => {}} onClose={() => {}} />
    );
    expect(document.querySelector(".euiButton--danger")).toHaveAttribute("disabled");
    userEvent.type(getByPlaceholderText("delete"), "delete");
    expect(document.querySelector(".euiButton--danger")).not.toHaveAttribute("disabled");
  });
});
