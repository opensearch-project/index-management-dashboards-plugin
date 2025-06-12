/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { render, screen, cleanup } from "@testing-library/react";
import userEventModule from "@testing-library/user-event";
import SnapshotRestoreOption from "./SnapshotRestoreOption";

const testProps = {
  onRestoreAllIndicesToggle: jest.fn(),
  onRestoreSpecificIndicesToggle: jest.fn(),
  width: "200",
};

afterEach(() => {
  cleanup();
});

describe("SnapshotRestoreOption component", () => {
  const userEvent = userEventModule.setup();

  it("renders without error", () => {
    const { container } = render(<SnapshotRestoreOption {...testProps} restoreAllIndices={true} restoreSpecificIndices={false} />);

    expect(screen.getByText("Restore all indices in snapshot")).toBeInTheDocument();
    expect(screen.getByText("Restore specific indices")).toBeInTheDocument();

    expect(container).toMatchSnapshot();
  });

  it("accepts user input", () => {
    render(<SnapshotRestoreOption {...testProps} restoreAllIndices={true} restoreSpecificIndices={false} />);

    await userEvent.click(screen.getByLabelText("Restore specific indices"));

    expect(testProps.onRestoreSpecificIndicesToggle).toBeCalled();

    cleanup();

    render(<SnapshotRestoreOption {...testProps} restoreAllIndices={false} restoreSpecificIndices={true} />);

    await userEvent.click(screen.getByLabelText("Restore all indices in snapshot"));

    expect(testProps.onRestoreAllIndicesToggle).toBeCalled();
  });
});
