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
}

const Transitions = ({
  transitions,
  onClickDeleteTransition,
  onClickEditTransition,
  onDragEndTransitions,
  onClickAddTransition,
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

      <EuiButton onClick={onClickAddTransition}>+ Add Transition</EuiButton>
    </>
  );
};

export default Transitions;
