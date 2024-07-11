/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { EuiAccordion, EuiText, EuiPanel, EuiFlexGroup, EuiFlexItem, EuiSmallButtonIcon, EuiToolTip } from "@elastic/eui";
import "brace/theme/github";
import "brace/mode/json";
import { State as StateData } from "../../../../../models/interfaces";
import { ModalConsumer } from "../../../../components/Modal";
import ConfirmationModal from "../../../../components/ConfirmationModal";
import Badge from "../Badge";
import TransitionContent from "../Transition/TransitionContent";
import { makeId } from "../../../../utils/helpers";
import { actionRepoSingleton } from "../../utils/helpers";

interface StateProps {
  state: StateData;
  isInitialState: boolean;
  idx: number;
  onClickEditState: (state: StateData) => void;
  onClickDeleteState: (idx: number) => void;
  isReadOnly: boolean;
}

const State = ({ state, isInitialState, idx, onClickEditState, onClickDeleteState, isReadOnly = false }: StateProps) => (
  <EuiAccordion
    style={{ padding: "15px" }}
    id={state.name}
    buttonClassName="state-accordion"
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
        {!!state.actions?.length && (
          <EuiFlexItem grow={false}>
            <Badge text="Actions" number={state.actions.length} />
          </EuiFlexItem>
        )}
        {!!state.transitions?.length && (
          <EuiFlexItem grow={false}>
            <Badge text="Transitions" number={state.transitions.length} />
          </EuiFlexItem>
        )}
      </EuiFlexGroup>
    }
    extraAction={
      !isReadOnly && (
        <EuiFlexGroup gutterSize="m">
          <EuiFlexItem grow={false}>
            <ModalConsumer>
              {({ onShow, onClose }) => (
                <EuiToolTip position="top" content={<p>Delete state</p>}>
                  <EuiSmallButtonIcon
                    iconType="trash"
                    aria-label="Delete"
                    color="danger"
                    onClick={() =>
                      onShow(ConfirmationModal, {
                        title: "Delete state",
                        bodyMessage: (
                          <EuiText>
                            <span>
                              Delete "<strong>{state.name}</strong>" permanently? Deleting the state will result in deleting all
                              transitions.
                            </span>
                          </EuiText>
                        ),
                        actionMessage: "Delete state",
                        actionProps: { color: "danger" },
                        modalProps: { maxWidth: 600 },
                        onAction: () => onClickDeleteState(idx),
                        onClose,
                      })
                    }
                    data-test-subj="state-delete-button"
                  />
                </EuiToolTip>
              )}
            </ModalConsumer>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiToolTip position="top" content={<p>Edit state</p>}>
              <EuiSmallButtonIcon iconType="pencil" aria-label="Edit" color="primary" onClick={() => onClickEditState(state)} />
            </EuiToolTip>
          </EuiFlexItem>
        </EuiFlexGroup>
      )
    }
    paddingSize="l"
  >
    <EuiFlexGroup direction="column" gutterSize="l">
      <EuiFlexItem grow={false}>
        <EuiText>
          <h4>Actions</h4>
        </EuiText>
      </EuiFlexItem>
      <EuiFlexItem>
        {!state.actions?.length ? (
          <EuiText>No actions. Edit state to add actions.</EuiText>
        ) : (
          <EuiFlexGroup wrap>
            {state.actions.map((action, index) => (
              <EuiFlexItem grow={false} key={`${makeId()}-${index}`}>
                <EuiPanel>{actionRepoSingleton.getUIActionFromData(action).content()}</EuiPanel>
              </EuiFlexItem>
            ))}
          </EuiFlexGroup>
        )}
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <EuiText>
          <h4>Transitions</h4>
        </EuiText>
      </EuiFlexItem>
      <EuiFlexItem>
        {!state.transitions?.length ? (
          <EuiText>No transitions. Edit state to add transitions.</EuiText>
        ) : (
          <EuiFlexGroup wrap>
            {state.transitions.map((transition, index) => (
              <EuiFlexItem grow={false} key={`${makeId()}-${index}`}>
                <EuiPanel>
                  <TransitionContent transition={transition} />
                </EuiPanel>
              </EuiFlexItem>
            ))}
          </EuiFlexGroup>
        )}
      </EuiFlexItem>
    </EuiFlexGroup>
  </EuiAccordion>
);

export default State;
