/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useCallback, useContext, useMemo, useState } from "react";
import { EuiButton, EuiContextMenu } from "@elastic/eui";

import { ManagedCatIndex } from "../../../../../server/models/interfaces";
import ApplyPolicyModal from "../../components/ApplyPolicyModal";
import SimplePopover from "../../../../components/SimplePopover";
import { ModalConsumer } from "../../../../components/Modal";
import { CoreServicesContext } from "../../../../components/core_services";
import DeleteIndexModal from "../../components/DeleteIndexModal";
import { ServicesContext } from "../../../../services";
import { BrowserServices } from "../../../../models/interfaces";
import { CoreStart } from "opensearch-dashboards/public";
import CloseIndexModal from "../../components/CloseIndexModal";
import OpenIndexModal from "../../components/OpenIndexModal";
import ClearCacheModal from "../../../../containers/ClearCacheModal";
import FlushIndexModal from "../../../../containers/FlushIndexModal";
import { getErrorMessage } from "../../../../utils/helpers";
import { ROUTES, INDEX_OP_TARGET_TYPE } from "../../../../utils/constants";
import { RouteComponentProps } from "react-router-dom";
import { openIndices } from "../../utils/helpers";
import RefreshActionModal from "../../../../containers/RefreshAction";
import { getUISettings } from "../../../../services/Services";

export interface IndicesActionsProps extends Pick<RouteComponentProps, "history"> {
  selectedItems: ManagedCatIndex[];
  onDelete: () => void;
  onClose: () => void;
  onShrink: () => void;
}

export default function IndicesActions(props: IndicesActionsProps) {
  const { selectedItems, onDelete, onClose } = props;
  const [deleteIndexModalVisible, setDeleteIndexModalVisible] = useState(false);
  const [closeIndexModalVisible, setCloseIndexModalVisible] = useState(false);
  const [clearCacheModalVisible, setClearCacheModalVisible] = useState(false);
  const [openIndexModalVisible, setOpenIndexModalVisible] = useState(false);
  const [flushIndexModalVisible, setFlushIndexModalVisible] = useState(false);
  const [refreshModalVisible, setRefreshModalVisible] = useState(false);
  const coreServices = useContext(CoreServicesContext) as CoreStart;
  const services = useContext(ServicesContext) as BrowserServices;

  const onDeleteIndexModalClose = () => {
    setDeleteIndexModalVisible(false);
  };

  const onDeleteIndexModalConfirm = useCallback(async () => {
    const indexPayload = selectedItems.map((item) => item.index).join(",");
    const result = await services.commonService.apiCaller({
      endpoint: "indices.delete",
      data: {
        index: indexPayload,
      },
    });
    if (result && result.ok) {
      coreServices.notifications.toasts.addSuccess(`Delete [${indexPayload}] successfully`);
      onDeleteIndexModalClose();
      onDelete();
    } else {
      coreServices.notifications.toasts.addDanger(result?.error || "");
    }
  }, [selectedItems, services, coreServices, onDelete, onDeleteIndexModalClose]);

  const onClearCacheModalClose = () => {
    setClearCacheModalVisible(false);
  };

  const onOpenIndexModalClose = () => {
    setOpenIndexModalVisible(false);
  };

  const openIndicesHandler = async (indices: string[], callback: any) => {
    const result = await openIndices({
      commonService: services.commonService,
      coreServices,
      indices,
    });
    if (result.ok) {
      callback && callback();
    }
  };

  const onOpenIndexModalConfirm = useCallback(async () => {
    await openIndicesHandler(
      selectedItems.map((item) => item.index),
      () => {
        onOpenIndexModalClose();
      }
    );
  }, [services, coreServices, props.onClose, onOpenIndexModalClose]);

  const onCloseIndexModalClose = () => {
    setCloseIndexModalVisible(false);
  };

  const onCloseIndexModalConfirm = useCallback(async () => {
    try {
      const indexPayload = selectedItems.map((item) => item.index).join(",");
      const result = await services.commonService.apiCaller({
        endpoint: "indices.close",
        data: {
          index: indexPayload,
        },
      });
      if (result && result.ok) {
        onCloseIndexModalClose();
        coreServices.notifications.toasts.addSuccess(`Close [${indexPayload}] successfully`);
        onClose();
      } else {
        coreServices.notifications.toasts.addDanger(result.error);
      }
    } catch (err) {
      coreServices.notifications.toasts.addDanger(getErrorMessage(err, "There was a problem closing index."));
    }
  }, [services, coreServices, props.onClose, onCloseIndexModalClose]);

  const onFlushIndexModalClose = () => {
    setFlushIndexModalVisible(false);
  };

  const onRefreshModalClose = () => {
    setRefreshModalVisible(false);
  };

  const renderKey = useMemo(() => Date.now(), [selectedItems]);
  const uiSettings = getUISettings();
  const useUpdatedUX = uiSettings.get("home:useNewHomePage");

  const size = useUpdatedUX ? "s" : undefined;

  return (
    <>
      <ModalConsumer>
        {({ onShow }) => (
          <SimplePopover
            data-test-subj="moreAction"
            panelPaddingSize="none"
            button={
              <EuiButton iconType="arrowDown" iconSide="right" size={size}>
                Actions
              </EuiButton>
            }
          >
            <EuiContextMenu
              initialPanelId={0}
              // The EuiContextMenu has bug when testing in jest
              // the props change won't make it rerender
              key={renderKey}
              panels={[
                {
                  id: 0,
                  items: [
                    {
                      name: "Apply policy",
                      disabled: !selectedItems.length,
                      "data-test-subj": "Apply policyButton",
                      onClick: () =>
                        onShow(ApplyPolicyModal, {
                          indices: selectedItems.map((item: ManagedCatIndex) => item.index),
                          core: CoreServicesContext,
                        }),
                    },
                    {
                      isSeparator: true,
                    },
                    {
                      name: "Close",
                      disabled: !selectedItems.length,
                      "data-test-subj": "Close Action",
                      onClick: () => setCloseIndexModalVisible(true),
                    },
                    {
                      name: "Open",
                      disabled: !selectedItems.length,
                      "data-test-subj": "Open Action",
                      onClick: () => setOpenIndexModalVisible(true),
                    },
                    {
                      isSeparator: true,
                    },
                    {
                      name: "Reindex",
                      "data-test-subj": "Reindex Action",
                      onClick: () => {
                        let source = "";
                        if (selectedItems.length > 0) {
                          source = `?source=${selectedItems.map((item) => item.index).join(",")}`;
                        }
                        props.history.push(`${ROUTES.REINDEX}${source}`);
                      },
                    },
                    {
                      name: "Shrink",
                      disabled: !selectedItems.length || selectedItems.length > 1 || !!selectedItems[0].data_stream,
                      "data-test-subj": "Shrink Action",
                      onClick: () => {
                        let source = "";
                        if (selectedItems.length > 0) {
                          source = `?source=${selectedItems[0].index}`;
                        }
                        props.history.push(`${ROUTES.SHRINK_INDEX}${source}`);
                      },
                    },
                    {
                      name: "Split",
                      "data-test-subj": "Split Action",
                      disabled: !selectedItems.length || selectedItems.length > 1 || selectedItems[0].data_stream !== null,
                      onClick: () => {
                        const source = `?source=${selectedItems[0].index}`;
                        props.history.push(`${ROUTES.SPLIT_INDEX}${source}`);
                      },
                    },
                    {
                      name: "Force merge",
                      "data-test-subj": "ForceMergeAction",
                      onClick: () => {
                        props.history.push(`${ROUTES.FORCE_MERGE}/${selectedItems.map((item) => item.index).join(",")}`);
                      },
                    },
                    {
                      isSeparator: true,
                    },
                    {
                      name: "Clear cache",
                      "data-test-subj": "Clear cache Action",
                      onClick: () => setClearCacheModalVisible(true),
                    },
                    {
                      name: "Flush",
                      "data-test-subj": "Flush Action",
                      onClick: () => setFlushIndexModalVisible(true),
                    },
                    {
                      name: "Refresh",
                      "data-test-subj": "Refresh Index Action",
                      onClick: () => setRefreshModalVisible(true),
                    },
                    {
                      isSeparator: true,
                    },
                    {
                      name: "Delete",
                      disabled: !selectedItems.length,
                      "data-test-subj": "deleteAction",
                      onClick: () => setDeleteIndexModalVisible(true),
                    },
                  ],
                },
              ]}
            />
          </SimplePopover>
        )}
      </ModalConsumer>
      <DeleteIndexModal
        selectedItems={selectedItems.map((item) => item.index)}
        visible={deleteIndexModalVisible}
        onClose={onDeleteIndexModalClose}
        onConfirm={onDeleteIndexModalConfirm}
      />

      <OpenIndexModal
        selectedItems={selectedItems.map((item) => item.index)}
        visible={openIndexModalVisible}
        onClose={onOpenIndexModalClose}
        onConfirm={onOpenIndexModalConfirm}
      />

      <CloseIndexModal
        selectedItems={selectedItems.map((item) => item.index)}
        visible={closeIndexModalVisible}
        onClose={onCloseIndexModalClose}
        onConfirm={onCloseIndexModalConfirm}
      />

      <ClearCacheModal
        selectedItems={selectedItems}
        visible={clearCacheModalVisible}
        onClose={onClearCacheModalClose}
        type={INDEX_OP_TARGET_TYPE.INDEX}
      />

      <FlushIndexModal
        selectedItems={selectedItems}
        visible={flushIndexModalVisible}
        onClose={onFlushIndexModalClose}
        flushTarget={INDEX_OP_TARGET_TYPE.INDEX}
      />

      <RefreshActionModal
        selectedItems={selectedItems}
        visible={refreshModalVisible}
        onClose={onRefreshModalClose}
        type={INDEX_OP_TARGET_TYPE.INDEX}
      />
    </>
  );
}
