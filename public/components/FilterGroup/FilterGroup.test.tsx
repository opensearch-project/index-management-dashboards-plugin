/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { act, render, waitFor } from "@testing-library/react";
import FilterGroup, { IFilterGroupProps } from "./index";
import userEventModule from "@testing-library/user-event";

const WrappedComponent = (props: IFilterGroupProps) => {
  const [value, onChange] = useState<string[] | undefined>();
  return <FilterGroup {...props} value={value} onChange={(val) => onChange(val || [])} />;
};

describe("<FilterGroup /> spec", () => {
  const userEvent = userEventModule.setup();
  it("render the component", async () => {
    const { findByPlaceholderText, getByTestId, findByText, getByText, queryByText } = render(
      <>
        <WrappedComponent
          options={[{ label: "test option" }]}
          value={[]}
          filterButtonProps={{
            placeholder: "test",
            "data-test-subj": "test",
          }}
        />
        <button>hide</button>
      </>
    );
    await findByPlaceholderText("test");
    expect(document.body.children).toMatchSnapshot();
    await userEvent.click(getByTestId("test"));
    await findByText("test option");
    expect(document.body.children).toMatchSnapshot();
    await userEvent.click(getByText("test option"));
    await waitFor(() => {
      expect(document.querySelector("[aria-label='1 active filters']")).toBeInTheDocument();
      expect(document.body.children).toMatchSnapshot();
    });
    await userEvent.click(getByText("test option"));
    await waitFor(() => {
      expect(document.querySelector("[aria-label='1 available filters']")).toBeInTheDocument();
      expect(document.body.children).toMatchSnapshot();
    });
    act(() => {
      userEvent.click(getByText("hide"));
    });
    await waitFor(() => {
      expect(queryByText("test option")).toBeNull();
    });
  });
});
