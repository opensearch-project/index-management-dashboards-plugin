/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { EuiComboBox, EuiComboBoxOptionOption, EuiFormRow, EuiSpacer } from "@elastic/eui";
import EuiFormCustomLabel from "../EuiFormCustomLabel";
import { AliasAction, AliasActionItem, AliasActions, UIAction } from "../../../../../models/interfaces";
import { ActionType } from "../../utils/constants";
import { makeId } from "../../../../utils/helpers";
import { ALIAS_NAMING_MESSAGE, ALIAS_NAMING_PATTERN } from "../../../../utils/constants";
import { inputLimitText } from "../../../CreatePolicy/utils/helpers";

export const MAX_ALIAS_ACTIONS = 10;
export const DUPLICATED_ALIAS_TEXT = "An alias cannot be added and removed in the same action.";

export default class AliasUIAction implements UIAction<AliasAction> {
  id: string;
  action: AliasAction;
  type = ActionType.Alias;

  constructor(action: AliasAction, id: string = makeId()) {
    this.action = action;
    this.id = id;
  }

  content = () => "Alias";

  clone = (action: AliasAction = this.action) => new AliasUIAction(action, this.id);

  isValid = () => {
    // Either add/remove has at least 1 action
    if (this.action.alias.actions.length === 0) return false;

    // No errors for any alias actions
    return !Object.entries(this.getAliasActionErrorText(this.parseToComboBoxOptions(this.action))).some(
      ([aliasActionType, error]) => error
    );
  };

  getAliasActionErrorText = (selectedItems: { [key in AliasActions]: EuiComboBoxOptionOption<AliasActionItem>[] }) => {
    const errors: { [key in AliasActions]: string | undefined } = {};

    // Each alias is valid
    let aliasError: string | undefined;
    this.action.alias.actions.forEach((action) => {
      const aliasActionType = Object.keys(action)[0];
      aliasError = this.getAliasErrorText(action, selectedItems);
      errors[aliasActionType] = aliasError;
    });
    return errors;
  };

  getAliasErrorText = (
    action: AliasActionItem,
    selectedItems: { [key in AliasActions]: EuiComboBoxOptionOption<AliasActionItem>[] }
  ): string | undefined => {
    const aliasActionType = Object.keys(action)[0] as AliasActions;

    // Validate alias string.
    const alias = action[aliasActionType].alias;
    if (alias && !ALIAS_NAMING_PATTERN.test(alias)) return ALIAS_NAMING_MESSAGE;

    // No duplicate aliases between add and remove actions
    switch (aliasActionType) {
      case AliasActions.ADD:
        if ((selectedItems[AliasActions.REMOVE] || []).some((option) => option?.label === alias)) return DUPLICATED_ALIAS_TEXT;
        break;
      case AliasActions.REMOVE:
        if ((selectedItems[AliasActions.ADD] || []).some((option) => option?.label === alias)) return DUPLICATED_ALIAS_TEXT;
        break;
    }
  };

  onCreateOption = (
    value: string,
    options: EuiComboBoxOptionOption<AliasActionItem>[],
    onChangeAction: (uiAction: UIAction<AliasAction>) => void,
    aliasAction: AliasActions
  ) => {
    options.push({ label: value });
    const aliasActions = this.action.alias.actions.concat(this.parseToAliasActionItems(options, aliasAction));
    onChangeAction(this.clone({ ...this.action, alias: { actions: aliasActions } }));
  };

  parseToAliasActionItems = (options: EuiComboBoxOptionOption<AliasActionItem>[], aliasActionType = AliasActions.ADD) => {
    return options.map((option) => ({ [aliasActionType]: { alias: option.label } })) as AliasActionItem[];
  };

  parseToComboBoxOptions = (aliasAction: AliasAction) => {
    const allOptions: { [key in AliasActions]: EuiComboBoxOptionOption<AliasActionItem>[] } = {};
    aliasAction.alias.actions?.forEach((action) => {
      const aliasActionType = Object.keys(action)[0] as AliasActions;
      if (!allOptions[aliasActionType]) allOptions[aliasActionType] = [];
      if (action[aliasActionType].alias) allOptions[aliasActionType].push({ label: action[aliasActionType]?.alias });

      // When retrieving an existing policy from the backend, the GetPolicy API returns an AliasActionItem with a string[]
      // called "aliases" for each of the aliases configured in the action. Each string[] contains 1 alias.
      // This IF block checks for that as it indicates a policy is being edited.
      if (action[aliasActionType].aliases)
        allOptions[aliasActionType] = allOptions[aliasActionType].concat(
          action[aliasActionType].aliases.map((alias) => ({ label: alias }))
        );
    });
    return allOptions;
  };

  render = (uiAction: UIAction<AliasAction>, onChangeAction: (uiAction: UIAction<AliasAction>) => void) => {
    const selectedItems = this.parseToComboBoxOptions(uiAction.action);
    return (
      <>
        <EuiFormRow
          fullWidth
          style={{ maxWidth: "100%" }}
          isInvalid={!this.isValid()}
          error={this.getAliasActionErrorText(selectedItems).add}
          data-test-subj={"add-alias-row"}
        >
          <>
            <EuiFormCustomLabel
              title={"Aliases to add"}
              helpText={"The provided aliases will be applied to the manage index."}
              isInvalid={this.getAliasActionErrorText(selectedItems).add}
            />
            <EuiComboBox
              placeholder={"Enter aliases to apply"}
              noSuggestions={true}
              selectedOptions={selectedItems.add || []}
              onCreateOption={
                // Disable adding more options if input limit is reached
                (selectedItems.add || []).length < MAX_ALIAS_ACTIONS &&
                ((searchValue, options) => this.onCreateOption(searchValue, options, onChangeAction, AliasActions.ADD))
              }
              onChange={(options) => {
                const parsedOptions = this.parseToAliasActionItems(options, AliasActions.ADD);
                const parseSelectedItems = this.parseToAliasActionItems(selectedItems.remove || [], AliasActions.REMOVE);
                onChangeAction(
                  this.clone({
                    ...uiAction.action,
                    alias: {
                      // Consolidating the changed options with the existing options in the other combo box
                      actions: parsedOptions.concat(parseSelectedItems),
                    },
                  })
                );
              }}
              isInvalid={this.getAliasActionErrorText(selectedItems).add !== undefined}
              data-test-subj={"add-alias-combo-box"}
            />
            {inputLimitText(selectedItems.add?.length, MAX_ALIAS_ACTIONS, "alias", "aliases")}
          </>
        </EuiFormRow>

        <EuiSpacer size={"s"} />

        <EuiFormRow
          fullWidth
          style={{ maxWidth: "100%" }}
          isInvalid={!this.isValid()}
          error={this.getAliasActionErrorText(selectedItems).remove}
          data-test-subj={"remove-alias-row"}
        >
          <>
            <EuiFormCustomLabel
              title={"Aliases to remove"}
              helpText={"The provided aliases will be removed from the manage index."}
              isInvalid={this.getAliasActionErrorText(selectedItems).remove}
            />
            <EuiComboBox
              placeholder={"Enter aliases to remove"}
              noSuggestions={true}
              selectedOptions={selectedItems.remove || []}
              onCreateOption={
                // Disable adding more options if input limit is reached
                (selectedItems.remove || []).length < MAX_ALIAS_ACTIONS &&
                ((searchValue, options) => this.onCreateOption(searchValue, options, onChangeAction, AliasActions.REMOVE))
              }
              onChange={(options) => {
                const parsedOptions = this.parseToAliasActionItems(options, AliasActions.REMOVE);
                const parseSelectedItems = this.parseToAliasActionItems(selectedItems.add || [], AliasActions.ADD);
                onChangeAction(
                  this.clone({
                    ...uiAction.action,
                    alias: {
                      // Consolidating the changed options with the existing options in the other combo box
                      actions: parsedOptions.concat(parseSelectedItems),
                    },
                  })
                );
              }}
              isInvalid={this.getAliasActionErrorText(selectedItems).remove !== undefined}
              data-test-subj={"remove-alias-combo-box"}
            />
            {inputLimitText(selectedItems.remove?.length, MAX_ALIAS_ACTIONS, "alias", "aliases")}
          </>
        </EuiFormRow>
      </>
    );
  };

  toAction = () => this.action;
}
