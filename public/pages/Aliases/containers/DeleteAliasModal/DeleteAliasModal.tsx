/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useContext, useEffect, useState } from "react";
import {
  EuiButton,
  EuiButtonEmpty,
  EuiCallOut,
  EuiFieldText,
  EuiModal,
  EuiModalBody,
  EuiModalFooter,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiSpacer,
  EuiText,
} from "@elastic/eui";
import { CoreStart } from "opensearch-dashboards/public";
import { ServicesContext } from "../../../../services";
import { CoreServicesContext } from "../../../../components/core_services";
import { filterByMinimatch } from "../../../../../utils/helper";
import { SYSTEM_ALIAS } from "../../../../../utils/constants";

interface DeleteAliasModalProps {
  selectedItems: string[];
  visible: boolean;
  onClose: () => void;
  onDelete: () => void;
}

export default function DeleteAliasModal(props: DeleteAliasModalProps) {
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
        endpoint: "indices.deleteAlias",
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

  const hasSystemIndex = props.selectedItems.some((index) => filterByMinimatch(index, SYSTEM_ALIAS));

  return (
    <EuiModal onClose={onClose}>
      <EuiModalHeader>
        <EuiModalHeaderTitle>Delete aliases</EuiModalHeaderTitle>
      </EuiModalHeader>

      <EuiModalBody>
        {hasSystemIndex ? (
          <>
            <EuiCallOut color="warning">You are trying to delete system-like alias, please be careful.</EuiCallOut>
            <EuiSpacer />
          </>
        ) : null}
        <div style={{ lineHeight: 1.5 }}>
          <p>The following alias will be permanently deleted. This action cannot be undone.</p>
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
