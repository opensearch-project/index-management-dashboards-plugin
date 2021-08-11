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

interface DraggableItemProps {
  content: string | JSX.Element | null;
  id: string;
  idx: number;
  isLast: boolean;
  onClickDelete: () => void;
  onClickEdit: () => void;
}

const DraggableItem = ({ content, id, idx, isLast, onClickDelete, onClickEdit }: DraggableItemProps) => (
  <EuiDraggable style={{ padding: `0px 0px ${isLast ? "0px" : "10px"} 0px` }} key={id} index={idx} draggableId={id} customDragHandle={true}>
    {(provided) => (
      <EuiPanel className="custom" paddingSize="m">
        <EuiFlexGroup alignItems="center">
          <EuiFlexItem grow={false}>
            <div {...provided.dragHandleProps} aria-label="Drag Handle">
              <EuiIcon type="grab" />
            </div>
          </EuiFlexItem>
          <EuiFlexItem>{content}</EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButtonIcon
              iconType="trash"
              aria-label="Delete"
              color="danger"
              onClick={onClickDelete}
              data-test-subj={`draggable-item-delete-button-${id}`}
            />
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButtonIcon
              iconType="pencil"
              aria-label="Edit"
              color="primary"
              onClick={onClickEdit}
              data-test-subj={`draggable-item-edit-button-${id}`}
            />
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiPanel>
    )}
  </EuiDraggable>
);

export default DraggableItem;
