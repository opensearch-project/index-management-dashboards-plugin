/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { render, fireEvent } from "@testing-library/react";
import PolicyEmptyPrompt, { TEXT } from "./PolicyEmptyPrompt";

describe("<PolicyEmptyPrompt /> spec", () => {
  it("renders the component", async () => {
    const { container } = render(<PolicyEmptyPrompt filterIsApplied={false} loading={false} resetFilters={() => {}} />);

    expect(container.firstChild).toMatchSnapshot();
  });

  it("renders no indices by default", async () => {
    const { getByText, queryByTestId } = render(<PolicyEmptyPrompt filterIsApplied={false} loading={false} resetFilters={() => {}} />);

    getByText(TEXT.NO_POLICIES);
    expect(queryByTestId("policyEmptyPromptRestFilters")).toBeNull();
  });

  it("shows LOADING", async () => {
    const { getByText, queryByTestId } = render(<PolicyEmptyPrompt filterIsApplied={true} loading={true} resetFilters={() => {}} />);

    getByText(TEXT.LOADING);
    expect(queryByTestId("policyEmptyPromptRestFilters")).toBeNull();
  });

  it("shows reset filters", async () => {
    const resetFilters = jest.fn();
    const { getByText, getByTestId } = render(<PolicyEmptyPrompt filterIsApplied={true} loading={false} resetFilters={resetFilters} />);

    getByText(TEXT.RESET_FILTERS);
    fireEvent.click(getByTestId("policyEmptyPromptRestFilters"));
    expect(resetFilters).toHaveBeenCalledTimes(1);
  });
});
