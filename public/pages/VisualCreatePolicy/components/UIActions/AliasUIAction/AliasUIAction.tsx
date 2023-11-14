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
import { EuiComboBoxOptionOption } from "@elastic/eui";
import { AliasAction, AliasActionItem, AliasActions, UIAction } from "../../../../../../models/interfaces";
import { ActionType } from "../../../utils/constants";
import { makeId } from "../../../../../utils/helpers";
import { ALIAS_NAMING_MESSAGE, ALIAS_NAMING_PATTERN } from "../../../../../utils/constants";
import AliasUIActionComponent from "./AliasUIActionComponent";

export const MAX_ALIAS_ACTIONS = 10;
export const DUPLICATED_ALIAS_TEXT = "An alias cannot be added and removed in the same action.";

export default class AliasUIAction implements UIAction<AliasAction> {
  customDisplayText = "Add / remove aliases";
  id: string;
  action: AliasAction;
  type = ActionType.Alias;
  errors: { [key in AliasActions]: string | undefined } = {};
  selectedItems: { [key in AliasActions]: Array<EuiComboBoxOptionOption<AliasActionItem>> } = {};

  constructor(action: AliasAction, id: string = makeId()) {
    this.action = action;
    this.id = id;
    this.selectedItems = this.parseToComboBoxOptions(action);
    this.errors = this.getAliasActionErrorText(this.selectedItems);
  }

  content = () => this.customDisplayText;

  clone = (action: AliasAction = this.action) => new AliasUIAction(action, this.id);

  isValid = () => {
    // Either add/remove has at least 1 action
    if (this.action.alias.actions.length === 0) return false;

    // No errors for any alias actions
    return !Object.entries(this.errors).some(([_, error]) => error);
  };

  getAliasActionErrorText = (selectedItems: { [key in AliasActions]: Array<EuiComboBoxOptionOption<AliasActionItem>> }) => {
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
    selectedItems: { [key in AliasActions]: Array<EuiComboBoxOptionOption<AliasActionItem>> }
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

  parseToComboBoxOptions = (aliasAction: AliasAction) => {
    const allOptions: { [key in AliasActions]: Array<EuiComboBoxOptionOption<AliasActionItem>> } = {};
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
    return (
      <AliasUIActionComponent
        action={uiAction.action}
        clone={this.clone}
        errors={this.errors}
        onChangeAction={onChangeAction}
        selectedItems={this.selectedItems}
      />
    );
  };

  toAction = () => this.action;
}
