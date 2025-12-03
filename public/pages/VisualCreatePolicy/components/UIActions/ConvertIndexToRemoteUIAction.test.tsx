/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import "@testing-library/jest-dom";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import userEventModule from "@testing-library/user-event";
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
  const userEvent = userEventModule.setup();

  it("renders with default values", () => {
    const { container } = render(actionRepoSingleton.getUIAction("convert_index_to_remote").render(TEST_PROPS, mockOnChangeAction));

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

    // Check that ignore_index_settings field exists
    const ignoreIndexSettingsInput = screen.getByTestId("action-render-convert-index-to-remote-ignore-index-settings");
    expect(ignoreIndexSettingsInput).toBeInTheDocument();
    expect(ignoreIndexSettingsInput).toHaveValue("");

    // Check that number_of_replicas field exists
    const numberOfReplicasInput = screen.getByTestId("action-render-convert-index-to-remote-number-of-replicas");
    expect(numberOfReplicasInput).toBeInTheDocument();
    expect(numberOfReplicasInput).toHaveValue(0);

    expect(container).toMatchSnapshot();
  });

  it("updates repository value on change", async () => {
    renderComponent();

    const repositoryInput = screen.getByTestId("action-render-convert-index-to-remote-repository");
    await userEvent.clear(repositoryInput);
    await userEvent.type(repositoryInput, "my-remote-repo");

    expect(repositoryInput).toHaveValue("my-remote-repo");
  });

  it("updates snapshot value on change", async () => {
    renderComponent();

    const snapshotInput = screen.getByTestId("action-render-convert-index-to-remote-snapshot");
    await userEvent.clear(snapshotInput);
    await userEvent.type(snapshotInput, "{{ctx.index}}");

    expect(snapshotInput).toHaveValue("{{ctx.index}}");
  });

  it("toggles include_aliases switch", async () => {
    renderComponent();

    const includeAliasesSwitch = screen.getByTestId("action-render-convert-index-to-remote-include-aliases");
    expect(includeAliasesSwitch).not.toBeChecked();

    await userEvent.click(includeAliasesSwitch);
    expect(includeAliasesSwitch).toBeChecked();
  });

  it("updates ignore_index_settings value on change", async () => {
    renderComponent();

    const ignoreIndexSettingsInput = screen.getByTestId("action-render-convert-index-to-remote-ignore-index-settings");
    await userEvent.type(ignoreIndexSettingsInput, "index.refresh_interval,index.number_of_replicas");

    expect(ignoreIndexSettingsInput).toHaveValue("index.refresh_interval,index.number_of_replicas");
  });

  it("updates number_of_replicas value on change", async () => {
    renderComponent();

    const numberOfReplicasInput = screen.getByTestId("action-render-convert-index-to-remote-number-of-replicas");
    await userEvent.clear(numberOfReplicasInput);
    await userEvent.type(numberOfReplicasInput, "2");

    expect(numberOfReplicasInput).toHaveValue(2);
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
  });

  it("renders with custom values", () => {
    const customAction: ConvertIndexToRemoteAction = {
      convert_index_to_remote: {
        repository: "s3-repo",
        snapshot: "{{ctx.index}}-snapshot",
        include_aliases: true,
        ignore_index_settings: "index.refresh_interval",
        number_of_replicas: 2,
      },
    };

    const customProps = { ...TEST_PROPS, action: customAction };
    const { container } = render(
      actionRepoSingleton.getUIAction("convert_index_to_remote").render(customProps, mockOnChangeAction)
    );

    expect(screen.getByTestId("action-render-convert-index-to-remote-repository")).toHaveValue("s3-repo");
    expect(screen.getByTestId("action-render-convert-index-to-remote-snapshot")).toHaveValue("{{ctx.index}}-snapshot");
    expect(screen.getByTestId("action-render-convert-index-to-remote-include-aliases")).toBeChecked();
    expect(screen.getByTestId("action-render-convert-index-to-remote-ignore-index-settings")).toHaveValue("index.refresh_interval");
    expect(screen.getByTestId("action-render-convert-index-to-remote-number-of-replicas")).toHaveValue(2);

    expect(container).toMatchSnapshot();
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
    expect(action.convert_index_to_remote).toHaveProperty("number_of_replicas");
  });
});

