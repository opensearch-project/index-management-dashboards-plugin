/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useContext, useEffect, useState } from "react";
import { CoreStart } from "opensearch-dashboards/public";
import { CatIndex, DataStream } from "../../../server/models/interfaces";
import { IAlias } from "../../pages/Aliases/interface";
import { ServicesContext } from "../../services";
import { CoreServicesContext } from "../../components/core_services";
import { INDEX_OP_BLOCKS_TYPE, INDEX_OP_TARGET_TYPE } from "../../utils/constants";
import { getErrorMessage, filterBlockedItems } from "../../utils/helpers";
import {
  EuiSmallButton,
  EuiButtonEmpty,
  EuiCallOut,
  EuiModal,
  EuiModalBody,
  EuiModalFooter,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiSpacer,
} from "@elastic/eui";

export interface ClearCacheModalProps {
  selectedItems: CatIndex[] | DataStream[] | IAlias[];
  visible: boolean;
  onClose: () => void;
  type: string;
}

export default function ClearCacheModal(props: ClearCacheModalProps) {
  const { onClose, visible, selectedItems, type } = props;
  const [hint, setHint] = useState("");
  const [blockHint, setBlockHint] = useState("");
  const [unBlockedItems, setUnBlockedItems] = useState([] as string[]);
  const [blockedItems, setBlockedItems] = useState([] as string[]);
  const [loading, setLoading] = useState(true);

  const services = useContext(ServicesContext);
  const coreServices = useContext(CoreServicesContext) as CoreStart;

  useEffect(() => {
    const indexBlocksTypes = [
      INDEX_OP_BLOCKS_TYPE.CLOSED,
      INDEX_OP_BLOCKS_TYPE.META_DATA,
      INDEX_OP_BLOCKS_TYPE.READ_ONLY,
      INDEX_OP_BLOCKS_TYPE.READ_ONLY_ALLOW_DELETE,
    ];
    if (!!services && visible) {
      switch (type) {
        case INDEX_OP_TARGET_TYPE.DATA_STREAM:
          setHint("Cache will be cleared for the following data streams.");
          setBlockHint(
            "Cache will not be cleared for the following data streams because one or more backing indexes are closed or blocked."
          );
          filterBlockedItems(services, selectedItems, indexBlocksTypes, INDEX_OP_TARGET_TYPE.DATA_STREAM, false)
            .then((filteredDataStreamsResult) => {
              setUnBlockedItems(filteredDataStreamsResult.unBlockedItems);
              setBlockedItems(filteredDataStreamsResult.blockedItems);
            })
            .catch(() => {
              // set unBlockedItems to all when filter is failed
              setUnBlockedItems((selectedItems as DataStream[]).map((item) => item.name));
            })
            .finally(() => {
              setLoading(false);
            });
          break;
        case INDEX_OP_TARGET_TYPE.ALIAS:
          setHint("Cache will be cleared for the following aliases.");
          setBlockHint("Cache will not be cleared for the following aliases because one or more indexes are closed or blocked.");
          filterBlockedItems(services, selectedItems as IAlias[], indexBlocksTypes, INDEX_OP_TARGET_TYPE.ALIAS, false)
            .then((filteredAliasesResult) => {
              setUnBlockedItems(filteredAliasesResult.unBlockedItems);
              setBlockedItems(filteredAliasesResult.blockedItems);
            })
            .catch(() => {
              // set unBlockedItems to all when filter is failed
              setUnBlockedItems((selectedItems as IAlias[]).map((item) => item.alias));
            })
            .finally(() => {
              setLoading(false);
            });
          break;
        default:
          setHint("Cache will be cleared for the following indexes.");
          setBlockHint("Cache will not be cleared for the following indexes because they may be closed or blocked.");
          filterBlockedItems(services, selectedItems as CatIndex[], indexBlocksTypes, INDEX_OP_TARGET_TYPE.INDEX, false)
            .then((filteredIndexesResult) => {
              setUnBlockedItems(filteredIndexesResult.unBlockedItems);
              setBlockedItems(filteredIndexesResult.blockedItems);
            })
            .catch(() => {
              // set unBlockedItems to all when filter is failed
              setUnBlockedItems((selectedItems as CatIndex[]).map((item) => item.index));
            })
            .finally(() => {
              setLoading(false);
            });
      }
    } else if (!visible) {
      setUnBlockedItems([] as string[]);
      setBlockedItems([] as string[]);
      setLoading(true);
    }
  }, [services, visible, type, selectedItems]);

  const onConfirm = useCallback(async () => {
    if (!!services) {
      try {
        const result = await services.commonService.apiCaller({
          endpoint: "indices.clearCache",
          data: {
            index: unBlockedItems.join(",") || "_all",
          },
        });
        if (result && result.ok) {
          onClose();
          let toast = "";
          if (unBlockedItems.length > 1) {
            toast = `Cache for ${unBlockedItems.length} ${type} [${unBlockedItems.join(", ")}] have been successfully cleared.`;
          } else if (unBlockedItems.length == 1) {
            toast = `Cache for ${unBlockedItems[0]} has been successfully cleared.`;
          }

          if (!selectedItems || selectedItems.length == 0) {
            toast = "Cache for all open indexes have been successfully cleared.";
          }
          coreServices.notifications.toasts.addSuccess(toast);
        } else {
          if (result.error.includes("cluster_block_exception")) {
            coreServices.notifications.toasts.addError(new Error(result.error), {
              title: "Clear cache failed.",
              toastMessage: "One or more indexes are blocked.",
            });
          } else {
            coreServices.notifications.toasts.addError(new Error(result.error), {
              title: "Clear cache failed.",
            });
          }
        }
      } catch (err) {
        coreServices.notifications.toasts.addDanger({
          title: "Unable to clear cache",
          text: getErrorMessage(err, "There was a problem clearing cache."),
        });
      }
    }
  }, [services, coreServices, onClose, unBlockedItems, selectedItems, type]);

  useEffect(() => {
    if (visible && selectedItems.length > 0 && selectedItems.length == blockedItems.length) {
      if (selectedItems.length == 1) {
        coreServices.notifications.toasts.addDanger({
          title: "Unable to clear cache",
          text: `Cache cannot be cleared for ${blockedItems[0]} because it is closed or blocked.`,
        });
      } else {
        coreServices.notifications.toasts.addDanger({
          title: "Unable to clear cache",
          text: `Cache cannot be cleared for the selected ${type} because they are closed or blocked.`,
        });
      }
      onClose();
    }
  }, [visible, unBlockedItems, blockedItems, coreServices, onClose, type]);

  if (!visible || loading) {
    return null;
  }

  const specificIndexesChildren: React.ReactChild = (
    <>
      <div style={{ lineHeight: 1.5 }}>
        {unBlockedItems.length > 0 && (
          <>
            <p>{hint}</p>
            <ul style={{ listStyleType: "disc", listStylePosition: "inside" }}>
              {unBlockedItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <EuiSpacer />
          </>
        )}
      </div>
      <EuiCallOut color="warning" iconType="warning" hidden={blockedItems.length == 0} size="s">
        <p>{blockHint}</p>
        <ul style={{ listStyleType: "disc", listStylePosition: "inside" }}>
          {blockedItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </EuiCallOut>
    </>
  );

  const noSpecificIndexesChildren: React.ReactChild = (
    <>
      <div style={{ lineHeight: 1.5 }}>
        <p>Cache will be cleared for all open indexes.</p>
        <EuiSpacer />
      </div>
    </>
  );

  return (
    <EuiModal onClose={onClose}>
      <EuiModalHeader>
        <EuiModalHeaderTitle>Clear cache for {type}</EuiModalHeaderTitle>
      </EuiModalHeader>

      <EuiModalBody>{!!selectedItems && selectedItems.length > 0 ? specificIndexesChildren : noSpecificIndexesChildren}</EuiModalBody>

      <EuiModalFooter>
        <EuiButtonEmpty data-test-subj="ClearCacheCancelButton" onClick={onClose}>
          Cancel
        </EuiButtonEmpty>
        <EuiSmallButton
          data-test-subj="ClearCacheConfirmButton"
          onClick={onConfirm}
          fill
          isDisabled={selectedItems.length > 0 && unBlockedItems.length == 0}
        >
          Clear cache
        </EuiSmallButton>
      </EuiModalFooter>
    </EuiModal>
  );
}
