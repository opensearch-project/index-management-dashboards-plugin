/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from "react";
import { EuiText, EuiLink, EuiIcon, EuiFlyoutBody, EuiFlyoutFooter, EuiTitle, EuiFormRow, EuiSpacer, EuiComboBox } from "@elastic/eui";
import { Transition as ITransition, UITransition } from "../../../../../models/interfaces";
import FlyoutFooter from "../../components/FlyoutFooter";
import EuiFormCustomLabel from "../../components/EuiFormCustomLabel";
import { makeId } from "../../../../utils/helpers";
import Transition from "../../components/Transition";
import { TRANSITION_DOCUMENTATION_URL } from "../../../../utils/constants";

interface CreateTransitionProps {
  editTransition: UITransition | null;
  onCloseCreateTransition: () => void;
  onClickSaveTransition: (uiTransition: UITransition) => void;
  stateOptions: string[];
  useNewUx?: boolean;
}

interface CreateTransitionState {
  uiTransition: UITransition | null;
}

export default class CreateTransition extends Component<CreateTransitionProps, CreateTransitionState> {
  constructor(props: CreateTransitionProps) {
    super(props);

    let uiTransition = props.editTransition;

    if (!uiTransition) {
      uiTransition = {
        transition: {
          state_name: "",
        },
        id: makeId(),
      };
    }

    this.state = { uiTransition };
  }

  onChange = (selectedOptions: { label: string }[]) => {
    // We should only get back either 0 or 1 options.
    const destinationState = selectedOptions.pop()?.label || "";
    const { uiTransition } = this.state;
    if (uiTransition == null) return;
    const newTransition: ITransition = { ...uiTransition.transition, state_name: destinationState };
    const newUiTransition = { ...uiTransition, transition: newTransition };
    this.setState({ uiTransition: newUiTransition });
  };

  onCreateOption = (searchValue: string) => {
    const normalizedSearchValue = searchValue.trim().toLowerCase();

    if (!normalizedSearchValue) {
      return;
    }

    const { uiTransition } = this.state;
    if (uiTransition == null) return;
    const newTransition: ITransition = { ...uiTransition.transition, state_name: normalizedSearchValue };
    const newUiTransition = { ...uiTransition, transition: newTransition };
    this.setState({ uiTransition: newUiTransition });
  };

  onChangeTransition = (uiTransition: UITransition) => {
    this.setState({ uiTransition });
  };

  onClickSaveTransition = () => {
    const { uiTransition } = this.state;
    if (!uiTransition) return;
    this.props.onClickSaveTransition(uiTransition);
  };

  render() {
    const { editTransition, onCloseCreateTransition, stateOptions, useNewUx } = this.props;
    const { uiTransition } = this.state;
    let title = "Add transition";
    if (!!editTransition) title = "Edit transition";
    return (
      <>
        <EuiFlyoutBody>
          <EuiTitle size="s">
            <h3>{title}</h3>
          </EuiTitle>

          <EuiText size="xs" style={{ fontWeight: 200 }}>
            Transitions define the conditions that need to be met for a state to change. After all actions in the current state are
            completed, the policy starts checking the conditions for transitions.{" "}
            <EuiLink href={TRANSITION_DOCUMENTATION_URL} target="_blank" rel="noopener noreferrer">
              Learn more
            </EuiLink>
          </EuiText>

          <EuiSpacer />

          <EuiFormCustomLabel
            title="Destination state"
            helpText="If entering a state that does not exist yet then you must create it before creating the policy."
          />

          <EuiFormRow fullWidth isInvalid={false} error={null}>
            <EuiComboBox
              compressed={useNewUx}
              fullWidth
              isClearable={false}
              placeholder="Select a single option"
              singleSelection={{ asPlainText: true }}
              options={stateOptions.map((state) => ({ label: state }))}
              selectedOptions={[{ label: uiTransition?.transition.state_name || "" }]}
              onChange={this.onChange}
              onCreateOption={this.onCreateOption}
              customOptionText="Add {searchValue} state"
            />
          </EuiFormRow>

          <EuiSpacer />

          {!!uiTransition && <Transition uiTransition={uiTransition} onChangeTransition={this.onChangeTransition} useNewUx={useNewUx} />}
        </EuiFlyoutBody>
        <EuiFlyoutFooter>
          <FlyoutFooter
            useNewUx={useNewUx}
            edit={!!editTransition}
            action="transition"
            onClickCancel={onCloseCreateTransition}
            onClickAction={this.onClickSaveTransition}
          />
        </EuiFlyoutFooter>
      </>
    );
  }
}
