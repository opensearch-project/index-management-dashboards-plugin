/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { render, fireEvent } from "@testing-library/react";
import OpenIndexModal from "./OpenIndexModal";

describe("<OpenIndexModal /> spec", () => {
  it("renders the component", async () => {
    render(<OpenIndexModal selectedItems={[]} visible onConfirm={() => {}} onClose={() => {}} />);

    expect(document.body.children).toMatchSnapshot();
  });

  it("calls close when cancel button clicked", () => {
    const onClose = jest.fn();
    const { getByTestId } = render(<OpenIndexModal selectedItems={[]} visible onConfirm={() => {}} onClose={onClose} />);
    fireEvent.click(getByTestId("Open Cancel button"));
    expect(onClose).toHaveBeenCalled();
  });
});
