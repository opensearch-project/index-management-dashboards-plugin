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

export interface ComposableTemplatesActionsProps {
  selectedItems: string[];
  onDelete: () => void;
  history: RouteComponentProps["history"];
}

export default function ComposableTemplatesActions(props: ComposableTemplatesActionsProps) {
  const { selectedItems, onDelete } = props;
  const [deleteIndexModalVisible, setDeleteIndexModalVisible] = useState(false);
  const coreServices = useContext(CoreServicesContext) as CoreStart;
  const { componentMapTemplate } = useComponentMapTemplate();

  const onDeleteIndexModalClose = () => {
    setDeleteIndexModalVisible(false);
  };

  return (
    <>
      <AssociatedTemplatesModal
        componentTemplate={selectedItems[0]}
        renderProps={({ setVisible }) => (
          <EuiButton
            data-test-subj="deleteAction"
            color="danger"
            disabled={selectedItems.length !== 1}
            onClick={() => {
              if (componentMapTemplate[selectedItems[0]]?.length) {
                const toast = coreServices.notifications.toasts.addDanger({
                  title: `Unable to delete ${selectedItems[0]}`,
                  text: ((
                    <>
                      The component cannot be deleted when it is associated with {componentMapTemplate[selectedItems[0]]?.length} templates.
                      Unlink the component from all templates and try again.
                      <EuiSpacer />
                      <EuiButton
                        color="danger"
                        data-test-subj="viewAssociatedTemplatesInToast"
                        onClick={() => {
                          coreServices.notifications.toasts.remove(toast.id);
                          setVisible(true);
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
            }}
          >
            Delete
          </EuiButton>
        )}
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
