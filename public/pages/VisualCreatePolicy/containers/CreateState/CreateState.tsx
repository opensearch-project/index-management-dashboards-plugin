/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component, ChangeEvent } from "react";
import {
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutFooter,
  EuiFlyoutHeader,
  EuiTitle,
  EuiFlexGroup,
  EuiFlexItem,
  EuiButtonEmpty,
  EuiButton,
  EuiFormRow,
  EuiFieldText,
  EuiHorizontalRule,
  euiDragDropReorder,
  DropResult,
  EuiSelect,
  EuiSpacer,
  EuiText,
  EuiPortal,
} from "@elastic/eui";
import { UIAction, Policy, State, Action, UITransition } from "../../../../../models/interfaces";
import CreateTransition from "../CreateTransition";
import CreateAction from "../CreateAction";
import Actions from "./Actions";
import Transitions from "./Transitions";
import { makeId } from "../../../../utils/helpers";
import { actionRepoSingleton, getOrderInfo } from "../../utils/helpers";

interface CreateStateProps {
  policy: Policy;
  onSaveState: (state: State, states: State[], order: string, afterBeforeState: string) => void;
  onCloseFlyout: () => void;
  state: State | null;
  useNewUx?: boolean;
}

interface CreateStateState {
  name: string;
  nameError: string;
  createAction: boolean;
  editAction: UIAction<Action> | null;
  createTransition: boolean;
  editTransition: UITransition | null;
  actions: UIAction<Action>[];
  transitions: UITransition[];
  afterBeforeState: string;
  order: string;
  disableOrderSelections: boolean;
}

export default class CreateState extends Component<CreateStateProps, CreateStateState> {
  constructor(props: CreateStateProps) {
    super(props);

    const { afterBeforeState, order, disableOrderSelections } = getOrderInfo(props.state, props.policy.states);
    this.state = {
      name: props.state?.name || "",
      nameError: "",
      createAction: false,
      editAction: null,
      createTransition: false,
      editTransition: null,
      actions: props.state?.actions?.map((action) => actionRepoSingleton.getUIActionFromData(action)) || [],
      transitions: props.state?.transitions?.map((transition) => ({ id: makeId(), transition })) || [],
      afterBeforeState,
      order,
      disableOrderSelections,
    };
  }

  onChangeStateName = (event: ChangeEvent<HTMLInputElement>) => {
    const { state, policy } = this.props;
    const name = event.target.value;
    const isEditing = !!this.props.state;
    let nameError = "";
    // If we are not editing a state or if we are editing and have changed the name
    if (!isEditing || (isEditing && name !== state?.name)) {
      // then check to make sure a state doesn't already exist in the policy with that name
      if (!!policy.states.find((state) => state.name === name)) {
        nameError = "A state with this name already exists.";
      }
    }

    this.setState({ name, nameError });
  };

  onDragEndActions = ({ source, destination }: DropResult) => {
    if (source && destination) {
      const items = euiDragDropReorder(this.state.actions, source.index, destination.index);
      this.setState({ actions: items });
    }
  };

  onDragEndTransitions = ({ source, destination }: DropResult) => {
    if (source && destination) {
      const items = euiDragDropReorder(this.state.transitions, source.index, destination.index);
      this.setState({ transitions: items });
    }
  };

  onClickDeleteAction = (idx: number) => {
    const { actions } = this.state;
    this.setState({ actions: actions.slice(0, idx).concat(actions.slice(idx + 1)) });
  };

  onClickEditAction = (action: UIAction<Action>) => this.setState({ editAction: action });

  onClickAddAction = () => this.setState({ createAction: true });

  onClickDeleteTransition = (idx: number) => {
    const { transitions } = this.state;
    this.setState({ transitions: transitions.slice(0, idx).concat(transitions.slice(idx + 1)) });
  };

  onClickEditTransition = (transition: UITransition) => this.setState({ editTransition: transition });

  onClickAddTransition = () => {
    this.setState({
      createTransition: true,
    });
  };

  onClickSaveTransition = (transition: UITransition) => {
    const { editTransition, transitions } = this.state;
    let newTransitions = [...transitions, transition];
    if (!!editTransition) {
      const foundTransitionIdx = transitions.findIndex(({ id }) => {
        return transition.id === id;
      });

      if (foundTransitionIdx >= 0) {
        newTransitions = transitions
          .slice(0, foundTransitionIdx)
          .concat(transition)
          .concat(transitions.slice(foundTransitionIdx + 1));
      }
    }
    this.setState((state) => ({
      transitions: newTransitions,
      createTransition: false,
      editTransition: null,
    }));
  };

  onClickSaveAction = (action: UIAction<Action>) => {
    const { editAction, actions } = this.state;
    if (action?.action) {
      let newActions = [...actions, action];
      if (!!editAction) {
        // Use edit action id instead of action id.. as current logic of editing an action can end
        // up with a new id if you switch action types, i.e. rollover -> delete will create a new class w/ a new id
        const foundActionIdx = actions.findIndex(({ id }) => editAction.id === id);
        if (foundActionIdx >= 0) {
          newActions = actions
            .slice(0, foundActionIdx)
            .concat(action)
            .concat(actions.slice(foundActionIdx + 1));
        }
      }
      this.setState({
        actions: newActions,
        editAction: null,
        createAction: false,
      });
    }
  };

  onClickCancelAction = () => {
    this.setState({ createAction: false, editAction: null });
  };

  onClickSaveState = () => {
    const { order, afterBeforeState } = this.state;
    const { onSaveState, policy } = this.props;
    onSaveState(
      {
        name: this.state.name,
        actions: this.state.actions.map((action) => action.toAction()),
        transitions: this.state.transitions.map((transition) => transition.transition),
      },
      policy.states,
      order,
      afterBeforeState
    );
  };

  renderDefault = () => {
    const { policy, state, useNewUx } = this.props;
    const { actions, name, nameError, afterBeforeState, order, disableOrderSelections } = this.state;
    // If we are editing a state filter it out from the selectable options
    const stateOptions = policy.states.map((state) => ({ value: state.name, text: state.name })).filter((s) => s.value !== state?.name);
    return (
      <>
        <EuiText>
          <h5>State name</h5>
          <span /> {/* Dummy span to get rid of last child styling on h5 */}
        </EuiText>

        <EuiFormRow fullWidth isInvalid={!!nameError} error={nameError}>
          <EuiFieldText
            compressed={useNewUx}
            fullWidth
            isInvalid={!!nameError}
            placeholder="sample_hot_state"
            readOnly={false}
            value={name}
            onChange={this.onChangeStateName}
            data-test-subj="create-state-state-name"
          />
        </EuiFormRow>

        <EuiSpacer />

        <EuiText>
          <h5>Order</h5>
          <span /> {/* Dummy span to get rid of last child styling on h5 */}
        </EuiText>

        <EuiFlexGroup>
          <EuiFlexItem>
            <EuiFormRow>
              <EuiSelect
                compressed={useNewUx}
                disabled={disableOrderSelections}
                options={[
                  { value: "after", text: "Add after" },
                  { value: "before", text: "Add before" },
                ]}
                value={order}
                onChange={(e) => this.setState({ order: e.target.value })}
                aria-label="Retry failed policy from"
              />
            </EuiFormRow>
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiFormRow>
              <EuiSelect
                compressed={useNewUx}
                disabled={disableOrderSelections}
                options={stateOptions}
                value={afterBeforeState}
                onChange={(e) => this.setState({ afterBeforeState: e.target.value })}
                aria-label="Retry failed policy from"
              />
            </EuiFormRow>
          </EuiFlexItem>
        </EuiFlexGroup>

        <EuiHorizontalRule />

        <Actions
          actions={actions}
          onClickDeleteAction={this.onClickDeleteAction}
          onClickEditAction={this.onClickEditAction}
          onDragEndActions={this.onDragEndActions}
          onClickAddAction={this.onClickAddAction}
          useNewUx={useNewUx}
        />

        <EuiHorizontalRule />

        <Transitions
          transitions={this.state.transitions}
          onDragEndTransitions={this.onDragEndTransitions}
          onClickDeleteTransition={this.onClickDeleteTransition}
          onClickEditTransition={this.onClickEditTransition}
          onClickAddTransition={this.onClickAddTransition}
          useNewUx={useNewUx}
        />
      </>
    );
  };

  renderDefaultFooter = () => {
    const { onCloseFlyout, state, useNewUx } = this.props;
    const { name, nameError } = this.state;
    const isEditing = !!state;
    return (
      <EuiFlexGroup justifyContent="spaceBetween">
        <EuiFlexItem grow={false}>
          <EuiButtonEmpty size={useNewUx ? "s" : undefined} iconType="cross" onClick={onCloseFlyout} flush="left">
            Cancel
          </EuiButtonEmpty>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiButton size={useNewUx ? "s" : undefined} fill disabled={!name.trim().length || !!nameError} onClick={this.onClickSaveState}>
            {isEditing ? "Update state" : "Save state"}
          </EuiButton>
        </EuiFlexItem>
      </EuiFlexGroup>
    );
  };

  render() {
    const { onCloseFlyout, policy, state, useNewUx } = this.props;
    const { name, createAction, editAction, createTransition, editTransition, actions } = this.state;
    const isEditing = !!state;

    let title = `${isEditing ? "Edit" : "Create"} state`;
    if (createTransition || createAction || !!editTransition || !!editAction) title = "State";
    if (name) title += `: ${name}`;

    // Filter out the current editing state if we are editing
    const stateOptions = policy.states.map((s) => s.name);

    let flyoutContent;
    if (createAction || !!editAction)
      flyoutContent = () => (
        <CreateAction
          actions={actions}
          editAction={editAction}
          stateName={name}
          onClickCancelAction={this.onClickCancelAction}
          onClickSaveAction={this.onClickSaveAction}
          useNewUx={useNewUx}
        />
      );
    if (createTransition || editTransition)
      flyoutContent = () => (
        <CreateTransition
          stateOptions={stateOptions}
          editTransition={editTransition}
          onCloseCreateTransition={() => this.setState({ createTransition: false, editTransition: null })}
          onClickSaveTransition={this.onClickSaveTransition}
          useNewUx={useNewUx}
        />
      );
    if (!flyoutContent)
      flyoutContent = () => (
        <>
          <EuiFlyoutBody>{this.renderDefault()}</EuiFlyoutBody>
          <EuiFlyoutFooter>{this.renderDefaultFooter()}</EuiFlyoutFooter>
        </>
      );
    return (
      <EuiPortal>
        <EuiFlyout hideCloseButton ownFocus={false} onClose={onCloseFlyout} maxWidth={600} size="m" aria-labelledby="flyoutTitle">
          <EuiFlyoutHeader hasBorder>
            <EuiTitle size="m">
              <h2 id="flyoutTitle">{title}</h2>
            </EuiTitle>
          </EuiFlyoutHeader>
          {flyoutContent()}
        </EuiFlyout>
      </EuiPortal>
    );
  }
}
