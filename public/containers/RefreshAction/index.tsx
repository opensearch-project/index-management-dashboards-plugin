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

  useEffect(() => {
    if (!!services && visible) {
      switch (type) {
        case INDEX_OP_TARGET_TYPE.INDEX:
          filterBlockedItems<CatIndex>(services, selectedItems as CatIndex[], IndexOpBlocksType.Closed, indexBlockedPredicate).then(
            (filteredStreamsResult) => {
              setUnBlockedItems(filteredStreamsResult.unBlockedItems.map((item) => item.index));
              setBlockedItems(filteredStreamsResult.blockedItems.map((item) => item.index));
            }
          );
          break;
        case INDEX_OP_TARGET_TYPE.ALIAS:
          filterBlockedItems<IAlias>(services, selectedItems as IAlias[], IndexOpBlocksType.Closed, aliasBlockedPredicate).then(
            (filteredDataStreamsResult) => {
              setUnBlockedItems(filteredDataStreamsResult.unBlockedItems.map((item) => item.alias));
              setBlockedItems(filteredDataStreamsResult.blockedItems.map((item) => item.alias));
            }
          );
          break;
        case INDEX_OP_TARGET_TYPE.DATA_STREAM:
          filterBlockedItems<DataStream>(
            services,
            selectedItems as DataStream[],
            IndexOpBlocksType.Closed,
            dataStreamBlockedPredicate
          ).then((filteredDataStreamsResult) => {
            setUnBlockedItems(filteredDataStreamsResult.unBlockedItems.map((item) => item.name));
            setBlockedItems(filteredDataStreamsResult.blockedItems.map((item) => item.name));
          });
          break;
      }
    } else {
      setUnBlockedItems([]);
      setBlockedItems([]);
    }
  }, [visible, services]);

  const onConfirm = useCallback(async () => {
    if (!!services) {
      const result = await services.commonService.apiCaller({
        endpoint: "indices.refresh",
        data: {
          index: unBlockedItems.join(","),
        },
      });
      if (result && result.ok) {
        let message = `Refresh ${type} [${unBlockedItems.join(",")}] successfully`;
        if (selectedItems.length === 0) {
          message = `Refresh all open indexes successfully`;
        }
        coreServices.notifications.toasts.addSuccess(message);
        onClose();
      } else {
        coreServices.notifications.toasts.addDanger(result?.error || "");
      }
    }
  }, [unBlockedItems, services, coreServices]);

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
              <p>The following {type} will be refreshed.</p>
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
              <EuiCallOut color="warning" iconType="alert" title={`The following ${type} will not be refreshed because they are closed.`} />
              <p />
              <ul style={{ listStyleType: "disc", listStylePosition: "inside" }}>
                {blockedItems.map((item) => (
                  <li key={item} data-test-subj={`BlockedItem-${item}`}>
                    {item}
                  </li>
                ))}
              </ul>
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
