/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { EuiButton, EuiFormRow, EuiDragDropContext, EuiDroppable, EuiSpacer, EuiText, DropResult } from "@elastic/eui";
import EuiFormCustomLabel from "../../components/EuiFormCustomLabel";
import DraggableItem from "../../components/DraggableItem";
import { UITransition } from "../../../../../models/interfaces";
import { getConditionContent } from "../../utils/helpers";

interface TransitionsProps {
  transitions: UITransition[];
  onClickDeleteTransition: (idx: number) => void;
  onClickEditTransition: (transition: UITransition) => void;
  onDragEndTransitions: (dropResult: DropResult) => void;
  onClickAddTransition: () => void;
  useNewUx?: boolean;
}

const Transitions = ({
  transitions,
  onClickDeleteTransition,
  onClickEditTransition,
  onDragEndTransitions,
  onClickAddTransition,
  useNewUx,
}: TransitionsProps) => {
  return (
    <>
      <EuiFormCustomLabel
        title="Transitions"
        helpText="Transitions define the conditions that need to be met for a state to change. After all actions in the current state are completed, the policy starts checking the conditions for transitions."
      />
      {!!transitions.length && (
        <EuiFormRow fullWidth isInvalid={false} error={null}>
          <EuiDragDropContext onDragEnd={onDragEndTransitions}>
            <EuiDroppable droppableId="STATE_TRANSITIONS_DROPPABLE_AREA">
              {transitions.map((transition, idx) => (
                <DraggableItem
                  key={transition.id}
                  id={transition.id}
                  content={getConditionContent(transition.transition)}
                  idx={idx}
                  isLast={transitions.length - 1 === idx}
                  onClickDelete={() => onClickDeleteTransition(idx)}
                  onClickEdit={() => onClickEditTransition(transition)}
                  draggableType="transition"
                />
              ))}
            </EuiDroppable>
          </EuiDragDropContext>
        </EuiFormRow>
      )}

      <EuiSpacer size="s" />

      {!transitions.length && (
        <EuiText>
          <p style={{ backgroundColor: "#F5F7FA", padding: "5px" }}>
            <span style={{ color: "grey", fontWeight: 200, fontSize: "15px" }}>No transitions have been added.</span>
          </p>
        </EuiText>
      )}

      <EuiSpacer />

      <EuiButton onClick={onClickAddTransition} size={useNewUx ? "s" : undefined}>
        + Add Transition
      </EuiButton>
    </>
  );
};

export default Transitions;
