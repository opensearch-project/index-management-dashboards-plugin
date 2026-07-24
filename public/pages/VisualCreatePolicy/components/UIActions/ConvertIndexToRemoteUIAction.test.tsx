/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import "@testing-library/jest-dom";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { DEFAULT_CONVERT_INDEX_TO_REMOTE } from "../../utils/constants";
import { ConvertIndexToRemoteAction, UIAction } from "../../../../../models/interfaces";
import { actionRepoSingleton } from "../../utils/helpers";

const TEST_PROPS: UIAction<ConvertIndexToRemoteAction> = {
  action: DEFAULT_CONVERT_INDEX_TO_REMOTE,
} as UIAction<ConvertIndexToRemoteAction>;

const renderComponent = (uiAction: UIAction<ConvertIndexToRemoteAction> = TEST_PROPS) => {
  render(actionRepoSingleton.getUIAction("convert_index_to_remote").render(uiAction, mockOnChangeAction));
};
const mockOnChangeAction = (uiAction: UIAction<ConvertIndexToRemoteAction> = TEST_PROPS) => {
  cleanup();
  renderComponent(uiAction);
};

afterEach(() => cleanup());

describe("ConvertIndexToRemoteUIAction component", () => {
  it("renders with default values", () => {
    render(actionRepoSingleton.getUIAction("convert_index_to_remote").render(TEST_PROPS, mockOnChangeAction));

    // Check that repository field exists with default value
    const repositoryInput = screen.getByTestId("action-render-convert-index-to-remote-repository");
    expect(repositoryInput).toBeInTheDocument();
    expect(repositoryInput).toHaveValue("example-repository");

    // Check that snapshot field exists with default value
    const snapshotInput = screen.getByTestId("action-render-convert-index-to-remote-snapshot");
    expect(snapshotInput).toBeInTheDocument();
    expect(snapshotInput).toHaveValue("example-snapshot");

    // Check that include_aliases switch exists
    const includeAliasesSwitch = screen.getByTestId("action-render-convert-index-to-remote-include-aliases");
    expect(includeAliasesSwitch).toBeInTheDocument();
    expect(includeAliasesSwitch).not.toBeChecked();

    // Check that delete_original_index switch exists
    const deleteOriginalIndexSwitch = screen.getByTestId("action-render-convert-index-to-remote-delete-original-index");
    expect(deleteOriginalIndexSwitch).toBeInTheDocument();
    expect(deleteOriginalIndexSwitch).not.toBeChecked();

    // Check that rename_pattern field exists
    const renamePatternInput = screen.getByTestId("action-render-convert-index-to-remote-rename-pattern");
    expect(renamePatternInput).toBeInTheDocument();
    expect(renamePatternInput).toHaveValue("$1_remote");

    // Check that ignore_index_settings field exists
    const ignoreIndexSettingsInput = screen.getByTestId("action-render-convert-index-to-remote-ignore-index-settings");
    expect(ignoreIndexSettingsInput).toBeInTheDocument();
    expect(ignoreIndexSettingsInput).toHaveValue("");

    // Check that number_of_replicas field exists
    const numberOfReplicasInput = screen.getByTestId("action-render-convert-index-to-remote-number-of-replicas");
    expect(numberOfReplicasInput).toBeInTheDocument();
    expect(numberOfReplicasInput).toHaveValue(null);
  });

  it("updates repository value on change", async () => {
    renderComponent();

    const repositoryInput = screen.getByTestId("action-render-convert-index-to-remote-repository");
    fireEvent.change(repositoryInput, { target: { value: "my-remote-repo" } });

    expect(screen.getByTestId("action-render-convert-index-to-remote-repository")).toHaveValue("my-remote-repo");
  });

  it("updates snapshot value on change", async () => {
    renderComponent();

    const snapshotInput = screen.getByTestId("action-render-convert-index-to-remote-snapshot");
    fireEvent.change(snapshotInput, { target: { value: "{{ctx.index}}" } });

    expect(screen.getByTestId("action-render-convert-index-to-remote-snapshot")).toHaveValue("{{ctx.index}}");
  });

  it("toggles include_aliases switch", async () => {
    renderComponent();

    const includeAliasesSwitch = screen.getByTestId("action-render-convert-index-to-remote-include-aliases");
    expect(includeAliasesSwitch).not.toBeChecked();

    fireEvent.click(includeAliasesSwitch);
    expect(screen.getByTestId("action-render-convert-index-to-remote-include-aliases")).toBeChecked();
  });

  it("toggles delete_original_index switch", async () => {
    renderComponent();

    const deleteOriginalIndexSwitch = screen.getByTestId("action-render-convert-index-to-remote-delete-original-index");
    expect(deleteOriginalIndexSwitch).not.toBeChecked();

    fireEvent.click(deleteOriginalIndexSwitch);
    expect(screen.getByTestId("action-render-convert-index-to-remote-delete-original-index")).toBeChecked();
  });

  it("updates rename_pattern value on change", async () => {
    renderComponent();

    const renamePatternInput = screen.getByTestId("action-render-convert-index-to-remote-rename-pattern");
    fireEvent.change(renamePatternInput, { target: { value: "remote_$1" } });

    expect(screen.getByTestId("action-render-convert-index-to-remote-rename-pattern")).toHaveValue("remote_$1");
  });

  it("updates ignore_index_settings value on change", async () => {
    renderComponent();

    const ignoreIndexSettingsInput = screen.getByTestId("action-render-convert-index-to-remote-ignore-index-settings");
    fireEvent.change(ignoreIndexSettingsInput, { target: { value: "index.refresh_interval,index.number_of_replicas" } });

    expect(screen.getByTestId("action-render-convert-index-to-remote-ignore-index-settings")).toHaveValue(
      "index.refresh_interval,index.number_of_replicas"
    );
  });

  it("updates number_of_replicas value on change", async () => {
    renderComponent();

    const numberOfReplicasInput = screen.getByTestId("action-render-convert-index-to-remote-number-of-replicas");
    fireEvent.change(numberOfReplicasInput, { target: { value: "2" } });

    expect(screen.getByTestId("action-render-convert-index-to-remote-number-of-replicas")).toHaveValue(2);
  });

  it("validates required fields", () => {
    const uiAction = actionRepoSingleton.getUIAction("convert_index_to_remote");

    // Valid action
    expect(uiAction.isValid()).toBe(true);

    // Invalid action - missing repository
    const invalidAction1 = {
      ...TEST_PROPS,
      action: {
        convert_index_to_remote: {
          ...DEFAULT_CONVERT_INDEX_TO_REMOTE.convert_index_to_remote,
          repository: "",
        },
      },
    };
    const invalidUIAction1 = actionRepoSingleton.getUIActionFromData(invalidAction1.action);
    expect(invalidUIAction1.isValid()).toBe(false);

    // Invalid action - missing snapshot
    const invalidAction2 = {
      ...TEST_PROPS,
      action: {
        convert_index_to_remote: {
          ...DEFAULT_CONVERT_INDEX_TO_REMOTE.convert_index_to_remote,
          snapshot: "",
        },
      },
    };
    const invalidUIAction2 = actionRepoSingleton.getUIActionFromData(invalidAction2.action);
    expect(invalidUIAction2.isValid()).toBe(false);

    // Invalid action - rename pattern missing $1
    const invalidAction3 = {
      ...TEST_PROPS,
      action: {
        convert_index_to_remote: {
          ...DEFAULT_CONVERT_INDEX_TO_REMOTE.convert_index_to_remote,
          rename_pattern: "remote_index",
        },
      },
    };
    const invalidUIAction3 = actionRepoSingleton.getUIActionFromData(invalidAction3.action);
    expect(invalidUIAction3.isValid()).toBe(false);

    // Invalid action - negative number_of_replicas
    const invalidAction4 = {
      ...TEST_PROPS,
      action: {
        convert_index_to_remote: {
          ...DEFAULT_CONVERT_INDEX_TO_REMOTE.convert_index_to_remote,
          number_of_replicas: -1,
        },
      },
    };
    const invalidUIAction4 = actionRepoSingleton.getUIActionFromData(invalidAction4.action);
    expect(invalidUIAction4.isValid()).toBe(false);
  });

  it("renders with custom values", () => {
    const customAction: ConvertIndexToRemoteAction = {
      convert_index_to_remote: {
        repository: "s3-repo",
        snapshot: "{{ctx.index}}-snapshot",
        include_aliases: true,
        ignore_index_settings: "index.refresh_interval",
        number_of_replicas: 2,
        delete_original_index: true,
        rename_pattern: "remote_$1",
      },
    };

    const customProps = { ...TEST_PROPS, action: customAction };
    render(actionRepoSingleton.getUIAction("convert_index_to_remote").render(customProps, mockOnChangeAction));

    expect(screen.getByTestId("action-render-convert-index-to-remote-repository")).toHaveValue("s3-repo");
    expect(screen.getByTestId("action-render-convert-index-to-remote-snapshot")).toHaveValue("{{ctx.index}}-snapshot");
    expect(screen.getByTestId("action-render-convert-index-to-remote-include-aliases")).toBeChecked();
    expect(screen.getByTestId("action-render-convert-index-to-remote-delete-original-index")).toBeChecked();
    expect(screen.getByTestId("action-render-convert-index-to-remote-rename-pattern")).toHaveValue("remote_$1");
    expect(screen.getByTestId("action-render-convert-index-to-remote-ignore-index-settings")).toHaveValue("index.refresh_interval");
    expect(screen.getByTestId("action-render-convert-index-to-remote-number-of-replicas")).toHaveValue(2);
  });

  it("returns correct content", () => {
    const uiAction = actionRepoSingleton.getUIAction("convert_index_to_remote");
    expect(uiAction.content()).toBe("Convert index to remote");
  });

  it("converts to action correctly", () => {
    const uiAction = actionRepoSingleton.getUIAction("convert_index_to_remote");
    const action = uiAction.toAction();

    expect(action).toHaveProperty("convert_index_to_remote");
    expect(action.convert_index_to_remote).toHaveProperty("repository");
    expect(action.convert_index_to_remote).toHaveProperty("snapshot");
    expect(action.convert_index_to_remote).toHaveProperty("include_aliases");
    expect(action.convert_index_to_remote).toHaveProperty("ignore_index_settings");
    expect(action.convert_index_to_remote).toHaveProperty("delete_original_index");
    expect(action.convert_index_to_remote).toHaveProperty("rename_pattern");
    expect(action.convert_index_to_remote).not.toHaveProperty("number_of_replicas");
  });

  it("keeps number_of_replicas when explicitly configured", () => {
    const uiAction = actionRepoSingleton.getUIActionFromData({
      convert_index_to_remote: {
        ...DEFAULT_CONVERT_INDEX_TO_REMOTE.convert_index_to_remote,
        number_of_replicas: 2,
      },
    });

    const action = uiAction.toAction() as ConvertIndexToRemoteAction;
    expect(action.convert_index_to_remote.number_of_replicas).toBe(2);
  });
});
