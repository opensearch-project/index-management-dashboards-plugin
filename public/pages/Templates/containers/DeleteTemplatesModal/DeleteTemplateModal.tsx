/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useContext, useEffect, useState } from "react";
import {
  EuiButton,
  EuiButtonEmpty,
  EuiFieldText,
  EuiModal,
  EuiModalBody,
  EuiModalFooter,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiSpacer,
  EuiText,
} from "@elastic/eui";
import { ServicesContext } from "../../../../services";
import { CoreServicesContext } from "../../../../components/core_services";
import { CoreStart } from "opensearch-dashboards/public";

interface DeleteTemplateModalProps {
  selectedItems: string[];
  visible: boolean;
  onClose: () => void;
  onDelete: () => void;
}

export default function DeleteTemplateModal(props: DeleteTemplateModalProps) {
  const [value, setValue] = useState("");
  const { onClose, visible, selectedItems, onDelete } = props;
  const services = useContext(ServicesContext);
  const coreServices = useContext(CoreServicesContext) as CoreStart;
  useEffect(() => {
    if (visible) {
      setValue("");
    }
  }, [visible]);

  const onConfirm = useCallback(async () => {
    if (services) {
      const result = await services.commonService.apiCaller({
        endpoint: "indices.deleteTemplate",
        data: {
          index: "_all",
          name: selectedItems,
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
        <EuiModalHeaderTitle>Delete Templates</EuiModalHeaderTitle>
      </EuiModalHeader>

      <EuiModalBody>
        <div style={{ lineHeight: 1.5 }}>
          <p>The following alias will be deleted permanently. This action cannot be undone.</p>
          <ul style={{ listStyleType: "disc", listStylePosition: "inside" }}>
            {selectedItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <EuiSpacer />
          <EuiText color="subdued">
            To confirm your action, type <b style={{ color: "#000" }}>delete</b>.
          </EuiText>
          <EuiFieldText
            data-test-subj="deleteInput"
            placeholder="delete"
            fullWidth
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </div>
      </EuiModalBody>

      <EuiModalFooter>
        <EuiButtonEmpty onClick={onClose}>Cancel</EuiButtonEmpty>
        <EuiButton data-test-subj="deleteConfirmButton" onClick={onConfirm} fill color="danger" disabled={value !== "delete"}>
          Delete
        </EuiButton>
      </EuiModalFooter>
    </EuiModal>
  );
}
