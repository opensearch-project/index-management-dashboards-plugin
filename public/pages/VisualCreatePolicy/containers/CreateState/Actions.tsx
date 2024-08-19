/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { EuiButton, EuiFormRow, EuiDragDropContext, EuiDroppable, EuiSpacer, EuiText, DropResult } from "@elastic/eui";
import DraggableItem from "../../components/DraggableItem";
import EuiFormCustomLabel from "../../components/EuiFormCustomLabel";
import { Action, UIAction } from "../../../../../models/interfaces";

interface ActionsProps {
  actions: UIAction<Action>[];
  onClickDeleteAction: (idx: number) => void;
  onClickEditAction: (action: UIAction<Action>) => void;
  onDragEndActions: (dropResult: DropResult) => void;
  onClickAddAction: () => void;
  useNewUx?: boolean;
}

const Actions = ({ actions, onClickDeleteAction, onClickEditAction, onDragEndActions, onClickAddAction, useNewUx }: ActionsProps) => {
  return (
    <>
      <EuiFormCustomLabel title="Actions" helpText="Actions are the operations ISM performs when an index is in a certain state." />

      {!!actions.length && (
        <EuiFormRow fullWidth isInvalid={false} error={null}>
          <EuiDragDropContext onDragEnd={onDragEndActions}>
            <EuiDroppable droppableId="STATE_ACTIONS_DROPPABLE_AREA">
              {actions.map((action, idx) => (
                <DraggableItem
                  key={action.id}
                  content={action.content()}
                  id={action.id}
                  idx={idx}
                  isLast={actions.length - 1 === idx}
                  onClickDelete={() => onClickDeleteAction(idx)}
                  onClickEdit={() => onClickEditAction(action)}
                  draggableType="action"
                />
              ))}
            </EuiDroppable>
          </EuiDragDropContext>
        </EuiFormRow>
      )}

      <EuiSpacer size="s" />

      {!actions.length && (
        <EuiText>
          <p style={{ backgroundColor: "#F5F7FA", padding: "5px" }}>
            <span style={{ color: "grey", fontWeight: 200, fontSize: "15px" }}>No actions have been added.</span>
          </p>
        </EuiText>
      )}

      <EuiSpacer />

      <EuiButton onClick={onClickAddAction} size={useNewUx ? "s" : undefined}>
        + Add action
      </EuiButton>
    </>
  );
};

export default Actions;
