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
import React, { useState } from "react";
import { EuiButton } from "@elastic/eui";
import DeleteIndexModal from "../DeleteComposableTemplatesModal";
import AssociatedTemplatesModal from "../AssociatedTemplatesModal";

export interface renderDeleteButtonProps {
  selectedItems: string[];
  triggerDelete: () => void;
}

export interface ComposableTemplatesActionsProps {
  selectedItems: renderDeleteButtonProps["selectedItems"];
  onDelete: () => void;
  renderDeleteButton?: (props: renderDeleteButtonProps) => React.ReactChild;
}

export function ComposableTemplatesDeleteAction(props: ComposableTemplatesActionsProps) {
  const { selectedItems, onDelete } = props;
  const [deleteIndexModalVisible, setDeleteIndexModalVisible] = useState(false);
  const renderDeleteButton: (props: {
    selectedItems: renderDeleteButtonProps["selectedItems"];
    setVisible: React.Dispatch<React.SetStateAction<boolean>>;
  }) => React.ReactChild = (renderProps) => {
    const triggerDelete = () => {
      setDeleteIndexModalVisible(true);
    };
    if (props.renderDeleteButton) {
      return props.renderDeleteButton({
        ...renderProps,
        triggerDelete,
      });
    }

    return (
      <EuiButton data-test-subj="deleteAction" color="danger" disabled={renderProps.selectedItems.length !== 1} onClick={triggerDelete}>
        Delete
      </EuiButton>
    );
  };

  const onDeleteIndexModalClose = () => {
    setDeleteIndexModalVisible(false);
  };

  return (
    <>
      <AssociatedTemplatesModal
        componentTemplate={selectedItems[0]}
        renderProps={({ setVisible }) => renderDeleteButton({ selectedItems, setVisible })}
      />
      <DeleteIndexModal
        selectedItems={selectedItems}
        visible={deleteIndexModalVisible}
        onClose={onDeleteIndexModalClose}
        onDelete={() => {
          onDeleteIndexModalClose();
          onDelete();
        }}
      />
    </>
  );
}

export default function ComposableTemplatesAction(props: ComposableTemplatesActionsProps) {
  return <ComposableTemplatesDeleteAction {...props} />;
}
