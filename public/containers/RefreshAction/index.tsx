/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useContext, useEffect, useState } from "react";
import {
  EuiSmallButton,
  EuiSmallButtonEmpty,
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

interface RefreshActionModalProps {
  selectedItems: IAlias[] | DataStream[] | CatIndex[];
  visible: boolean;
  onClose: () => void;
  type: INDEX_OP_TARGET_TYPE;
}

const wordingMap = {
  [INDEX_OP_TARGET_TYPE.ALIAS]: "alias",
  [INDEX_OP_TARGET_TYPE.DATA_STREAM]: "data stream",
  [INDEX_OP_TARGET_TYPE.INDEX]: "index",
};

const getClosedTypeWording = (props: { type: INDEX_OP_TARGET_TYPE }) => {
  return props.type === INDEX_OP_TARGET_TYPE.INDEX ? "they" : `each ${wordingMap[props.type]} has one or more indexes that`;
};

export default function RefreshActionModal<T>(props: RefreshActionModalProps) {
  const { onClose, visible, selectedItems, type } = props;
  const services = useContext(ServicesContext);
  const coreServices = useContext(CoreServicesContext) as CoreStart;
  const [unBlockedItems, setUnBlockedItems] = useState([] as string[]);
  const [blockedItems, setBlockedItems] = useState([] as string[]);
  const [loading, setLoading] = useState(true);

  /**
   * generate wordings here
   */
  let unblockedWording = "";
  let blockedWording = "";
  let toastWording = "";
  if (unBlockedItems.length === 1) {
    unblockedWording = `The following ${wordingMap[type]}`;
    toastWording = `The ${wordingMap[type]} [${unBlockedItems.join(", ")}] has been successfully refreshed.`;
  } else if (unBlockedItems.length > 1) {
    unblockedWording = `The following ${type}`;
    toastWording = `${unBlockedItems.length} ${type} [${unBlockedItems.join(", ")}] have been successfully refreshed.`;
  }

  if (blockedItems.length === 1) {
    blockedWording = `The following ${wordingMap[type]} cannot be refreshed because ${getClosedTypeWording({
      type,
    })} are either closed or in red status.`;
  } else {
    blockedWording = `The following ${type} cannot be refreshed because ${getClosedTypeWording({
      type,
    })} are either closed or in red status.`;
  }

  if (!selectedItems.length && !blockedItems.length) {
    toastWording = `All open indexes have been successfully refreshed.`;
  }

  useEffect(() => {
    if (!!services && visible) {
      const filterRedStatus = true;
      filterBlockedItems(services, selectedItems, INDEX_OP_BLOCKS_TYPE.CLOSED, type, filterRedStatus)
        .then((filteredStreamsResult) => {
          const { blockedItems, unBlockedItems } = filteredStreamsResult;
          setBlockedItems(blockedItems);
          setUnBlockedItems(unBlockedItems);

          if (!selectedItems.length) {
            if (!blockedItems.length) {
              setLoading(false);
            } else if (blockedItems.length === 1) {
              coreServices.notifications.toasts.addDanger({
                title: `Unable to refresh indexes.`,
                text: `Cannot refresh all open indexes because [${blockedItems.join(", ")}] is in red status.`,
              });
              onClose();
            } else {
              coreServices.notifications.toasts.addDanger({
                title: `Unable to refresh indexes.`,
                text: `Cannot refresh all open indexes because [${blockedItems.join(", ")}] are in red status.`,
              });
              onClose();
            }
          } else if (selectedItems.length != 0 && unBlockedItems.length == 0) {
            coreServices.notifications.toasts.addDanger({
              title: `Unable to refresh ${type}.`,
              text: `All selected ${type} cannot be refreshed because ${getClosedTypeWording({
                type,
              })} are either closed or in red status.`,
            });
            onClose();
          } else {
            setLoading(false);
          }
        })
        .catch(() => {
          /**
           * It's not a critical error although if it fails unlikely other call will succeed,
           * set unblocked items to all, so we won't filter any of the selected items.
           * */
          if (selectedItems.length > 0) {
            let unBlocked;
            switch (type) {
              case INDEX_OP_TARGET_TYPE.ALIAS:
                unBlocked = (selectedItems as IAlias[]).map((item) => item.alias);
                break;
              case INDEX_OP_TARGET_TYPE.DATA_STREAM:
                unBlocked = (selectedItems as DataStream[]).map((item) => item.name);
                break;
              default:
                unBlocked = (selectedItems as CatIndex[]).map((item) => item.index);
                break;
            }
            setBlockedItems([]);
            setUnBlockedItems(unBlocked);
          }
          setLoading(false);
        });
    } else {
      setUnBlockedItems([]);
      setBlockedItems([]);
      setLoading(true);
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
        <EuiSmallButtonEmpty onClick={onClose}>Cancel</EuiSmallButtonEmpty>
        <EuiSmallButton data-test-subj="refreshConfirmButton" onClick={onConfirm} fill>
          Refresh
        </EuiSmallButton>
      </EuiModalFooter>
    </EuiModal>
  );
}
