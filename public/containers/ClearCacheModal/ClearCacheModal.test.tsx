/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { render, fireEvent } from "@testing-library/react";
import ClearCacheModal from "./ClearCacheModal";

describe("<ClearCacheModal /> spec", () => {
  it("renders the component", async () => {
    render(<ClearCacheModal selectedItems={[]} visible onClose={() => {}} type="indexes" />);

    expect(document.body.children).toMatchSnapshot();
  });

  it("calls close when cancel button clicked", () => {
    const onClose = jest.fn();
    const { getByTestId } = render(<ClearCacheModal selectedItems={[]} visible onClose={onClose} type="indexes" />);
    fireEvent.click(getByTestId("ClearCacheCancelButton"));
    expect(onClose).toHaveBeenCalled();
  });
});
