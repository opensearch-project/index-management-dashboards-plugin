/*
 * SPDX-License-Identifier: Apache-2.0
 *
 * The OpenSearch Contributors require contributions made to
 * this file be licensed under the Apache-2.0 license or a
 * compatible open source license.
 *
 * Modifications Copyright OpenSearch Contributors. See
 * GitHub history for details.
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
  EuiDragDropContext,
  EuiDroppable,
  euiDragDropReorder,
  DropResult,
  EuiSelect,
  EuiSpacer,
  EuiText,
  EuiAccordion,
  EuiPanel,
} from "@elastic/eui";
import { UIAction, Policy, State, Action, UITransition } from "../../../../../models/interfaces";
import { actions } from "../../utils/constants";
import { UIActionFactory } from "../../utils/actions";
import { Transition } from "../../utils/transitions";
import DraggableAction from "../../components/DraggableAction";
import ActionFooter from "../../components/ActionFooter";
import DraggableTransition from "../../components/DraggableTransition";
import CreateTransition from "../CreateTransition";
import TimeoutRetrySettings from "../../components/TimeoutRetrySettings";

interface CreateStateProps {
  policy: Policy;
  onSaveState: (state: State) => void;
  onCloseFlyout: () => void;
  state: State | null;
}

interface CreateStateState {
  name: string;
  createAction: boolean;
  editAction: boolean;
  createTransition: boolean;
  editTransition: boolean;
  action: UIAction<Action> | null;
  actions: UIAction<Action>[];
  transition: UITransition | null;
  transitions: UITransition[];
}

const capitalizeFirstLetter = ([first, ...rest]: string, locale = navigator.language) => first.toLocaleUpperCase(locale) + rest.join("");

export default class CreateState extends Component<CreateStateProps, CreateStateState> {
  uiActionFactory: UIActionFactory;

  constructor(props: CreateStateProps) {
    super(props);

    this.uiActionFactory = new UIActionFactory();

    this.state = {
      name: props.state?.name || "",
      createAction: false,
      editAction: false,
      createTransition: false,
      editTransition: false,
      action: null,
      actions: props.state?.actions.map((action) => this.uiActionFactory.getUIActionFromData(action)) || [],
      transition: null,
      transitions: props.state?.transitions.map((transition) => new Transition(transition)) || [],
    };
  }

  onChangeStateName = (event: ChangeEvent<HTMLInputElement>) => {
    const name = event.target.value;
    this.setState((state) => ({ name }));
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

  // We are selecting a new action from the drop down and constructing a new UIAction
  // This should be ephemeral and not change the actual list of actions yet as they might click cancel so we put it separate
  onChangeAction = (event: ChangeEvent<HTMLSelectElement>) => {
    const selectedAction = event.target.value;
    const uiAction = this.uiActionFactory.getUIAction(selectedAction);
    this.setState({ action: uiAction });
  };

  renderDefault = () => {
    const { name } = this.state;
    return (
      <>
        <EuiFormRow
          fullWidth
          label={
            <EuiText>
              <h4>State name</h4>
            </EuiText>
          }
          isInvalid={false}
          error={null}
        >
          <EuiFieldText
            fullWidth
            isInvalid={false}
            placeholder="sample_hot_state"
            readOnly={false}
            value={name}
            onChange={this.onChangeStateName}
            data-test-subj="create-state-state-name"
          />
        </EuiFormRow>

        <EuiHorizontalRule />

        {this.renderActions()}

        <EuiHorizontalRule />

        {this.renderTransitions()}
      </>
    );
  };

  renderActions = () => {
    const { actions } = this.state;
    return (
      <>
        <EuiText>
          <h4>Actions</h4>
          <p>
            <span style={{ color: "grey", fontWeight: 200, fontSize: "15px" }}>
              Actions are the operations ISM performs when an index is in a certain state.
            </span>
          </p>
        </EuiText>
        {!!actions.length && (
          <EuiFormRow fullWidth isInvalid={false} error={null}>
            <EuiDragDropContext onDragEnd={this.onDragEndActions}>
              <EuiDroppable droppableId="STATE_ACTIONS_DROPPABLE_AREA">
                {actions.map((action, idx) => (
                  <DraggableAction
                    action={action}
                    idx={idx}
                    isLast={actions.length - 1 === idx}
                    onClickDeleteAction={() => {
                      this.setState({
                        actions: actions.slice(0, idx).concat(actions.slice(idx + 1)),
                      });
                    }}
                    onClickEditAction={() => {
                      console.log("Clicking on edit");
                      this.setState({
                        editAction: true,
                        action,
                      });
                    }}
                  />
                ))}
              </EuiDroppable>
            </EuiDragDropContext>
          </EuiFormRow>
        )}

        <EuiSpacer />

        {!actions.length && (
          <EuiText>
            <p style={{ backgroundColor: "#F5F7FA", padding: "5px" }}>
              <span style={{ color: "grey", fontWeight: 200, fontSize: "15px" }}>No actions have been added.</span>
            </p>
          </EuiText>
        )}

        <EuiSpacer />

        {/* TODO: plus icon isn't in this version of eui.. it's like a patch or minor version ahead */}
        <EuiButton onClick={() => this.setState({ createAction: true })}>+ Add action</EuiButton>
      </>
    );
  };

  renderAction = () => {
    const { editAction, action } = this.state;
    let title = "Create action";
    if (editAction) title = "Edit action";

    const actionOptions = actions.map((action) => {
      const key = Object.keys(action).pop() || "";
      return {
        value: key,
        text: key
          .split("_")
          .map((str) => capitalizeFirstLetter(str))
          .join(" "),
      };
    });

    return (
      <>
        <EuiTitle size="s">
          <h3>{title}</h3>
        </EuiTitle>

        <EuiSpacer />

        <EuiFormRow label="Action type" helpText="Select the action you want to add to this state." isInvalid={false} error={null}>
          <EuiSelect
            id="action-type"
            hasNoInitialSelection
            options={actionOptions}
            value={action?.type}
            style={{ textTransform: "capitalize" }}
            // This one below is for resetting to a new UIAction
            onChange={this.onChangeAction}
            data-test-subj="create-state-action-type"
          />
        </EuiFormRow>

        <EuiSpacer />

        {/*Below is for when the specific action renders have updated their config and want to update the UIAction*/}
        {/* So we should not be changing the id because it'll break the UI */}
        {action?.render(action, (action: UIAction<Action>) => {
          this.setState({ action });
        })}

        <EuiSpacer />

        {action && (
          <TimeoutRetrySettings
            editAction={editAction}
            action={action}
            onChangeAction={(action: UIAction<Action>) => this.setState({ action })}
          />
        )}
      </>
    );
  };

  renderTransitions = () => {
    const { transitions } = this.state;
    return (
      <>
        <EuiText>
          <h4>Transitions</h4>
          <p>
            <span style={{ color: "grey", fontWeight: 200, fontSize: "15px" }}>
              Transitions define the conditions that need to be met for a state to change. After all actions in the current state are
              completed, the policy starts checking the conditions for transitions.
            </span>
          </p>
        </EuiText>
        {!!transitions.length && (
          <EuiFormRow fullWidth isInvalid={false} error={null}>
            <EuiDragDropContext onDragEnd={this.onDragEndTransitions}>
              <EuiDroppable droppableId="STATE_TRANSITIONS_DROPPABLE_AREA">
                {transitions.map((transition, idx) => (
                  <DraggableTransition
                    transition={transition}
                    idx={idx}
                    isLast={transitions.length - 1 === idx}
                    onClickDeleteTransition={() => {
                      this.setState({
                        transitions: transitions.slice(0, idx).concat(transitions.slice(idx + 1)),
                      });
                    }}
                    onClickEditTransition={() => {
                      this.setState({
                        editTransition: true,
                        transition,
                      });
                    }}
                  />
                ))}
              </EuiDroppable>
            </EuiDragDropContext>
          </EuiFormRow>
        )}

        <EuiSpacer />

        {!transitions.length && (
          <EuiText>
            <p style={{ backgroundColor: "#F5F7FA", padding: "5px" }}>
              <span style={{ color: "grey", fontWeight: 200, fontSize: "15px" }}>No transitions have been added.</span>
            </p>
          </EuiText>
        )}

        <EuiSpacer />

        <EuiButton
          onClick={() =>
            this.setState({
              createTransition: true,
              transition: new Transition({
                state_name: "",
                conditions: {
                  // only one allowed at a time
                  min_index_age: "",
                  min_doc_count: 5,
                  min_size: "",
                  cron: {
                    cron: {
                      expression: "",
                      timezone: "",
                    },
                  },
                },
              }),
            })
          }
        >
          + Add Transition
        </EuiButton>
      </>
    );
  };

  renderDefaultFooter = () => {
    const { onCloseFlyout, onSaveState } = this.props;
    return (
      <EuiFlexGroup justifyContent="spaceBetween">
        <EuiFlexItem grow={false}>
          <EuiButtonEmpty iconType="cross" onClick={onCloseFlyout} flush="left">
            Close
          </EuiButtonEmpty>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          {/* TODO: & here? do we use that elsewhere? */}
          <EuiButton
            fill
            disabled={!this.state.name.trim().length}
            onClick={() => {
              onSaveState({
                name: this.state.name,
                actions: this.state.actions.map((action) => action.action),
                transitions: this.state.transitions.map((transition) => transition.transition),
              });
            }}
          >
            Save & close
          </EuiButton>
        </EuiFlexItem>
      </EuiFlexGroup>
    );
  };

  renderActionFooter = () => {
    const { editAction } = this.state;
    return (
      <ActionFooter
        editAction={editAction}
        onClickCancelAction={() => {
          this.setState({ createAction: false, editAction: false });
        }}
        onClickAddAction={() => {
          const { action } = this.state;
          if (action?.action) {
            let newActions = [...this.state.actions, action];
            if (editAction) {
              const foundActionIdx = this.state.actions.findIndex(({ id }) => {
                return action.id === id;
              });

              if (foundActionIdx >= 0) {
                newActions = this.state.actions
                  .slice(0, foundActionIdx)
                  .concat(action)
                  .concat(this.state.actions.slice(foundActionIdx + 1));
              }
            }
            this.setState((state) => ({
              actions: newActions,
              action: null,
              createAction: false,
              editAction: false,
            }));
          }
        }}
      />
    );
  };

  onClickAddTransition = () => {
    const { editTransition, transition, transitions } = this.state;
    let newTransitions = [...transitions, transition];
    if (editTransition) {
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
      transition: null,
      createTransition: false,
      editTransition: false,
    }));
  };

  render() {
    const { onCloseFlyout, policy } = this.props;
    const { name, createAction, editAction, createTransition, editTransition, transition } = this.state;

    let title = `Edit state: ${name}`;
    if (createTransition || createAction || editTransition || editAction) title = `State: ${name}`;

    const stateOptions = policy.states.map((state) => state.name);

    let flyoutContent;
    if (createAction || editAction)
      flyoutContent = () => (
        <>
          <EuiFlyoutBody>{this.renderAction()}</EuiFlyoutBody>
          <EuiFlyoutFooter>{this.renderActionFooter()}</EuiFlyoutFooter>
        </>
      );
    if (createTransition || editTransition)
      flyoutContent = () => (
        <CreateTransition
          stateOptions={stateOptions}
          edit={editTransition}
          transition={transition}
          onChangeTransition={(transition: UITransition) => this.setState({ transition })}
          onCloseCreateTransition={() => this.setState({ createTransition: false, editTransition: false })}
          onClickAddTransition={this.onClickAddTransition}
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
      <EuiFlyout
        ownFocus={false} // TODO: Temporary.. when it's true the flyout is also covered
        onClose={onCloseFlyout}
        maxWidth={600}
        size="m"
        aria-labelledby="flyoutTitle"
      >
        <EuiFlyoutHeader hasBorder>
          <EuiTitle size="m">
            <h2 id="flyoutTitle">{title}</h2>
          </EuiTitle>
        </EuiFlyoutHeader>
        {flyoutContent()}
      </EuiFlyout>
    );
  }
}
