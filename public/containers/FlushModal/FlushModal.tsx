/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useContext } from "react";
import {
  EuiButton,
  EuiButtonEmpty,
  EuiModal,
  EuiModalBody,
  EuiModalFooter,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiSpacer,
} from "@elastic/eui";
import { CoreStart } from "opensearch-dashboards/public";
import { CoreServicesContext } from "../../components/core_services";
import { getErrorMessage } from "../../utils/helpers";
import { ServicesContext } from "../../services";

type FlushTarget = "indices" | "data stream" | "alias";

const messageMap: Record<FlushTarget, string> = {
  indices: "The following index will be flushed.",
  "data stream": "The following data stream will be flushed.",
  alias: "Indices of the following alias will be flushed.",
};

interface FlushModalProps {
  selectedItems: string[];
  visible: boolean;
  flushTarget: FlushTarget;
  onClose: () => void;
}

export default function FlushModal(props: FlushModalProps) {
  const { onClose, flushTarget, visible, selectedItems } = props;
  const services = useContext(ServicesContext);
  const coreServices = useContext(CoreServicesContext) as CoreStart;

  const onFlushConfirm = useCallback(async () => {
    try {
      if (!services) {
        throw new Error("Something is wrong in ServiceContext");
      }
      const indexPayload = selectedItems.join(",");
      const result = await services.commonService.apiCaller({
        endpoint: "indices.flush",
        data: {
          index: indexPayload,
        },
      });
      if (result && result.ok) {
        coreServices.notifications.toasts.addSuccess(`Flush [${indexPayload}] successfully`);
      } else {
        coreServices.notifications.toasts.addDanger(result.error);
      }
    } catch (err) {
      coreServices.notifications.toasts.addDanger(getErrorMessage(err, "There was a problem Flushing index."));
    } finally {
      onClose();
    }
  }, [selectedItems, services, coreServices, onClose]);

  if (!visible) {
    return null;
  }

  return (
    <EuiModal onClose={onClose}>
      <EuiModalHeader>
        <EuiModalHeaderTitle>Flush {flushTarget}</EuiModalHeaderTitle>
      </EuiModalHeader>

      <EuiModalBody>
        <div style={{ lineHeight: 1.5 }}>
          <p>{messageMap[flushTarget]}</p>
          <ul style={{ listStyleType: "disc", listStylePosition: "inside" }}>
            {selectedItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <EuiSpacer />
        </div>
      </EuiModalBody>

      <EuiModalFooter>
        <EuiButtonEmpty data-test-subj="Flush Cancel button" onClick={onClose}>
          Cancel
        </EuiButtonEmpty>
        <EuiButton data-test-subj="Flush Confirm button" onClick={onFlushConfirm} fill>
          Flush
        </EuiButton>
      </EuiModalFooter>
    </EuiModal>
  );
}
