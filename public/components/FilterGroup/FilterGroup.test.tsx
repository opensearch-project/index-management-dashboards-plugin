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

import React, { useState } from "react";
import { act, render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FilterGroup, { IFilterGroupProps } from "./index";

const WrappedComponent = (props: IFilterGroupProps) => {
  const [value, onChange] = useState<string[] | undefined>();
  return <FilterGroup {...props} value={value} onChange={(val) => onChange(val || [])} />;
};

describe("<FilterGroup /> spec", () => {
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
