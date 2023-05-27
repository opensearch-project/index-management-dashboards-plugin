/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from "react";
import { EuiComboBox, EuiComboBoxOptionOption, EuiConfirmModal, EuiFormRow, EuiSpacer, EuiSwitch } from "@elastic/eui";
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
  openModal?: AliasActions;
}

export default class AliasUIActionComponent extends Component<AliasUIActionComponentProps, AliasUIActionComponentState> {
  constructor(props: AliasUIActionComponentProps) {
    super(props);

    const { selectedItems } = props;
    this.state = {
      addAliasToggle: selectedItems.add?.length > 0,
      removeAliasToggle: selectedItems.remove?.length > 0,
      openModal: undefined,
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

  onConfirmModal = () => {
    const { openModal } = this.state;
    switch (openModal) {
      case AliasActions.ADD:
        this.onAddAliasChange([]);
        break;
      case AliasActions.REMOVE:
        this.onRemoveAliasChange([]);
        break;
    }
    this.setState({
      ...this.state,
      // Disable the alias toggle
      [openModal + "AliasToggle"]: false,
      // Reset the modal
      openModal: undefined,
    });
  };

  renderModal = () => {
    const { selectedItems } = this.props;
    const { openModal } = this.state;
    const aliasCount = (selectedItems[openModal] || []).length;
    return (
      <EuiConfirmModal
        title={`Clear ${aliasCount} ${aliasCount > 1 ? "aliases" : "alias"}?`}
        cancelButtonText={"Cancel"}
        onCancel={() => {
          this.setState({
            ...this.state,
            // Reset the modal
            openModal: undefined,
          });
        }}
        confirmButtonText={"Clear"}
        onConfirm={this.onConfirmModal}
        data-test-subj={"clear-aliases-modal"}
      />
    );
  };

  render() {
    const { errors, selectedItems } = this.props;
    const { addAliasToggle, removeAliasToggle, openModal } = this.state;
    return (
      <>
        {openModal && this.renderModal()}

        <EuiSwitch
          label={"Add aliases"}
          checked={addAliasToggle}
          onChange={(e) => {
            // If the user disables the combo box while there are entries in it,
            // warn the user that they will be cleared
            if (addAliasToggle && selectedItems.add?.length > 0) this.setState({ ...this.state, openModal: AliasActions.ADD });
            else this.setState({ ...this.state, addAliasToggle: e.target.checked });
          }}
          data-test-subj={"add-alias-toggle"}
        />
        {addAliasToggle && (
          <>
            <EuiSpacer size={"m"} />
            <EuiFormRow
              label={"Select aliases to add to indexes"}
              fullWidth
              style={{ maxWidth: "100%" }}
              isInvalid={errors.add !== undefined}
              error={errors.add}
              data-test-subj={"add-alias-row"}
            >
              <>
                <EuiComboBox
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
            </EuiFormRow>
          </>
        )}

        <EuiSpacer size={"l"} />

        <EuiSwitch
          label={"Remove aliases"}
          checked={removeAliasToggle}
          onChange={(e) => {
            // If the user disables the combo box while there are entries in it,
            // warn the user that they will be cleared
            if (removeAliasToggle && selectedItems.remove?.length > 0) this.setState({ ...this.state, openModal: AliasActions.REMOVE });
            else this.setState({ ...this.state, removeAliasToggle: e.target.checked });
          }}
          data-test-subj={"remove-alias-toggle"}
        />
        {removeAliasToggle && (
          <>
            <EuiSpacer size={"m"} />
            <EuiFormRow
              label={"Select aliases to remove from indexes"}
              fullWidth
              style={{ maxWidth: "100%" }}
              isInvalid={errors.remove !== undefined}
              error={errors.remove}
              data-test-subj={"remove-alias-row"}
            >
              <>
                <EuiComboBox
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
            </EuiFormRow>
          </>
        )}
      </>
    );
  }
}
