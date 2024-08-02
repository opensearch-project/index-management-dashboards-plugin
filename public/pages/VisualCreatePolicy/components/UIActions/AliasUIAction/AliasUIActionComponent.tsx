/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from "react";
import { EuiCompressedComboBox, EuiComboBoxOptionOption, EuiCompressedFormRow, EuiSpacer, EuiCompressedSwitch } from "@elastic/eui";
import { AliasAction, AliasActionItem, AliasActions, UIAction } from "../../../../../../models/interfaces";
import AliasUIAction, { MAX_ALIAS_ACTIONS } from "./AliasUIAction";
import { inputLimitText } from "../../../../CreatePolicy/utils/helpers";

export interface AliasUIActionComponentProps {
  action: AliasAction;
  clone: (action: AliasAction) => AliasUIAction;
  errors: { [key in AliasActions]: string | undefined };
  onChangeAction: (uiAction: UIAction<AliasAction>) => void;
  selectedItems: { [key in AliasActions]: EuiComboBoxOptionOption<AliasActionItem>[] };
}

export interface AliasUIActionComponentState {
  addAliasToggle: boolean;
  removeAliasToggle: boolean;
}

export default class AliasUIActionComponent extends Component<AliasUIActionComponentProps, AliasUIActionComponentState> {
  constructor(props: AliasUIActionComponentProps) {
    super(props);

    const { selectedItems } = props;
    this.state = {
      addAliasToggle: selectedItems.add?.length > 0,
      removeAliasToggle: selectedItems.remove?.length > 0,
    };
  }

  componentDidMount() {
    // TODO: Implement functionality to retrieve, and populate the combo boxes with any pre-existing aliases.
  }

  onCreateOption = (value: string, options: EuiComboBoxOptionOption<AliasActionItem>[], aliasAction: AliasActions) => {
    const { action, clone, onChangeAction } = this.props;
    options.push({ label: value });
    const aliasActions = action.alias.actions.concat(this.parseToAliasActionItems(options, aliasAction));
    onChangeAction(clone({ ...action, alias: { actions: aliasActions } }));
  };

  parseToAliasActionItems = (options: EuiComboBoxOptionOption<AliasActionItem>[], aliasActionType = AliasActions.ADD) => {
    return options.map((option) => ({ [aliasActionType]: { alias: option.label } })) as AliasActionItem[];
  };

  onAddAliasChange = (options = []) => {
    const { action, clone, selectedItems, onChangeAction } = this.props;
    const parsedOptions = this.parseToAliasActionItems(options, AliasActions.ADD);
    const parseSelectedItems = this.parseToAliasActionItems(selectedItems.remove || [], AliasActions.REMOVE);
    onChangeAction(
      clone({
        ...action,
        alias: {
          // Consolidating the changed options with the existing options in the other combo box
          actions: parsedOptions.concat(parseSelectedItems),
        },
      })
    );
  };

  onRemoveAliasChange = (options) => {
    const { action, clone, selectedItems, onChangeAction } = this.props;
    const parsedOptions = this.parseToAliasActionItems(options, AliasActions.REMOVE);
    const parseSelectedItems = this.parseToAliasActionItems(selectedItems.add || [], AliasActions.ADD);
    onChangeAction(
      clone({
        ...action,
        alias: {
          // Consolidating the changed options with the existing options in the other combo box
          actions: parsedOptions.concat(parseSelectedItems),
        },
      })
    );
  };

  render() {
    const { errors, selectedItems } = this.props;
    const { addAliasToggle, removeAliasToggle } = this.state;
    return (
      <>
        <EuiCompressedSwitch
          label={"Add aliases"}
          checked={addAliasToggle}
          onChange={(e) => {
            // If the user disables the combo box while there are entries in it, clear the inputs
            if (addAliasToggle && selectedItems.add?.length > 0) this.onAddAliasChange([]);
            this.setState({ ...this.state, addAliasToggle: e.target.checked });
          }}
          data-test-subj={"add-alias-toggle"}
        />
        {addAliasToggle && (
          <>
            <EuiSpacer size={"m"} />
            <EuiCompressedFormRow
              label={"Select aliases to add to indexes"}
              fullWidth
              style={{ maxWidth: "100%" }}
              isInvalid={errors.add !== undefined}
              error={errors.add}
              data-test-subj={"add-alias-row"}
            >
              <>
                <EuiCompressedComboBox
                  placeholder={"Enter aliases to add"}
                  noSuggestions={true}
                  selectedOptions={selectedItems.add || []}
                  onCreateOption={
                    // Disable adding more options if input limit is reached
                    (selectedItems.add || []).length < MAX_ALIAS_ACTIONS &&
                    ((searchValue, options) => this.onCreateOption(searchValue, options, AliasActions.ADD))
                  }
                  onChange={(options) => this.onAddAliasChange(options)}
                  isInvalid={errors.add !== undefined}
                  data-test-subj={"add-alias-combo-box"}
                />
                {inputLimitText(selectedItems.add?.length, MAX_ALIAS_ACTIONS, "alias", "aliases")}
              </>
            </EuiCompressedFormRow>
          </>
        )}

        <EuiSpacer size={"l"} />

        <EuiCompressedSwitch
          label={"Remove aliases"}
          checked={removeAliasToggle}
          onChange={(e) => {
            // If the user disables the combo box while there are entries in it, clear the inputs
            if (removeAliasToggle && selectedItems.remove?.length > 0) this.onRemoveAliasChange([]);
            this.setState({ ...this.state, removeAliasToggle: e.target.checked });
          }}
          data-test-subj={"remove-alias-toggle"}
        />
        {removeAliasToggle && (
          <>
            <EuiSpacer size={"m"} />
            <EuiCompressedFormRow
              label={"Select aliases to remove from indexes"}
              fullWidth
              style={{ maxWidth: "100%" }}
              isInvalid={errors.remove !== undefined}
              error={errors.remove}
              data-test-subj={"remove-alias-row"}
            >
              <>
                <EuiCompressedComboBox
                  placeholder={"Enter aliases to remove"}
                  noSuggestions={true}
                  selectedOptions={selectedItems.remove || []}
                  onCreateOption={
                    // Disable adding more options if input limit is reached
                    (selectedItems.remove || []).length < MAX_ALIAS_ACTIONS &&
                    ((searchValue, options) => this.onCreateOption(searchValue, options, AliasActions.REMOVE))
                  }
                  onChange={(options) => this.onRemoveAliasChange(options)}
                  isInvalid={errors.remove !== undefined}
                  data-test-subj={"remove-alias-combo-box"}
                />
                {inputLimitText(selectedItems.remove?.length, MAX_ALIAS_ACTIONS, "alias", "aliases")}
              </>
            </EuiCompressedFormRow>
          </>
        )}
      </>
    );
  }
}
