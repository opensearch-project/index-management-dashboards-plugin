/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { render, fireEvent } from "@testing-library/react";
import IndexEmptyPrompt, { TEXT } from "./IndexEmptyPrompt";

describe("<IndexEmptyPrompt /> spec", () => {
  it("renders the component", async () => {
    const { container } = render(<IndexEmptyPrompt filterIsApplied={false} loading={false} resetFilters={() => {}} />);

    expect(container.firstChild).toMatchSnapshot();
  });

  it("renders no indices by default", async () => {
    const { getByText, queryByTestId } = render(<IndexEmptyPrompt filterIsApplied={false} loading={false} resetFilters={() => {}} />);

    getByText(TEXT.NO_INDICES);
    expect(queryByTestId("indexEmptyPromptResetFilters")).toBeNull();
  });

  it("shows LOADING", async () => {
    const { getByText, queryByTestId } = render(<IndexEmptyPrompt filterIsApplied={true} loading={true} resetFilters={() => {}} />);

    getByText(TEXT.LOADING);
    expect(queryByTestId("indexEmptyPromptResetFilters")).toBeNull();
  });

  it("shows reset filters", async () => {
    const resetFilters = jest.fn();
    const { getByText, getByTestId } = render(<IndexEmptyPrompt filterIsApplied={true} loading={false} resetFilters={resetFilters} />);

    getByText(TEXT.RESET_FILTERS);
    fireEvent.click(getByTestId("indexEmptyPromptResetFilters"));
    expect(resetFilters).toHaveBeenCalledTimes(1);
  });
});
