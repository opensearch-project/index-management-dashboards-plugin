/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SnapshotRenameOptions from "./SnapshotRenameOptions";


const testProps = {
  onDoNotRenameToggle: jest.fn(),
  onAddPrefixToggle: jest.fn(),
  onRenameIndicesToggle: jest.fn(),
  width: "200"
};

afterEach(() => {
  cleanup();
});

describe("SnapshotRenameOptions component", () => {
  it("renders without error", () => {
    const { container } = render(
      <SnapshotRenameOptions
        {...testProps}
        doNotRename={true}
        addPrefix={false}
        renameIndices={false} />
    );

    expect(screen.getByText("Do not rename")).toBeInTheDocument();
    expect(screen.getByText("Add prefix to restored index names")).toBeInTheDocument();
    expect(screen.getByText("Rename using regular expression (Advanced)")).toBeInTheDocument();
    expect(screen.getByLabelText("Do not rename")).toBeChecked();
    expect(screen.getByLabelText("Add prefix to restored index names")).not.toBeChecked();
    expect(screen.getByLabelText("Rename using regular expression (Advanced)")).not.toBeChecked();

    expect(container).toMatchSnapshot();
  });

  it("accepts user input", () => {
    render(
      <SnapshotRenameOptions
        {...testProps}
        doNotRename={true}
        addPrefix={false}
        renameIndices={false} />
    );

    userEvent.click(screen.getByLabelText("Add prefix to restored index names"));

    expect(testProps.onAddPrefixToggle).toBeCalled();

    userEvent.click(screen.getByLabelText("Rename using regular expression (Advanced)"));

    expect(testProps.onRenameIndicesToggle).toBeCalled();

    cleanup();

    render(
      <SnapshotRenameOptions
        {...testProps}
        doNotRename={false}
        addPrefix={true}
        renameIndices={false} />
    )

    userEvent.click(screen.getByLabelText("Do not rename"));

    expect(testProps.onDoNotRenameToggle).toBeCalled();

  });
});
