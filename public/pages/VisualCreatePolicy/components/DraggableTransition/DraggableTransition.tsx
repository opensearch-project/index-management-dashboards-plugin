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
import { UITransition } from "../../../../../models/interfaces";
import TransitionContent from "../Transition/TransitionContent";

interface DraggableTransitionProps {
  transition: UITransition;
  idx: number;
  isLast: boolean;
  onClickDeleteTransition: () => void;
  onClickEditTransition: () => void;
}

const DraggableTransition = ({
  transition: { transition, id },
  idx,
  isLast,
  onClickDeleteTransition,
  onClickEditTransition,
}: DraggableTransitionProps) => (
  <EuiDraggable style={{ padding: `0px 0px ${isLast ? "0px" : "10px"} 0px` }} key={id} index={idx} draggableId={id} customDragHandle={true}>
    {(provided) => (
      <EuiPanel className="custom" paddingSize="m">
        <EuiFlexGroup alignItems="flexStart">
          <EuiFlexItem grow={false}>
            <div {...provided.dragHandleProps} aria-label="Drag Handle">
              <EuiIcon type="grab" />
            </div>
          </EuiFlexItem>
          <EuiFlexItem>
            <TransitionContent transition={transition} />
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButtonIcon
              iconType="trash"
              aria-label="Delete"
              color="danger"
              onClick={() => onClickDeleteTransition()}
              data-test-subj="draggable-transition-delete-button"
            />
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButtonIcon
              iconType="pencil"
              aria-label="Edit"
              color="primary"
              onClick={() => onClickEditTransition()}
              data-test-subj="draggable-transition-edit-button"
            />
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiPanel>
    )}
  </EuiDraggable>
);

export default DraggableTransition;
