/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component, ChangeEvent } from "react";
import { EuiText, EuiLink, EuiFlyoutBody, EuiFlyoutFooter, EuiTitle, EuiFormRow, EuiSelect, EuiSpacer } from "@elastic/eui";
import { UIAction, Action } from "../../../../../models/interfaces";
import TimeoutRetrySettings from "../../components/TimeoutRetrySettings";
import { actionRepoSingleton, getActionOptions } from "../../utils/helpers";
import FlyoutFooter from "../../components/FlyoutFooter";
import EuiFormCustomLabel from "../../components/EuiFormCustomLabel";
import { ACTIONS_DOCUMENTATION_URL } from "../../../../utils/constants";

interface CreateActionProps {
  stateName: string;
  actions: UIAction<Action>[];
  editAction: UIAction<Action> | null;
  onClickCancelAction: () => void;
  onClickSaveAction: (action: UIAction<Action>) => void;
  useNewUx?: boolean;
}

interface CreateActionState {
  action: UIAction<Action> | null;
}

export default class CreateAction extends Component<CreateActionProps, CreateActionState> {
  constructor(props: CreateActionProps) {
    super(props);

    this.state = {
      action: props.editAction,
    };
  }

  // We are selecting a new action from the drop down and constructing a new UIAction
  // This should be ephemeral and not change the actual list of actions yet as they might click cancel so we put it separate
  onChangeSelectedAction = (event: ChangeEvent<HTMLSelectElement>) => {
    const selectedAction = event.target.value;
    const uiAction = actionRepoSingleton.getUIAction(selectedAction);
    this.setState({ action: uiAction });
  };

  onChangeAction = (action: UIAction<Action>) => {
    this.setState({ action });
  };

  onClickSaveAction = () => {
    const { action } = this.state;
    if (!action) return;
    this.props.onClickSaveAction(action);
  };

  render() {
    const { action } = this.state;
    const { editAction, useNewUx } = this.props;

    const actionOptions = getActionOptions(actionRepoSingleton);

    let bodyTitle = "Add action";
    if (!!editAction) bodyTitle = "Edit action";

    return (
      <>
        <EuiFlyoutBody>
          <EuiTitle size="s">
            <h3>{bodyTitle}</h3>
          </EuiTitle>

          <EuiText size="xs" style={{ fontWeight: 200 }}>
            Actions are the operations ISM performs when an index is in a certain state.{" "}
            <EuiLink href={ACTIONS_DOCUMENTATION_URL} target="_blank" rel="noopener noreferrer">
              Learn more
            </EuiLink>
          </EuiText>

          <EuiSpacer />

          <EuiFormCustomLabel title="Action type" helpText="Select the action you want to add to this state." />
          <EuiFormRow fullWidth isInvalid={false} error={null}>
            <EuiSelect
              compressed={useNewUx}
              fullWidth
              placeholder="Select action type"
              id="action-type"
              hasNoInitialSelection
              options={actionOptions}
              value={action?.type}
              style={{ textTransform: "capitalize" }}
              // This one below is for resetting to a new UIAction
              onChange={this.onChangeSelectedAction}
              data-test-subj="create-state-action-type"
            />
          </EuiFormRow>

          <EuiSpacer />

          {/*Below is for when the specific action renders have updated their config and want to update the UIAction*/}
          {/* So we should not be changing the id because it'll break the UI */}
          {action?.render(action, this.onChangeAction)}

          <EuiSpacer />

          {action && <TimeoutRetrySettings editAction={!!editAction} action={action} onChangeAction={this.onChangeAction} />}
        </EuiFlyoutBody>
        <EuiFlyoutFooter>
          <FlyoutFooter
            useNewUx={useNewUx}
            edit={!!editAction}
            action="action"
            disabledAction={!action || !action.isValid()}
            onClickCancel={this.props.onClickCancelAction}
            onClickAction={this.onClickSaveAction}
          />
        </EuiFlyoutFooter>
      </>
    );
  }
}
