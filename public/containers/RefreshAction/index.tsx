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
import { aliasBlockedPredicate, dataStreamBlockedPredicate, filterBlockedItems, indexBlockedPredicate } from "../../utils/helpers";
import { IndexOpBlocksType, INDEX_OP_TARGET_TYPE } from "../../utils/constants";
import { CatIndex, DataStream } from "../../../server/models/interfaces";
import { IAlias } from "../../pages/Aliases/interface";

interface RefreshActionModalProps<T> {
  selectedItems: T[];
  visible: boolean;
  onClose: () => void;
  type: string;
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

  useEffect(() => {
    if (!!services && visible) {
      if (selectedItems.length === 0) {
        setToastWording("All open indexes are successfully refreshed.");
      }
      switch (type) {
        case INDEX_OP_TARGET_TYPE.INDEX:
          filterBlockedItems<CatIndex>(services, selectedItems as CatIndex[], IndexOpBlocksType.Closed, indexBlockedPredicate)
            .then((filteredStreamsResult) => {
              const unBlocked = filteredStreamsResult.unBlockedItems.map((item) => item.index);
              const blocked = filteredStreamsResult.blockedItems.map((item) => item.index);

              if (unBlocked.length === 1) {
                setUnblockedWording("The following index");
                setToastWording("The index [" + unBlocked.join(", ") + "] has been successfully refreshed.");
              } else if (unBlocked.length > 1) {
                setUnblockedWording("The following " + type);
                setToastWording(unBlocked.length + " " + type + " [" + unBlocked.join(", ") + "] have been successfully refreshed.");
              }
              if (blocked.length === 1) {
                setBlockedWording("The following index will not be refreshed because it is closed.");
              } else if (blocked.length > 1) {
                setBlockedWording("The following " + type + " will not be refreshed because they are closed.");
              }

              setUnBlockedItems(unBlocked);
              setBlockedItems(blocked);
            })
            .catch(() => {
              /*
            It's not a critical error although if it fails unlikely other call will succeed,
            set unblocked items to all, so we won't filter any of the selected items.
             */
              const unBlocked = selectedItems.map((item: CatIndex) => item.index);
              if (unBlocked.length === 1) {
                setUnblockedWording("The following index");
                setToastWording("The index [" + unBlocked.join(", ") + "] has been successfully refreshed.");
              } else if (unBlocked.length > 1) {
                setUnblockedWording("The following " + type);
                setToastWording(unBlocked.length + " " + type + " [" + unBlocked.join(", ") + "] have been successfully refreshed.");
              }
              setUnBlockedItems(unBlocked);
            });
          break;
        case INDEX_OP_TARGET_TYPE.ALIAS:
          filterBlockedItems<IAlias>(services, selectedItems as IAlias[], IndexOpBlocksType.Closed, aliasBlockedPredicate)
            .then((filteredStreamsResult) => {
              const unBlocked = filteredStreamsResult.unBlockedItems.map((item) => item.alias);
              const blocked = filteredStreamsResult.blockedItems.map((item) => item.alias);
              if (unBlocked.length === 1) {
                setUnblockedWording("The following alias");
                setToastWording("The alias [" + unBlocked.join(", ") + "] has been successfully refreshed.");
              } else if (unBlocked.length > 1) {
                setUnblockedWording("The following " + type);
                setToastWording(unBlocked.length + " " + type + " [" + unBlocked.join(", ") + "] have been successfully refreshed.");
              }
              if (blocked.length === 1) {
                setBlockedWording("The following alias will not be refreshed because it is closed.");
              } else if (blocked.length > 1) {
                setBlockedWording("The following " + type + " will not be refreshed because they are closed.");
              }

              setUnBlockedItems(unBlocked);
              setBlockedItems(blocked);
            })
            .catch(() => {
              /*
            It's not a critical error although if it fails unlikely other call will succeed,
            set unblocked items to all, so we won't filter any of the selected items.
             */
              const unBlocked = selectedItems.map((item: IAlias) => item.alias);
              if (unBlocked.length === 1) {
                setUnblockedWording("The following alias");
                setToastWording("The alias [" + unBlocked.join(", ") + "] has been successfully refreshed.");
              } else if (unBlocked.length > 1) {
                setUnblockedWording("The following " + type);
                setToastWording(unBlocked.length + " " + type + " [" + unBlocked.join(", ") + "] have been successfully refreshed.");
              }
              setUnBlockedItems(unBlocked);
            });
          break;
        case INDEX_OP_TARGET_TYPE.DATA_STREAM:
          filterBlockedItems<DataStream>(services, selectedItems as DataStream[], IndexOpBlocksType.Closed, dataStreamBlockedPredicate)
            .then((filteredStreamsResult) => {
              const unBlocked = filteredStreamsResult.unBlockedItems.map((item) => item.name);
              const blocked = filteredStreamsResult.blockedItems.map((item) => item.name);

              if (unBlocked.length === 1) {
                setUnblockedWording("The following data stream");
                setToastWording("The data stream [" + unBlocked.join(", ") + "] has been successfully refreshed.");
              } else if (unBlocked.length > 1) {
                setUnblockedWording("The following " + type);
                setToastWording(unBlocked.length + " " + type + " [" + unBlocked.join(", ") + "] have been successfully refreshed.");
              }
              if (blocked.length === 1) {
                setBlockedWording("The following data stream will not be refreshed because it is closed.");
              } else if (blocked.length > 1) {
                setBlockedWording("The following " + type + " will not be refreshed because they are closed.");
              }

              setUnBlockedItems(unBlocked);
              setBlockedItems(blocked);
            })
            .catch(() => {
              /*
            It's not a critical error although if it fails unlikely other call will succeed,
            set unblocked items to all, so we won't filter any of the selected items.
             */
              const unBlocked = selectedItems.map((item: DataStream) => item.name);
              if (unBlocked.length === 1) {
                setUnblockedWording("The following data stream");
                setToastWording("The data stream [" + unBlocked.join(", ") + "] has been successfully refreshed.");
              } else if (unBlocked.length > 1) {
                setUnblockedWording("The following " + type);
                setToastWording(unBlocked.length + " " + type + " [" + unBlocked.join(", ") + "] have been successfully refreshed.");
              }
              setUnBlockedItems(unBlocked);
            });
          break;
      }
    } else {
      setUnBlockedItems([]);
      setBlockedItems([]);
    }
  }, [visible, services, type, selectedItems]);

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
  }, [unBlockedItems, services, coreServices, onClose]);

  if (!visible) {
    return null;
  }

  return (
    <EuiModal onClose={onClose}>
      <EuiModalHeader>
        <EuiModalHeaderTitle>Refresh {type}</EuiModalHeaderTitle>
      </EuiModalHeader>

      <EuiModalBody>
        <div style={{ lineHeight: 1.5 }}>
          {selectedItems.length === 0 && (
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
        <EuiButton
          data-test-subj="refreshConfirmButton"
          onClick={onConfirm}
          fill
          disabled={unBlockedItems.length == 0 && selectedItems.length != 0}
        >
          Refresh
        </EuiButton>
      </EuiModalFooter>
    </EuiModal>
  );
}
