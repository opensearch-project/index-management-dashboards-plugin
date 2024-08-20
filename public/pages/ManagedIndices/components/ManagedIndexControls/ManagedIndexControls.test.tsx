/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { render, fireEvent, waitFor } from "@testing-library/react";
// @ts-ignore
import userEvent from "@testing-library/user-event";
import ManagedIndexControls from "./ManagedIndexControls";
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

describe("<ManagedIndexControls /> spec", () => {
  it("renders the component", async () => {
    const { container } = render(
      <ManagedIndexControls
        activePage={0}
        pageCount={1}
        search={"testing"}
        onSearchChange={() => {}}
        onPageClick={() => {}}
        onRefresh={async () => {}}
        showDataStreams={false}
        getDataStreams={async () => []}
        toggleShowDataStreams={() => {}}
      />
    );

    expect(container.firstChild).toMatchSnapshot();
  });

  it("calls onSearchChange when typing", async () => {
    const onSearchChange = jest.fn();
    const { getByPlaceholderText } = render(
      <ManagedIndexControls
        activePage={0}
        pageCount={1}
        search={""}
        onSearchChange={onSearchChange}
        onPageClick={() => {}}
        onRefresh={async () => {}}
        showDataStreams={false}
        getDataStreams={async () => []}
        toggleShowDataStreams={() => {}}
      />
    );

    userEvent.type(getByPlaceholderText("Search index name"), "four");

    expect(onSearchChange).toHaveBeenCalledTimes(4);
  });

  it("calls toggleShowDataStreams when clicked", async () => {
    const toggleShowDataStreams = jest.fn();
    const { getByTestId } = render(
      <ManagedIndexControls
        activePage={0}
        pageCount={2}
        search={""}
        onSearchChange={() => {}}
        onPageClick={() => {}}
        onRefresh={async () => {}}
        showDataStreams={false}
        getDataStreams={async () => []}
        toggleShowDataStreams={toggleShowDataStreams}
      />
    );

    fireEvent.click(getByTestId("toggleShowDataStreams"));
    expect(toggleShowDataStreams).toHaveBeenCalledTimes(1);
  });

  it("renders data streams selection field", async () => {
    const getDataStreams = jest.fn();
    const { container, getByText } = render(
      <ManagedIndexControls
        activePage={0}
        pageCount={2}
        search={""}
        onSearchChange={() => {}}
        onPageClick={() => {}}
        onRefresh={async () => {}}
        showDataStreams={true}
        getDataStreams={getDataStreams}
        toggleShowDataStreams={() => {}}
      />
    );

    expect(container.firstChild).toMatchSnapshot();

    const dataStreamsSelection = getByText("Data streams");
    expect(dataStreamsSelection).not.toBeNull();

    fireEvent.click(dataStreamsSelection);
    await waitFor(() => expect(getDataStreams).toHaveBeenCalledTimes(1), { timeout: 10000 });
  });
});
