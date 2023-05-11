/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useContext, useState, useEffect } from "react";
import {
  EuiButton,
  EuiButtonEmpty,
  EuiCallOut,
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
import { indexBlockedPredicate, aliasBlockedPredicate, dataStreamBlockedPredicate, filterBlockedItems } from "../../utils/helpers";
import { IndexOpBlocksType } from "../../utils/constants";
import { CatIndex, DataStream } from "../../../server/models/interfaces";
import { IAlias } from "../../pages/Aliases/interface";

type FlushTarget = "indices" | "data stream" | "alias";

const flushAllMessage = "All open indices will be flushed.";

const messageMap: Record<FlushTarget, string> = {
  indices: "The following indices will be flushed:",
  "data stream": "The following data streams will be flushed:",
  alias: "The following aliases will be flushed:",
};

const blockedMessageMap: Record<FlushTarget, string> = {
  indices: "The following indices will not be flushed because they are closed:",
  "data stream": "The following data streams will not be flushed because one or more backing indices are closed:",
  alias: "The following aliases will not be flushed because one or more indices are closed:",
};

export interface FlushIndexModalProps<T> {
  selectedItems: T[];
  visible: boolean;
  flushTarget: FlushTarget;
  onClose: () => void;
}

export default function FlushIndexModal<T>(props: FlushIndexModalProps<T>) {
  const { onClose, flushTarget, visible, selectedItems } = props;
  const services = useContext(ServicesContext);
  const coreServices = useContext(CoreServicesContext) as CoreStart;
  const flushAll = !selectedItems.length && flushTarget === "indices";

  const [unBlockedItems, setUnBlockedItems] = useState([] as string[]);
  const [blockedItems, setBlockedItems] = useState([] as string[]);
  const onFlushConfirm = useCallback(async () => {
    try {
      if (!services) {
        throw new Error("Something is wrong in ServiceContext");
      }
      const indexPayload = unBlockedItems.join(",");
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
  }, [unBlockedItems, services, coreServices, onClose, flushAll]);

  useEffect(() => {
    if (!!services && visible) {
      switch (flushTarget) {
        case "alias":
          filterBlockedItems<IAlias>(services, selectedItems as IAlias[], IndexOpBlocksType.Closed, aliasBlockedPredicate)
            .then((filterBlockedItems) => {
              if (visible) {
                setBlockedItems(filterBlockedItems.blockedItems.map((item) => item.alias));
                setUnBlockedItems(filterBlockedItems.unBlockedItems.map((item) => item.alias));
              }
            })
            .catch((err) => {
              if (visible) {
                setUnBlockedItems((selectedItems as IAlias[]).map((item) => item.alias));
              }
            });
          break;
        case "data stream":
          filterBlockedItems<DataStream>(services, selectedItems as DataStream[], IndexOpBlocksType.Closed, dataStreamBlockedPredicate)
            .then((filterBlockedItems) => {
              if (visible) {
                setBlockedItems(filterBlockedItems.blockedItems.map((item) => item.name));
                setUnBlockedItems(filterBlockedItems.unBlockedItems.map((item) => item.name));
              }
            })
            .catch((err) => {
              if (visible) {
                setUnBlockedItems((selectedItems as DataStream[]).map((item) => item.name));
              }
            });
          break;
        default:
          filterBlockedItems<CatIndex>(services, selectedItems as CatIndex[], IndexOpBlocksType.Closed, indexBlockedPredicate)
            .then((filterBlockedItems) => {
              if (visible) {
                setBlockedItems(filterBlockedItems.blockedItems.map((item) => item.index));
                setUnBlockedItems(filterBlockedItems.unBlockedItems.map((item) => item.index));
              }
            })
            .catch((err) => {
              if (visible) {
                setUnBlockedItems((selectedItems as CatIndex[]).map((item) => item.index));
              }
            });
      }
    } else {
      setBlockedItems([]);
      setUnBlockedItems([]);
    }
  }, [visible, flushTarget]);

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
          {flushAll && (
            <>
              <p>{flushAllMessage}</p>
            </>
          )}
          {!!unBlockedItems.length && (
            <>
              <p>{messageMap[flushTarget]}</p>
              <ul style={{ listStyleType: "disc", listStylePosition: "inside" }}>
                {unBlockedItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </>
          )}
          <EuiSpacer />
          <EuiCallOut data-test-subj="Flush Blocked Callout" color="warning" hidden={!blockedItems.length}>
            <p>{blockedMessageMap[flushTarget]}</p>
            <ul style={{ listStyleType: "disc", listStylePosition: "inside" }}>
              {blockedItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </EuiCallOut>
          <EuiSpacer />
        </div>
      </EuiModalBody>

      <EuiModalFooter>
        <EuiButtonEmpty data-test-subj="Flush Cancel Button" onClick={onClose}>
          Cancel
        </EuiButtonEmpty>
        <EuiButton data-test-subj="Flush Confirm Button" onClick={onFlushConfirm} isDisabled={!flushAll && !unBlockedItems.length} fill>
          Flush
        </EuiButton>
      </EuiModalFooter>
    </EuiModal>
  );
}
