/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useContext, useEffect, useState } from "react";
import { CoreStart } from "opensearch-dashboards/public";
import { CatIndex, DataStream } from "../../../server/models/interfaces";
import { IAlias } from "../../pages/Aliases/interface";
import { ServicesContext } from "../../services";
import { CoreServicesContext } from "../core_services";
import { IndexOpBlocksType } from "../../utils/constants";
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
  EuiModal,
  EuiModalBody,
  EuiModalFooter,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiSpacer,
} from "@elastic/eui";

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

  const services = useContext(ServicesContext);
  const coreServices = useContext(CoreServicesContext) as CoreStart;

  useEffect(() => {
    const indexBlocksTypes = [
      IndexOpBlocksType.Closed,
      IndexOpBlocksType.MetaData,
      IndexOpBlocksType.ReadOnly,
      IndexOpBlocksType.ReadOnlyAllowDelete,
    ];
    if (!!services && !!visible) {
      switch (type) {
        case "data streams":
          setHint("Caches of the backing indexes behind the following data streams will be cleared.");
          setBlockHint(
            "Caches of the backing indexes behind the following data streams will not be cleared because of index closed or other blocks."
          );
          filterBlockedItems<DataStream>(services, selectedItems as DataStream[], indexBlocksTypes, dataStreamBlockedPredicate).then(
            (filteredDataStreamsResult) => {
              setUnBlockedItems(filteredDataStreamsResult.unBlockedItems.map((item) => item.name));
              setBlockedItems(filteredDataStreamsResult.blockedItems.map((item) => item.name));
            }
          );
          break;
        case "aliases":
          setHint("Caches of the indexes behind the following aliases will be cleared.");
          setBlockHint("Caches of the indexes behind the following aliases will not be cleared because of index closed or other blocks.");
          filterBlockedItems<IAlias>(services, selectedItems as IAlias[], indexBlocksTypes, aliasBlockedPredicate).then(
            (filteredAliasesResult) => {
              setUnBlockedItems(filteredAliasesResult.unBlockedItems.map((item) => item.alias));
              setBlockedItems(filteredAliasesResult.blockedItems.map((item) => item.alias));
            }
          );
          break;
        default:
          setHint("Caches of the folowing indexes will be cleared.");
          setBlockHint("Caches of the following indexes will not be cleared because of index closed or other blocks.");
          filterBlockedItems<CatIndex>(services, selectedItems as CatIndex[], indexBlocksTypes, indexBlockedPredicate).then(
            (filteredIndexesResult) => {
              setUnBlockedItems(filteredIndexesResult.unBlockedItems.map((item) => item.index));
              setBlockedItems(filteredIndexesResult.blockedItems.map((item) => item.index));
            }
          );
      }
    }
  }, [visible]);

  const onConfirm = useCallback(async () => {
    if (services) {
      try {
        const result = await services.commonService.apiCaller({
          endpoint: "indices.clearCache",
          data: {
            index: unBlockedItems.join(","),
          },
        });
        if (result && result.ok) {
          onClose();
          let toast = `Clear caches for [${unBlockedItems}] successfully`;
          if (!selectedItems || selectedItems.length == 0) {
            toast = "Clear caches for all indexes successfully";
          }
          coreServices.notifications.toasts.addSuccess(toast);
        } else {
          coreServices.notifications.toasts.addDanger(result.error);
        }
      } catch (err) {
        coreServices.notifications.toasts.addDanger(getErrorMessage(err, "There was a problem clearing caches."));
      }
    }
  }, [services, coreServices, onClose, unBlockedItems]);

  if (!visible) {
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
          </>
        )}
        {blockedItems.length > 0 && (
          <>
            <p>{blockHint}</p>
            <ul style={{ listStyleType: "disc", listStylePosition: "inside" }}>
              {blockedItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </>
        )}
        <EuiSpacer />
      </div>
    </>
  );

  const noSpecificIndexesChildren: React.ReactChild = (
    <>
      <div style={{ lineHeight: 1.5 }}>
        <p>All indexes' caches will be cleared.</p>
        <EuiSpacer />
      </div>
    </>
  );

  return (
    <EuiModal onClose={onClose}>
      <EuiModalHeader>
        <EuiModalHeaderTitle>Clear cache</EuiModalHeaderTitle>
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
