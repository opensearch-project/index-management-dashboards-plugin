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
import { IndexOpBlocksType, SOURCE_PAGE_TYPE } from "../../utils/constants";
import { Modal } from "../../components/Modal";
import {
  getErrorMessage,
  aliasBlockedPredicate,
  indexBlockedPredicate,
  dataStreamBlockedPredicate,
  filterBlockedItems,
} from "../../utils/helpers";
import {
  EuiButton,
  EuiButtonEmpty,
  EuiCallOut,
  EuiText,
  EuiModal,
  EuiModalBody,
  EuiModalFooter,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiSpacer,
} from "@elastic/eui";
import { OuiCallOut } from "@opensearch-project/oui";

interface ClearCacheModalProps<T> {
  selectedItems: T[];
  visible: boolean;
  onClose: () => void;
  type: string;
}

export default function ClearCacheModal<T>(props: ClearCacheModalProps<T>) {
  const { onClose, visible, selectedItems, type } = props;
  const [hint, setHint] = useState("");
  const [blockHint, setBlockHint] = useState("");
  const [unBlockedItems, setUnBlockedItems] = useState([] as string[]);
  const [blockedItems, setBlockedItems] = useState([] as string[]);
  const [loading, setLoading] = useState(false);

  const services = useContext(ServicesContext);
  const coreServices = useContext(CoreServicesContext) as CoreStart;

  useEffect(() => {
    const indexBlocksTypes = [
      IndexOpBlocksType.Closed,
      IndexOpBlocksType.MetaData,
      IndexOpBlocksType.ReadOnly,
      IndexOpBlocksType.ReadOnlyAllowDelete,
    ];
    if (!!services && visible) {
      setLoading(true);
      switch (type) {
        case SOURCE_PAGE_TYPE.DATA_STREAMS:
          setHint("Cache will be cleared for the following data streams.");
          setBlockHint(
            "Cache will not be cleared for the following data streams because one or more backing indexes are closed or blocked."
          );
          filterBlockedItems<DataStream>(services, selectedItems as DataStream[], indexBlocksTypes, dataStreamBlockedPredicate)
            .then((filteredDataStreamsResult) => {
              setUnBlockedItems(filteredDataStreamsResult.unBlockedItems.map((item) => item.name));
              setBlockedItems(filteredDataStreamsResult.blockedItems.map((item) => item.name));
            })
            .catch(() => {
              // set unBlockedItems to all when filter is failed
              const items = selectedItems as DataStream[];
              setUnBlockedItems(items.map((item) => item.name));
            })
            .finally(() => {
              setLoading(false);
            });
          break;
        case SOURCE_PAGE_TYPE.ALIASES:
          setHint("Cache will be cleared for the following aliases.");
          setBlockHint("Cache will not be cleared for the following aliases because one or more indexes are closed or blocked.");
          filterBlockedItems<IAlias>(services, selectedItems as IAlias[], indexBlocksTypes, aliasBlockedPredicate)
            .then((filteredAliasesResult) => {
              setUnBlockedItems(filteredAliasesResult.unBlockedItems.map((item) => item.alias));
              setBlockedItems(filteredAliasesResult.blockedItems.map((item) => item.alias));
            })
            .catch(() => {
              // set unBlockedItems to all when filter is failed
              const items = selectedItems as IAlias[];
              setUnBlockedItems(items.map((item) => item.alias));
            })
            .finally(() => {
              setLoading(false);
            });
          break;
        default:
          setHint("Cache will be cleared for the following indexes.");
          setBlockHint("Cache will not be cleared for the following indexes because they may be closed or blocked.");
          filterBlockedItems<CatIndex>(services, selectedItems as CatIndex[], indexBlocksTypes, indexBlockedPredicate)
            .then((filteredIndexesResult) => {
              setUnBlockedItems(filteredIndexesResult.unBlockedItems.map((item) => item.index));
              setBlockedItems(filteredIndexesResult.blockedItems.map((item) => item.index));
            })
            .catch(() => {
              // set unBlockedItems to all when filter is failed
              const items = selectedItems as CatIndex[];
              setUnBlockedItems(items.map((item) => item.index));
            })
            .finally(() => {
              setLoading(false);
            });
      }
    } else if (!visible) {
      setUnBlockedItems([] as string[]);
      setBlockedItems([] as string[]);
      setLoading(false);
    }
  }, [services, visible, type, selectedItems, setLoading]);

  const onConfirm = useCallback(async () => {
    if (!!services) {
      try {
        const result = await services.commonService.apiCaller({
          endpoint: "indices.clearCache",
          data: {
            index: unBlockedItems.join(","),
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
        <EuiButton
          data-test-subj="ClearCacheConfirmButton"
          onClick={onConfirm}
          fill
          isDisabled={selectedItems.length > 0 && unBlockedItems.length == 0}
        >
          Clear cache
        </EuiButton>
      </EuiModalFooter>
    </EuiModal>
  );
}
