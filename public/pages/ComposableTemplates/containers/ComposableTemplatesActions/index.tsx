/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState } from "react";
import { EuiSmallButton } from "@elastic/eui";
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
      <EuiSmallButton
        data-test-subj="deleteAction"
        color="danger"
        disabled={renderProps.selectedItems.length !== 1}
        onClick={triggerDelete}
      >
        Delete
      </EuiSmallButton>
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
