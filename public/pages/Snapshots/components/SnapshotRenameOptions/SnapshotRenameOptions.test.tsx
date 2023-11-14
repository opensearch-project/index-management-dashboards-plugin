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
import SnapshotRenameOptions from "./SnapshotRenameOptions";

const testProps = {
  onDoNotRenameToggle: jest.fn(),
  onAddPrefixToggle: jest.fn(),
  onRenameIndicesToggle: jest.fn(),
  width: "200",
};

afterEach(() => {
  cleanup();
});

describe("SnapshotRenameOptions component", () => {
  it("renders without error", () => {
    const { container } = render(<SnapshotRenameOptions {...testProps} doNotRename={true} addPrefix={false} renameIndices={false} />);

    expect(screen.getByText("Do not rename")).toBeInTheDocument();
    expect(screen.getByText("Add prefix to restored index names")).toBeInTheDocument();
    expect(screen.getByText("Rename using regular expression (Advanced)")).toBeInTheDocument();
    expect(screen.getByLabelText("Do not rename")).toBeChecked();
    expect(screen.getByLabelText("Add prefix to restored index names")).not.toBeChecked();
    expect(screen.getByLabelText("Rename using regular expression (Advanced)")).not.toBeChecked();

    expect(container).toMatchSnapshot();
  });

  it("accepts user input", () => {
    render(<SnapshotRenameOptions {...testProps} doNotRename={true} addPrefix={false} renameIndices={false} />);

    userEvent.click(screen.getByLabelText("Add prefix to restored index names"));

    expect(testProps.onAddPrefixToggle).toBeCalled();

    userEvent.click(screen.getByLabelText("Rename using regular expression (Advanced)"));

    expect(testProps.onRenameIndicesToggle).toBeCalled();

    cleanup();

    render(<SnapshotRenameOptions {...testProps} doNotRename={false} addPrefix={true} renameIndices={false} />);

    userEvent.click(screen.getByLabelText("Do not rename"));

    expect(testProps.onDoNotRenameToggle).toBeCalled();
  });
});
