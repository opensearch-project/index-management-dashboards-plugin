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

import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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
  it("renders without error", () => {
    const { container } = render(<SnapshotRestoreOption {...testProps} restoreAllIndices={true} restoreSpecificIndices={false} />);

    expect(screen.getByText("Restore all indices in snapshot")).toBeInTheDocument();
    expect(screen.getByText("Restore specific indices")).toBeInTheDocument();

    expect(container).toMatchSnapshot();
  });

  it("accepts user input", () => {
    render(<SnapshotRestoreOption {...testProps} restoreAllIndices={true} restoreSpecificIndices={false} />);

    userEvent.click(screen.getByLabelText("Restore specific indices"));

    expect(testProps.onRestoreSpecificIndicesToggle).toBeCalled();

    cleanup();

    render(<SnapshotRestoreOption {...testProps} restoreAllIndices={false} restoreSpecificIndices={true} />);

    userEvent.click(screen.getByLabelText("Restore all indices in snapshot"));

    expect(testProps.onRestoreAllIndicesToggle).toBeCalled();
  });
});
