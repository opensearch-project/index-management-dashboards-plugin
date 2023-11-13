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
import { EuiFlexGroup, EuiFlexItem, EuiDraggable, EuiPanel, EuiIcon, EuiButtonIcon, EuiToolTip } from "@elastic/eui";

interface DraggableItemProps {
  content: string | JSX.Element | null;
  id: string;
  idx: number;
  isLast: boolean;
  onClickDelete: () => void;
  onClickEdit: () => void;
  draggableType: "action" | "transition";
}

const DraggableItem = ({ content, id, idx, isLast, onClickDelete, onClickEdit, draggableType }: DraggableItemProps) => (
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
            <EuiToolTip position="top" content={<p>Delete {draggableType}</p>}>
              <EuiButtonIcon
                iconType="trash"
                aria-label="Delete"
                color="danger"
                onClick={onClickDelete}
                data-test-subj={`draggable-item-delete-button-${id}`}
              />
            </EuiToolTip>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiToolTip position="top" content={<p>Edit {draggableType}</p>}>
              <EuiButtonIcon
                iconType="pencil"
                aria-label="Edit"
                color="primary"
                onClick={onClickEdit}
                data-test-subj={`draggable-item-edit-button-${id}`}
              />
            </EuiToolTip>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiPanel>
    )}
  </EuiDraggable>
);

export default DraggableItem;
