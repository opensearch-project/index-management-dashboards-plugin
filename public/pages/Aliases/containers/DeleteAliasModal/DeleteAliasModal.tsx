/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useContext, useEffect, useState } from "react";
import {
  EuiSmallButton,
  EuiSmallButtonEmpty,
  EuiCallOut,
  EuiCompressedFieldText,
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
import { IAlias } from "../../interface";

interface DeleteAliasModalProps {
  selectedItems: IAlias[];
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
          index: selectedItems.reduce((total, current) => [...total, ...(current.indexArray || [])], [] as string[]),
          name: selectedItems.map((item) => item.alias),
        },
      });
      if (result && result.ok) {
        coreServices.notifications.toasts.addSuccess(`Delete [${selectedItems.map((item) => item.alias).join(", ")}] successfully`);
        onDelete();
      } else {
        coreServices.notifications.toasts.addDanger(result?.error || "");
      }
    }
  }, [selectedItems, services, coreServices, onDelete]);

  if (!visible) {
    return null;
  }

  const hasSystemIndex = props.selectedItems.some((index) => filterByMinimatch(index.alias, SYSTEM_ALIAS));

  return (
    <EuiModal onClose={onClose}>
      <EuiModalHeader>
        <EuiModalHeaderTitle>
          <EuiText size="s">
            <h2>Delete aliases</h2>
          </EuiText>
        </EuiModalHeaderTitle>
      </EuiModalHeader>

      <EuiModalBody>
        {hasSystemIndex ? (
          <>
            <EuiCallOut color="warning" size="s">
              These aliases may contain critical system data. Deleting system aliases may break OpenSearch.
            </EuiCallOut>
            <EuiSpacer />
          </>
        ) : null}
        <div style={{ lineHeight: 1.5 }}>
          <EuiText size="s">
            <p>The following alias will be permanently deleted. This action cannot be undone.</p>
          </EuiText>
          <EuiText size="s">
            <ul style={{ listStyleType: "disc", listStylePosition: "inside" }}>
              {selectedItems.map((item) => (
                <li key={item.alias}>{item.alias}</li>
              ))}
            </ul>
          </EuiText>
          <EuiSpacer />
          <EuiText color="subdued" size="s">
            To confirm your action, type <b style={{ color: "#000" }}>delete</b>.
          </EuiText>
          <EuiCompressedFieldText
            data-test-subj="deleteInput"
            placeholder="delete"
            fullWidth
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </div>
      </EuiModalBody>

      <EuiModalFooter>
        <EuiSmallButtonEmpty onClick={onClose}>Cancel</EuiSmallButtonEmpty>
        <EuiSmallButton data-test-subj="deleteConfirmButton" onClick={onConfirm} fill color="danger" disabled={value !== "delete"}>
          Delete
        </EuiSmallButton>
      </EuiModalFooter>
    </EuiModal>
  );
}
