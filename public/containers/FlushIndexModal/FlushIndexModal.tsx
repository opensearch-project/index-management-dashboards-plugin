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

const flushAllMessage = "All open indices will be flushed.";

const messageMap: Record<FlushTarget, string> = {
  indices: "The following indices will be flushed.",
  "data stream": "The following data streams will be flushed.",
  alias: "The following aliases will be flushed.",
};

const blockedMessageMap: Record<FlushTarget, string> = {
  indices: "The following indices will not be flushed because they are closed.",
  "data stream": "The following data streams will not be flushed because\
   at least one of their backing indices are closed.",
  alias: "The following aliases will not be flushed because at lease one of their indices are closed.",
};

export interface FlushIndexModalProps {
  flushableItems: string[];
  blockedItems: string[];
  visible: boolean;
  flushTarget: FlushTarget;
  onClose: () => void;
}

export default function FlushIndexModal(props: FlushIndexModalProps) {
  const { onClose, flushTarget, visible, flushableItems, blockedItems } = props;
  const services = useContext(ServicesContext);
  const coreServices = useContext(CoreServicesContext) as CoreStart;
  const flushAll = flushTarget === "indices" && !flushableItems.length && !blockedItems.length;
  const onFlushConfirm = useCallback(async () => {
    try {
      if (!services) {
        throw new Error("Something is wrong in ServiceContext");
      }
      const indexPayload = flushableItems.join(",");
      const result = await services.commonService.apiCaller({
        endpoint: "indices.flush",
        data: {
          index: indexPayload,
        },
      });
      if (result && result.ok) {
        const flushedItems = flushAll ? "all open indices" : `[${indexPayload}]`;
        coreServices.notifications.toasts.addSuccess(`Flush ${flushedItems} successfully`);
      } else {
        coreServices.notifications.toasts.addDanger(result.error);
      }
    } catch (err) {
      coreServices.notifications.toasts.addDanger(getErrorMessage(err, "There was a problem flushing index."));
    } finally {
      onClose();
    }
  }, [flushableItems, services, coreServices, onClose, flushAll]);

  if (!visible) {
    return null;
  }

  return (
    <EuiModal onClose={onClose}>
      <EuiModalHeader>
        <EuiModalHeaderTitle data-test-subj="Flush Modal Title">Flush {flushTarget}</EuiModalHeaderTitle>
      </EuiModalHeader>

      <EuiModalBody>
        <div style={{ lineHeight: 1.5 }}>
          {/* we will not display this part if not flushAll and there is no flushable items */}
          {(flushAll || !!flushableItems.length) && (
            <>
              <p>{flushAll ? flushAllMessage : messageMap[flushTarget]}</p>
              <ul style={{ listStyleType: "disc", listStylePosition: "inside" }}>
                {flushableItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </>
          )}
          {!!blockedItems.length && (
            <>
              <p>{blockedMessageMap[flushTarget]}</p>
              <ul style={{ listStyleType: "disc", listStylePosition: "inside" }}>
                {blockedItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </>
          )}
          <EuiSpacer />
        </div>
      </EuiModalBody>

      <EuiModalFooter>
        <EuiButtonEmpty data-test-subj="Flush Cancel button" onClick={onClose}>
          Cancel
        </EuiButtonEmpty>
        <EuiButton data-test-subj="Flush Confirm button" onClick={onFlushConfirm} isDisabled={!flushAll && !flushableItems.length} fill>
          Flush
        </EuiButton>
      </EuiModalFooter>
    </EuiModal>
  );
}
