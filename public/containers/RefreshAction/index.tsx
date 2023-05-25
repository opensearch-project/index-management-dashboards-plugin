/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useContext, useEffect, useState } from "react";
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
import { ServicesContext } from "../../services";
import { CoreServicesContext } from "../../components/core_services";
import { filterBlockedItems } from "../../utils/helpers";
import { INDEX_OP_BLOCKS_TYPE, INDEX_OP_TARGET_TYPE } from "../../utils/constants";
import { CatIndex, DataStream } from "../../../server/models/interfaces";
import { IAlias } from "../../pages/Aliases/interface";

interface RefreshActionModalProps<T> {
  selectedItems: T[];
  visible: boolean;
  onClose: () => void;
  type: INDEX_OP_TARGET_TYPE;
}

export default function RefreshActionModal<T>(props: RefreshActionModalProps<T>) {
  const { onClose, visible, selectedItems, type } = props;
  const services = useContext(ServicesContext);
  const coreServices = useContext(CoreServicesContext) as CoreStart;
  const [unBlockedItems, setUnBlockedItems] = useState([] as string[]);
  const [blockedItems, setBlockedItems] = useState([] as string[]);
  const [unblockedWording, setUnblockedWording] = useState("" as string);
  const [blockedWording, setBlockedWording] = useState("" as string);
  const [toastWording, setToastWording] = useState("" as string);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!!services && visible) {
      const filterRedStatus = true;
      let singleTypeWording = "";
      let closedTypeWording = "";

      switch (type) {
        case INDEX_OP_TARGET_TYPE.ALIAS:
          singleTypeWording = "alias";
          closedTypeWording = "each alias has one or more indexes that";
          break;
        case INDEX_OP_TARGET_TYPE.DATA_STREAM:
          singleTypeWording = "data stream";
          closedTypeWording = "each data stream has one or more indexes that";
          break;
        default:
          singleTypeWording = "index";
          closedTypeWording = "they";
          break;
      }

      filterBlockedItems(services, selectedItems, INDEX_OP_BLOCKS_TYPE.CLOSED, type, filterRedStatus)
        .then((filteredStreamsResult) => {
          const unBlocked = filteredStreamsResult.unBlockedItems;
          const blocked = filteredStreamsResult.blockedItems;
          if (unBlocked.length === 1) {
            setUnblockedWording(`The following ${singleTypeWording}`);
            setToastWording(`The ${singleTypeWording} [${unBlocked.join(", ")}] has been successfully refreshed.`);
          } else if (unBlocked.length > 1) {
            setUnblockedWording(`The following ${type}`);
            setToastWording(`${unBlocked.length} ${type} [${unBlocked.join(", ")}] have been successfully refreshed.`);
          }

          if (blocked.length === 1) {
            setBlockedWording(
              `The following ${singleTypeWording} cannot be refreshed because ${closedTypeWording} are either closed or in red status.`
            );
          } else if (blocked.length > 1) {
            setBlockedWording(`The following ${type} cannot be refreshed because ${closedTypeWording} are either closed or in red status.`);
          }

          if (!selectedItems.length) {
            if (!blocked.length) {
              setToastWording(`All open indexes have been successfully refreshed.`);
              setLoading(false);
            } else {
              coreServices.notifications.toasts.addDanger({
                title: `Unable to refresh indexes.`,
                text: `Cannot refresh all open indexes because one or more indexes are in red status.`,
              });
              onClose();
            }
          } else if (selectedItems.length != 0 && unBlocked.length == 0) {
            coreServices.notifications.toasts.addDanger({
              title: `Unable to refresh ${type}.`,
              text: `All selected ${type} cannot be refreshed because ${closedTypeWording} are either closed or in red status.`,
            });
            onClose();
          } else {
            setUnBlockedItems(unBlocked);
            setBlockedItems(blocked);
            setLoading(false);
          }
        })
        .catch(() => {
          /*
      It's not a critical error although if it fails unlikely other call will succeed,
      set unblocked items to all, so we won't filter any of the selected items.
       */
          if (selectedItems.length > 0) {
            let unBlocked;
            switch (type) {
              case INDEX_OP_TARGET_TYPE.ALIAS:
                unBlocked = selectedItems.map((item: IAlias) => item.alias);
                break;
              case INDEX_OP_TARGET_TYPE.DATA_STREAM:
                unBlocked = selectedItems.map((item: DataStream) => item.name);
                break;
              default:
                unBlocked = selectedItems.map((item: CatIndex) => item.index);
                break;
            }
            if (unBlocked.length === 1) {
              setUnblockedWording(`The following ${singleTypeWording}`);
              setToastWording(`The ${singleTypeWording} [${unBlocked.join(", ")}] has been successfully refreshed.`);
            } else if (unBlocked.length > 1) {
              setUnblockedWording(`The following ${type}`);
              setToastWording(`${unBlocked.length} ${type} [${unBlocked.join(", ")}] have been successfully refreshed.`);
            }
            setUnBlockedItems(unBlocked);
          }
          setLoading(false);
        });
    } else {
      setUnBlockedItems([]);
      setBlockedItems([]);
    }
  }, [visible, services, type, selectedItems, onClose]);

  const onConfirm = useCallback(async () => {
    if (!!services) {
      const result = await services.commonService.apiCaller({
        endpoint: "indices.refresh",
        data: {
          index: unBlockedItems.join(","),
        },
      });
      if (result && result.ok) {
        coreServices.notifications.toasts.addSuccess(toastWording);
        onClose();
      } else {
        coreServices.notifications.toasts.addDanger(result?.error || "");
      }
    }
  }, [unBlockedItems, toastWording, services, coreServices, onClose]);

  if (!visible || loading) {
    return null;
  }

  return (
    <EuiModal onClose={onClose}>
      <EuiModalHeader>
        <EuiModalHeaderTitle>Refresh {type}</EuiModalHeaderTitle>
      </EuiModalHeader>

      <EuiModalBody>
        <div style={{ lineHeight: 1.5 }}>
          {selectedItems.length === 0 && blockedItems.length === 0 && (
            <>
              <p>All open indexes will be refreshed.</p>
            </>
          )}
          {!!unBlockedItems.length && (
            <>
              <p>{unblockedWording} will be refreshed.</p>
              <ul style={{ listStyleType: "disc", listStylePosition: "inside" }}>
                {unBlockedItems.map((item) => (
                  <li key={item} data-test-subj={`UnblockedItem-${item}`}>
                    {item}
                  </li>
                ))}
              </ul>
            </>
          )}
          <EuiSpacer />
          {!!blockedItems.length && (
            <>
              <EuiCallOut color="warning" iconType="alert" size="s" title={`${blockedWording}`}>
                <p />
                <ul style={{ listStyleType: "disc", listStylePosition: "inside" }}>
                  {blockedItems.map((item) => (
                    <li key={item} data-test-subj={`BlockedItem-${item}`}>
                      {item}
                    </li>
                  ))}
                </ul>
              </EuiCallOut>
            </>
          )}
        </div>
      </EuiModalBody>

      <EuiModalFooter>
        <EuiButtonEmpty onClick={onClose}>Cancel</EuiButtonEmpty>
        <EuiButton data-test-subj="refreshConfirmButton" onClick={onConfirm} fill>
          Refresh
        </EuiButton>
      </EuiModalFooter>
    </EuiModal>
  );
}
