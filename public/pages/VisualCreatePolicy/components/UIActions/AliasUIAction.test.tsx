/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import "@testing-library/jest-dom";
import { render, screen, cleanup } from "@testing-library/react";
import { DEFAULT_ALIAS } from "../../utils/constants";
import { AliasAction, AliasActions, UIAction } from "../../../../../models/interfaces";
import { actionRepoSingleton } from "../../utils/helpers";

const TEST_PROPS: UIAction<AliasAction> = { action: DEFAULT_ALIAS } as UIAction<AliasAction>;

const renderComponent = (uiAction: UIAction<AliasAction> = TEST_PROPS) => {
  render(actionRepoSingleton.getUIAction("alias").render(uiAction, mockOnChangeAction));
};
const mockOnChangeAction = (uiAction: UIAction<AliasAction> = TEST_PROPS) => {
  cleanup();
  renderComponent(uiAction);
};

afterEach(() => cleanup());

describe("AliasUIAction component", () => {
  it("renders with blank action", () => {
    const { container } = render(actionRepoSingleton.getUIAction("alias").render(TEST_PROPS, mockOnChangeAction));

    const addAliasRow = screen.getByTestId("add-alias-row");
    const removeAliasRow = screen.getByTestId("remove-alias-row");

    expect(addAliasRow).toHaveTextContent("Aliases to add");
    expect(addAliasRow).toHaveTextContent("The provided aliases will be applied to the manage index.");
    expect(addAliasRow).toHaveTextContent("You can add up to 10 more aliases.");

    expect(removeAliasRow).toHaveTextContent("Aliases to remove");
    expect(removeAliasRow).toHaveTextContent("The provided aliases will be removed from the manage index.");
    expect(removeAliasRow).toHaveTextContent("You can add up to 10 more aliases.");

    expect(container).toMatchSnapshot();
  });

  it("renders with pre-defined actions", () => {
    const actions = [
      { [AliasActions.ADD]: { alias: "alias1" } },
      { [AliasActions.ADD]: { alias: "alias3" } },
      { [AliasActions.REMOVE]: { alias: "alias2" } },
      { [AliasActions.ADD]: { aliases: ["alias5", "alias7", "alias9"] } },
      { [AliasActions.REMOVE]: { aliases: ["alias4", "alias6", "alias8"] } },
    ];
    const testProps = { ...TEST_PROPS };
    testProps.action.alias.actions = actions;

    const { container } = render(actionRepoSingleton.getUIAction("alias").render(testProps, mockOnChangeAction));
    expect(screen.getByTestId("add-alias-row")).toHaveTextContent("You can add up to 5 more aliases.");
    expect(screen.getByTestId("remove-alias-row")).toHaveTextContent("You can add up to 6 more aliases.");

    const addAliasComboBox = screen.getByTestId("add-alias-combo-box");
    const removeAliasComboBox = screen.getByTestId("remove-alias-combo-box");
    actions.forEach((action) => {
      switch (Object.keys(action)[0]) {
        case AliasActions.ADD:
          if (action[AliasActions.ADD].alias) expect(addAliasComboBox).toHaveTextContent(action[AliasActions.ADD].alias);
          if (action[AliasActions.ADD].aliases)
            action[AliasActions.ADD].aliases.forEach((alias) => {
              expect(addAliasComboBox).toHaveTextContent(alias);
            });
          break;
        case AliasActions.REMOVE:
          if (action[AliasActions.REMOVE].alias) expect(removeAliasComboBox).toHaveTextContent(action[AliasActions.REMOVE].alias);
          if (action[AliasActions.REMOVE].aliases)
            action[AliasActions.REMOVE].aliases.forEach((alias) => {
              expect(removeAliasComboBox).toHaveTextContent(alias);
            });
          break;
      }
    });

    expect(container).toMatchSnapshot();
  });
});
