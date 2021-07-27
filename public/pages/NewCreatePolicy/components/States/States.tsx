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

import React from "react";
import {
  EuiButton,
  EuiAccordion,
  EuiText,
  EuiPanel,
  EuiHorizontalRule,
  EuiFlexGroup,
  EuiFlexItem,
  EuiButtonIcon,
  EuiNotificationBadge,
  EuiTextColor,
  EuiSpacer,
} from "@elastic/eui";
import { ContentPanel } from "../../../../components/ContentPanel";
import "brace/theme/github";
import "brace/mode/json";
import { Policy, State as StateData } from "../../../../../models/interfaces";
import { UIActionFactory } from "../../utils/actions";
import { Transition } from "../../utils/transitions";

interface StateProps {
  state: StateData;
  isInitialState: boolean;
  idx: number;
  onClickEditState: (state: StateData) => void;
  onClickDeleteState: (idx: number) => void;
}

const SubduedBadge = ({ text, number }: { text: string; number: number }) => (
  <EuiText size="xs" textAlign="center">
    <EuiTextColor color="subdued">
      <p>
        {text}{" "}
        <EuiNotificationBadge size="s" color="subdued">
          {number}
        </EuiNotificationBadge>
      </p>
    </EuiTextColor>
  </EuiText>
);

// TODO: Move to top of APP and pass down w/ context? Or just repository
const uiActionFactory = new UIActionFactory();

const State = ({ state, isInitialState, idx, onClickEditState, onClickDeleteState }: StateProps) => (
  <EuiAccordion
    style={{ padding: "15px" }}
    id={state.name}
    buttonContent={
      <EuiFlexGroup justifyContent="center" alignItems="center">
        <EuiFlexItem grow={false}>
          <EuiText>
            <strong>{state.name}</strong>
          </EuiText>
        </EuiFlexItem>
        {isInitialState && (
          <EuiFlexItem grow={false}>
            <EuiPanel paddingSize="none">
              <EuiText size="xs" style={{ padding: "0px 10px" }}>
                Initial state
              </EuiText>
            </EuiPanel>
          </EuiFlexItem>
        )}
        {!!state.actions.length && (
          <EuiFlexItem grow={false}>
            <SubduedBadge text="Actions" number={state.actions.length} />
          </EuiFlexItem>
        )}
        {!!state.transitions.length && (
          <EuiFlexItem grow={false}>
            <SubduedBadge text="Transitions" number={state.transitions.length} />
          </EuiFlexItem>
        )}
      </EuiFlexGroup>
    }
    extraAction={
      <EuiFlexGroup gutterSize="m">
        <EuiFlexItem grow={false}>
          <EuiButtonIcon iconType="trash" aria-label="Delete" color="danger" onClick={() => onClickDeleteState(idx)} />
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiButtonIcon iconType="pencil" aria-label="Edit" color="primary" onClick={() => onClickEditState(state)} />
        </EuiFlexItem>
      </EuiFlexGroup>
    }
    paddingSize="l"
  >
    <EuiFlexGroup direction="column">
      <EuiFlexItem grow={false}>Actions</EuiFlexItem>
      <EuiFlexItem>
        <EuiFlexGroup>
          {!state.actions.length && <EuiText>No actions. Edit state to add actions.</EuiText>}
          {state.actions.map((action) => (
            <EuiFlexItem grow={false}>
              <EuiPanel>{uiActionFactory.getUIActionFromData(action).content()}</EuiPanel>
            </EuiFlexItem>
          ))}
        </EuiFlexGroup>
      </EuiFlexItem>
      <EuiFlexItem grow={false}>Transitions</EuiFlexItem>
      <EuiFlexItem>
        <EuiFlexGroup>
          {!state.transitions.length && <EuiText>No transitions. Edit state to add transitions.</EuiText>}
          {state.transitions.map((transition) => (
            <EuiFlexItem grow={false}>
              <EuiPanel>{Transition.content(transition)}</EuiPanel>
            </EuiFlexItem>
          ))}
        </EuiFlexGroup>
      </EuiFlexItem>
    </EuiFlexGroup>
  </EuiAccordion>
);

interface StatesProps {
  onOpenFlyout: () => void;
  policy: Policy;
  onClickEditState: (state: StateData) => void;
  onClickDeleteState: (idx: number) => void;
}

const States = ({ onOpenFlyout, policy, onClickEditState, onClickDeleteState }: StatesProps) => (
  <ContentPanel bodyStyles={{ padding: "initial" }} title={`States (${policy.states.length})`} titleSize="s">
    <div style={{ padding: "0px 10px" }}>
      <div>
        {policy.states.map((state, idx) => (
          <>
            <State
              key={state.name}
              idx={idx}
              state={state}
              isInitialState={state.name === policy.default_state}
              onClickEditState={onClickEditState}
              onClickDeleteState={onClickDeleteState}
            />
            <EuiHorizontalRule margin="none" />
          </>
        ))}
      </div>

      <EuiSpacer />

      <EuiButton onClick={() => onOpenFlyout()}>Add state</EuiButton>
    </div>
  </ContentPanel>
);

export default States;
