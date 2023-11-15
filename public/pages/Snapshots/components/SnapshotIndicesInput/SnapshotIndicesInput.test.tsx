/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SnapshotIndicesInput from "./SnapshotIndicesInput";

const testProps = {
  onIndicesSelectionChange: jest.fn(),
  getIndexOptions: jest.fn(),
  onCreateOption: jest.fn(),
  isClearable: true,
};

afterEach(() => {
  cleanup();
});

describe("SnapshotIndicesInput component", () => {
  it("renders without error", () => {
    const { container } = render(
      <SnapshotIndicesInput {...testProps} indexOptions={[]} selectedIndexOptions={[]} selectedRepoValue="test_repo" />
    );
    expect(screen.getByRole("textbox")).toBeInTheDocument();
    expect(container).toMatchSnapshot();
  });

  it("accepts user input", () => {
    render(
      <SnapshotIndicesInput
        {...testProps}
        indexOptions={[{ label: "test_index_1" }, { label: "test_index_2" }]}
        selectedIndexOptions={[]}
        selectedRepoValue="test_repo"
      />
    );

    userEvent.type(screen.getByRole("textbox"), "test*{enter}");

    expect(testProps.onCreateOption).toBeCalledTimes(1);
  });

  it("allows user to select indices to restore", async () => {
    render(
      <SnapshotIndicesInput
        {...testProps}
        indexOptions={[{ label: "test_index_1" }, { label: "test_index_2" }]}
        selectedIndexOptions={[]}
        selectedRepoValue="test_repo"
      />
    );
    userEvent.click(screen.getByRole("textbox"));

    expect(screen.getByText("test_index_1")).toBeInTheDocument();
    expect(screen.getByText("test_index_2")).toBeInTheDocument();

    userEvent.click(screen.getByText("test_index_1"));
    userEvent.click(screen.getByText("test_index_2"));

    expect(testProps.onIndicesSelectionChange).toBeCalledTimes(2);
  });
});
