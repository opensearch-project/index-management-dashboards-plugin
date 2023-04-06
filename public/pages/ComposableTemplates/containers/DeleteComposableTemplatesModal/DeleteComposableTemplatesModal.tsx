/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useContext } from "react";
import { CoreStart } from "opensearch-dashboards/public";
import { ServicesContext } from "../../../../services";
import { CoreServicesContext } from "../../../../components/core_services";
import { EuiButton, EuiButtonEmpty, EuiModal, EuiModalBody, EuiModalFooter, EuiModalHeader, EuiModalHeaderTitle } from "@elastic/eui";

interface DeleteTemplateModalProps {
  selectedItems: string[];
  visible: boolean;
  onClose: () => void;
  onDelete: () => void;
}

export default function DeleteTemplateModal(props: DeleteTemplateModalProps) {
  const { onClose, visible, selectedItems, onDelete } = props;
  const services = useContext(ServicesContext);
  const coreServices = useContext(CoreServicesContext) as CoreStart;

  const onConfirm = useCallback(async () => {
    if (services) {
      const result = await services.commonService.apiCaller({
        endpoint: "transport.request",
        data: {
          path: `/_component_template/${selectedItems.join(",")}`,
          method: "DELETE",
        },
      });
      if (result && result.ok) {
        coreServices.notifications.toasts.addSuccess(`Delete [${selectedItems.join(",")}] successfully`);
        onDelete();
      } else {
        coreServices.notifications.toasts.addDanger(result?.error || "");
      }
    }
  }, [selectedItems, services, coreServices, onDelete]);

  if (!visible) {
    return null;
  }

  return (
    <EuiModal onClose={onClose}>
      <EuiModalHeader>
        <EuiModalHeaderTitle>Delete component templates</EuiModalHeaderTitle>
      </EuiModalHeader>

      <EuiModalBody>
        <div style={{ lineHeight: 1.5 }}>
          <p>The following composable template will be permanently deleted. This action cannot be undone.</p>
          <ul style={{ listStyleType: "disc", listStylePosition: "inside" }}>
            {selectedItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </EuiModalBody>

      <EuiModalFooter>
        <EuiButtonEmpty data-test-subj="deletaCancelButton" onClick={onClose}>
          Cancel
        </EuiButtonEmpty>
        <EuiButton data-test-subj="deleteConfirmButton" onClick={onConfirm} fill color="danger">
          Delete
        </EuiButton>
      </EuiModalFooter>
    </EuiModal>
  );
}
