/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { render, fireEvent, waitFor } from "@testing-library/react";
// @ts-ignore
import userEvent from "@testing-library/user-event";
import PolicyControls from "./PolicyControls";

describe("<PolicyControls /> spec", () => {
  it("renders the component", async () => {
    const { container } = render(
      <PolicyControls
        activePage={0}
        pageCount={1}
        search={"testing"}
        onSearchChange={() => {}}
        onPageClick={() => {}}
        onRefresh={async () => {}}
      />
    );

    expect(container.firstChild).toMatchSnapshot();
  });

  it("calls onSearchChange when typing", async () => {
    const onSearchChange = jest.fn();
    const { getByPlaceholderText } = render(
      <PolicyControls
        activePage={0}
        pageCount={1}
        search={""}
        onSearchChange={onSearchChange}
        onPageClick={() => {}}
        onRefresh={async () => {}}
      />
    );

    userEvent.type(getByPlaceholderText("Search"), "four");

    expect(onSearchChange).toHaveBeenCalledTimes(4);
  });

  it("shows/hides pagination", async () => {
    const { queryByTestId, rerender } = render(
      <PolicyControls
        activePage={0}
        pageCount={1}
        search={""}
        onSearchChange={() => {}}
        onPageClick={() => {}}
        onRefresh={async () => {}}
      />
    );

    expect(queryByTestId("policyControlsPagination")).toBeNull();

    rerender(
      <PolicyControls
        activePage={0}
        pageCount={2}
        search={""}
        onSearchChange={() => {}}
        onPageClick={() => {}}
        onRefresh={async () => {}}
      />
    );

    expect(queryByTestId("policyControlsPagination")).not.toBeNull();
  });

  it("calls onPageClick when clicking pagination", async () => {
    const onPageClick = jest.fn();
    const { getByTestId } = render(
      <PolicyControls
        activePage={0}
        pageCount={2}
        search={""}
        onSearchChange={() => {}}
        onPageClick={onPageClick}
        onRefresh={async () => {}}
      />
    );

    fireEvent.click(getByTestId("pagination-button-1"));

    expect(onPageClick).toHaveBeenCalledTimes(1);
  });
});
