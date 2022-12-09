/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { render, waitFor } from "@testing-library/react";
// @ts-ignore
import userEvent from "@testing-library/user-event";
import IndexControls from "./IndexControls";

describe("<IndexControls /> spec", () => {
  it("renders the component", async () => {
    const { container } = render(<IndexControls value={{ search: "testing" }} onSearchChange={() => {}} />);

    expect(container.firstChild).toMatchSnapshot();
  });

  it("onChange with right data", async () => {
    const onSearchChangeMock = jest.fn();
    const { getByPlaceholderText } = render(<IndexControls value={{ search: "" }} onSearchChange={onSearchChangeMock} />);

    userEvent.type(getByPlaceholderText("Search..."), "test");
    await waitFor(() => {
      expect(onSearchChangeMock).toBeCalledTimes(4);
      expect(onSearchChangeMock).toBeCalledWith({
        search: "test",
      });
    });
  });
});
