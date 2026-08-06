/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import "@testing-library/jest-dom";
import { render, screen, cleanup } from "@testing-library/react";
import { DEFAULT_CONVERT_INDEX_TO_REMOTE } from "../../../utils/constants";
import { ConvertIndexToRemoteAction, UIAction } from "../../../../../../models/interfaces";
import { actionRepoSingleton } from "../../../utils/helpers";

const TEST_PROPS: UIAction<ConvertIndexToRemoteAction> = {
  action: DEFAULT_CONVERT_INDEX_TO_REMOTE,
} as UIAction<ConvertIndexToRemoteAction>;

const mockOnChangeAction = jest.fn();

afterEach(() => cleanup());

describe("ConvertIndexToRemoteUIAction component", () => {
  it("renders correctly with default action", () => {
    const { container } = render(actionRepoSingleton.getUIAction("convert_index_to_remote").render(TEST_PROPS, mockOnChangeAction));

    const repositoryInput = screen.getByTestId("action-render-convert-index-to-remote-repository");
    expect(repositoryInput).toBeInTheDocument();
    expect(repositoryInput).toHaveValue(DEFAULT_CONVERT_INDEX_TO_REMOTE.convert_index_to_remote.repository);
    const snapshotInput = screen.getByTestId("action-render-convert-index-to-remote-snapshot");
    expect(snapshotInput).toBeInTheDocument();
    expect(snapshotInput).toHaveValue(DEFAULT_CONVERT_INDEX_TO_REMOTE.convert_index_to_remote.snapshot);
    const renamePatternInput = screen.getByTestId("action-render-convert-index-to-remote-rename-pattern");
    expect(renamePatternInput).toBeInTheDocument();
    // Should display the backend default fallback value
    expect(renamePatternInput).toHaveValue("$1_remote");

    expect(container).toMatchSnapshot();
  });

  it("renders correctly when rename_pattern is provided", () => {
    const actionWithoutRenamePattern: UIAction<ConvertIndexToRemoteAction> = {
      action: {
        convert_index_to_remote: {
          repository: "test-repository",
          snapshot: "test-snapshot",
          rename_pattern: "remote_$1",
        },
      },
    } as UIAction<ConvertIndexToRemoteAction>;

    const { container } = render(
      actionRepoSingleton.getUIAction("convert_index_to_remote").render(actionWithoutRenamePattern, mockOnChangeAction)
    );

    const renamePatternInput = screen.getByTestId("action-render-convert-index-to-remote-rename-pattern");
    expect(renamePatternInput).toBeInTheDocument();
    expect(renamePatternInput).toHaveValue("remote_$1");

    expect(container).toMatchSnapshot();
  });
});
