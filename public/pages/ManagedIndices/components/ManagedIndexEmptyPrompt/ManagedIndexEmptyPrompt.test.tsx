/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { render, fireEvent } from "@testing-library/react";
import ManagedIndexEmptyPrompt, { TEXT } from "./ManagedIndexEmptyPrompt";
import historyMock from "../../../../../test/mocks/historyMock";

describe("<ManagedIndexEmptyPrompt /> spec", () => {
  it("renders the component", async () => {
    const { container } = render(
      <ManagedIndexEmptyPrompt history={historyMock} filterIsApplied={false} loading={false} resetFilters={() => {}} />
    );

    expect(container.firstChild).toMatchSnapshot();
  });

  it("renders no managed indices by default", async () => {
    const { getByText, queryByTestId } = render(
      <ManagedIndexEmptyPrompt history={historyMock} filterIsApplied={false} loading={false} resetFilters={() => {}} />
    );

    getByText(TEXT.NO_MANAGED_INDICES);
    expect(queryByTestId("managedIndexEmptyPromptResetFilters")).toBeNull();
  });

  it("shows LOADING", async () => {
    const { getByText, queryByTestId } = render(
      <ManagedIndexEmptyPrompt history={historyMock} filterIsApplied={true} loading={true} resetFilters={() => {}} />
    );

    getByText(TEXT.LOADING);
    expect(queryByTestId("managedIndexEmptyPromptResetFilters")).toBeNull();
  });

  it("shows reset filters", async () => {
    const resetFilters = jest.fn();
    const { getByText, getByTestId } = render(
      <ManagedIndexEmptyPrompt history={historyMock} filterIsApplied={true} loading={false} resetFilters={resetFilters} />
    );

    getByText(TEXT.RESET_FILTERS);
    fireEvent.click(getByTestId("managedIndexEmptyPromptResetFilters"));
    expect(resetFilters).toHaveBeenCalledTimes(1);
  });
});
