/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useContext } from "react";
import { RouteComponentProps } from "react-router-dom";
import { CoreStart } from "opensearch-dashboards/public";
import { EuiButton, EuiSpacer } from "@elastic/eui";
import DeleteIndexModal from "../DeleteComposableTemplatesModal";
import AssociatedTemplatesModal from "../AssociatedTemplatesModal";
import { useComponentMapTemplate } from "../../utils/hooks";
import { CoreServicesContext } from "../../../../components/core_services";

export interface renderDeleteButtonProps {
  selectedItems: string[];
  triggerDelete: () => void;
}

export interface ComposableTemplatesActionsProps {
  selectedItems: renderDeleteButtonProps["selectedItems"];
  onDelete: () => void;
  history: RouteComponentProps["history"];
  renderDeleteButton?: (props: renderDeleteButtonProps) => React.ReactChild;
}

export function ComposableTemplatesDeleteAction(props: ComposableTemplatesActionsProps) {
  const { selectedItems, onDelete } = props;
  const [deleteIndexModalVisible, setDeleteIndexModalVisible] = useState(false);
  const coreServices = useContext(CoreServicesContext) as CoreStart;
  const { componentMapTemplate } = useComponentMapTemplate();
  const renderDeleteButton: (props: {
    selectedItems: renderDeleteButtonProps["selectedItems"];
    setVisible: React.Dispatch<React.SetStateAction<boolean>>;
  }) => React.ReactChild = (renderProps) => {
    const triggerDelete = () => {
      if (componentMapTemplate[selectedItems[0]]?.length) {
        const toast = coreServices.notifications.toasts.addDanger({
          title: `Unable to delete ${selectedItems[0]}`,
          text: ((
            <>
              The component cannot be deleted when it is associated with {componentMapTemplate[selectedItems[0]]?.length} templates. Unlink
              the component from all templates and try again.
              <EuiSpacer />
              <EuiButton
                color="danger"
                data-test-subj="viewAssociatedTemplatesInToast"
                onClick={() => {
                  coreServices.notifications.toasts.remove(toast.id);
                  renderProps.setVisible(true);
                }}
              >
                View associated index templates
              </EuiButton>
            </>
          ) as unknown) as string,
        });
      } else {
        setDeleteIndexModalVisible(true);
      }
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
