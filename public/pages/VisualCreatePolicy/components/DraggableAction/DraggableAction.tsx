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
import { EuiFlexGroup, EuiFlexItem, EuiDraggable, EuiPanel, EuiIcon, EuiButtonIcon } from "@elastic/eui";
import { Action, UIAction } from "../../../../../models/interfaces";

interface DraggableActionProps {
  action: UIAction<Action>;
  idx: number;
  isLast: boolean;
  onClickDeleteAction: () => void;
  onClickEditAction: () => void;
}

const DraggableAction = ({ action: { id, content }, idx, isLast, onClickDeleteAction, onClickEditAction }: DraggableActionProps) => (
  <EuiDraggable style={{ padding: `0px 0px ${isLast ? "0px" : "10px"} 0px` }} key={id} index={idx} draggableId={id} customDragHandle={true}>
    {(provided) => (
      <EuiPanel className="custom" paddingSize="m">
        <EuiFlexGroup alignItems="center">
          <EuiFlexItem grow={false}>
            <div {...provided.dragHandleProps} aria-label="Drag Handle">
              <EuiIcon type="grab" />
            </div>
          </EuiFlexItem>
          <EuiFlexItem>{content()}</EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButtonIcon
              iconType="trash"
              aria-label="Delete"
              color="danger"
              onClick={onClickDeleteAction}
              data-test-subj="draggable-action-delete-button"
            />
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButtonIcon
              iconType="pencil"
              aria-label="Edit"
              color="primary"
              onClick={onClickEditAction}
              data-test-subj="draggable-action-edit-button"
            />
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiPanel>
    )}
  </EuiDraggable>
);

export default DraggableAction;
