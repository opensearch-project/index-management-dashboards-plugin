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
import { getApplication, getNavigationUI, getUISettings } from "../../../../services/Services";

jest.mock("../../../../services/Services", () => ({
  ...jest.requireActual("../../../../services/Services"),
  getUISettings: jest.fn(),
  getApplication: jest.fn(),
  getNavigationUI: jest.fn(),
}));

beforeEach(() => {
  (getUISettings as jest.Mock).mockReturnValue({
    get: jest.fn().mockReturnValue(false), // or false, depending on your test case
  });
  (getApplication as jest.Mock).mockReturnValue({});

  (getNavigationUI as jest.Mock).mockReturnValue({});
});

describe("<IndexControls /> spec", () => {
  it("renders the component", async () => {
    const { container } = render(<IndexControls value={{ search: "testing", status: "1" }} onSearchChange={() => {}} />);

    expect(container.firstChild).toMatchSnapshot();
  });

  it("onChange with right data", async () => {
    const onSearchChangeMock = jest.fn();
    const { getByTestId, getByPlaceholderText } = render(
      <IndexControls value={{ search: "", status: "" }} onSearchChange={onSearchChangeMock} />
    );

    userEvent.type(getByTestId("comboBoxSearchInput"), "closed{enter}");
    expect(onSearchChangeMock).toBeCalledTimes(1);
    expect(onSearchChangeMock).toBeCalledWith({
      search: "",
      status: "closed",
    });
    userEvent.type(getByPlaceholderText("Search..."), "test");
    await waitFor(() => {
      expect(onSearchChangeMock).toBeCalledTimes(5);
      expect(onSearchChangeMock).toBeCalledWith({
        search: "test",
        status: "closed",
      });
    });
  });
});
