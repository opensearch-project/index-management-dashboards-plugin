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
import SplitIndexFlyout from "../../components/SplitIndexFlyout";
import { BrowserServices } from "../../../../models/interfaces";
import { CoreStart } from "opensearch-dashboards/public";

export interface IndicesActionsProps {
  selectedItems: ManagedCatIndex[];
  onDelete: () => void;
  onOpen: () => void;
  onClose: () => void;
  onShrink: () => void;
}

export default function IndicesActions(props: IndicesActionsProps) {
  const { selectedItems, onDelete, onOpen, onClose, onShrink } = props;
  const [deleteIndexModalVisible, setDeleteIndexModalVisible] = useState(false);
  const [splitIndexFlyoutVisible, setSplitIndexFlyoutVisible] = useState(false);
  const [closeIndexModalVisible, setCloseIndexModalVisible] = useState(false);
  const [openIndexModalVisible, setOpenIndexModalVisible] = useState(false);
  const [shrinkIndexFlyoutVisible, setShrinkIndexFlyoutVisible] = useState(false);
  const coreServices = useContext(CoreServicesContext) as CoreStart;
  const services = useContext(ServicesContext) as BrowserServices;

  const onDeleteIndexModalClose = () => {
    setDeleteIndexModalVisible(false);
  };

  const onDeleteIndexModalConfirm = useCallback(async () => {
    const result = await services.commonService.apiCaller({
      endpoint: "indices.delete",
      data: {
        index: selectedItems.map((item) => item.index).join(","),
      },
    });
    if (result && result.ok) {
      coreServices.notifications.toasts.addSuccess("Delete successfully");
      onDeleteIndexModalClose();
      onDelete();
    } else {
      coreServices.notifications.toasts.addDanger(result?.error || "");
    }
  }, [selectedItems, services, coreServices, onDelete, onDeleteIndexModalClose]);

  const onCloseFlyout = () => {
    setSplitIndexFlyoutVisible(false);
  };

  const splitIndex = async (targetIndex: String, settingsPayload: IndexItem["settings"]) => {
    const result = await services?.commonService.apiCaller({
      endpoint: "indices.split",
      method: "PUT",
      data: {
        index: selectedItems.map((item) => item.index).join(","),
        target: targetIndex,
        body: {
          settings: {
            index: settingsPayload,
          },
        },
      },
    });
    if (result && result.ok) {
      coreServices?.notifications.toasts.addSuccess(`Successfully submit split index request.`);
      onDelete();
    } else {
      coreServices.notifications.toasts.addDanger(result?.error || "");
    }
    onCloseFlyout();
  };

  const onOpenIndexModalClose = () => {
    setOpenIndexModalVisible(false);
  };

  const onOpenIndexModalConfirm = useCallback(async () => {
    try {
      const result = await services.commonService.apiCaller({
        endpoint: "indices.open",
        data: {
          index: selectedItems.map((item) => item.index).join(","),
        },
      });
      if (result && result.ok) {
        onOpenIndexModalClose();
        coreServices.notifications.toasts.addSuccess("Open index successfully");
        onOpen();
      } else {
        coreServices.notifications.toasts.addDanger(result.error);
      }
    } catch (err) {
      coreServices.notifications.toasts.addDanger(getErrorMessage(err, "There was a problem opening index."));
    }
  }, [services, coreServices, props.onClose, onOpenIndexModalClose]);

  const onCloseIndexModalClose = () => {
    setCloseIndexModalVisible(false);
  };

  const onCloseIndexModalConfirm = useCallback(async () => {
    try {
      const result = await services.commonService.apiCaller({
        endpoint: "indices.close",
        data: {
          index: selectedItems.map((item) => item.index).join(","),
        },
      });
      if (result && result.ok) {
        onCloseIndexModalClose();
        coreServices.notifications.toasts.addSuccess("Close index successfully");
        onClose();
      } else {
        coreServices.notifications.toasts.addDanger(result.error);
      }
    } catch (err) {
      coreServices.notifications.toasts.addDanger(getErrorMessage(err, "There was a problem closing index."));
    }
  }, [services, coreServices, props.onClose, onCloseIndexModalClose]);

  const onShrinkIndexFlyoutClose = () => {
    setShrinkIndexFlyoutVisible(false);
  };

  const onShrinkIndexFlyoutConfirm = useCallback(
    async (sourceIndexName: string, targetIndexName: string, indexSettings: {}) => {
      try {
        const requestBody = {
          settings: indexSettings,
        };

        const result = await services.commonService.apiCaller({
          endpoint: "indices.shrink",
          data: {
            index: sourceIndexName,
            target: targetIndexName,
            body: requestBody,
          },
        });
        if (result && result.ok) {
          onShrinkIndexFlyoutClose();
          coreServices.notifications.toasts.addSuccess("Shrink index successfully");
          onShrink();
        } else {
          coreServices.notifications.toasts.addDanger(result.error);
        }
      } catch (err) {
        coreServices.notifications.toasts.addDanger(getErrorMessage(err, "There was a problem shrinking index."));
      }
    },
    [services, coreServices, props.onShrink, onShrinkIndexFlyoutClose]
  );

  const getIndexSettings = async (indexName: string, flat: boolean): Promise<Object> => {
    try {
      const result = await services.commonService.apiCaller({
        endpoint: "indices.getSettings",
        data: {
          index: indexName,
          flat_settings: flat,
        },
      });
      if (result && result.ok) {
        return result.response;
      } else {
        coreServices.notifications.toasts.addDanger(result.error);
      }
    } catch (err) {
      coreServices.notifications.toasts.addDanger(getErrorMessage(err, "There was a problem getting index settings."));
    }
  };

  const renderKey = useMemo(() => Date.now(), [selectedItems]);

  return (
    <>
      <ModalConsumer>
        {({ onShow }) => (
          <SimplePopover
            data-test-subj="More Action"
            panelPaddingSize="none"
            button={
              <EuiButton iconType="arrowDown" iconSide="right">
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
                      name: "Open",
                      disabled: !selectedItems.length,
                      "data-test-subj": "Open Action",
                      onClick: () => setOpenIndexModalVisible(true),
                    },
                    {
                      name: "Close",
                      disabled: !selectedItems.length,
                      "data-test-subj": "Close Action",
                      onClick: () => setCloseIndexModalVisible(true),
                    },
                    {
                      name: "Shrink",
                      disabled: !selectedItems.length || selectedItems.length != 1,
                      "data-test-subj": "Shrink Action",
                      onClick: () => setShrinkIndexFlyoutVisible(true),
                    },
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
                      name: "Split",
                      disabled: !selectedItems.length || selectedItems.length > 1 || HEALTH_STATUS_RED === selectedItems[0].health,
                      "data-test-subj": "Split Action",
                      onClick: () => setSplitIndexFlyoutVisible(true),
                    },
                    {
                      name: "Delete",
                      disabled: !selectedItems.length,
                      "data-test-subj": "Delete Action",
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

      {shrinkIndexFlyoutVisible && (
        <ShrinkIndexFlyout
          sourceIndex={selectedItems[0]}
          onClose={onShrinkIndexFlyoutClose}
          onConfirm={onShrinkIndexFlyoutConfirm}
          getIndexSettings={getIndexSettings}
        />
      )}
      {splitIndexFlyoutVisible && <SplitIndexFlyout onCloseFlyout={onCloseFlyout} onSplitIndex={splitIndex} />}
    </>
  );
}
