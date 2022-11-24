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
import ShrinkIndexFlyout from "../../components/ShrinkIndexFlyout";
import { getErrorMessage } from "../../../../utils/helpers";
import SplitIndexFlyout from "../../components/SplitIndexFlyout";
import { IndexItem } from "../../../../../models/interfaces";
import { ServerResponse } from "../../../../../server/models/types";
import { ROUTES } from "../../../../utils/constants";
import { RouteComponentProps } from "react-router-dom";

export interface IndicesActionsProps extends RouteComponentProps {
  selectedItems: ManagedCatIndex[];
  onDelete: () => void;
  onOpen: () => void;
  onClose: () => void;
  onShrink: () => void;
  getIndices: () => Promise<void>;
}

export default function IndicesActions(props: IndicesActionsProps) {
  const { selectedItems, onDelete, onOpen, onClose, onShrink } = props;
  const [deleteIndexModalVisible, setDeleteIndexModalVisible] = useState(false);
  const [closeIndexModalVisible, setCloseIndexModalVisible] = useState(false);
  const [openIndexModalVisible, setOpenIndexModalVisible] = useState(false);
  const [shrinkIndexFlyoutVisible, setShrinkIndexFlyoutVisible] = useState(false);
  const [splitIndexFlyoutVisible, setSplitIndexFlyoutVisible] = useState(false);
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

  const onCloseFlyout = () => {
    setSplitIndexFlyoutVisible(false);
  };

  const splitIndex = async (targetIndex: String, settingsPayload: Required<IndexItem>["settings"]) => {
    const { aliases, ...settings } = settingsPayload;
    const result = await services?.commonService.apiCaller({
      endpoint: "indices.split",
      method: "PUT",
      data: {
        index: selectedItems.map((item) => item.index).join(","),
        target: targetIndex,
        body: {
          settings: {
            ...settings,
          },
          aliases,
        },
      },
    });
    if (result && result.ok) {
      coreServices?.notifications.toasts.addSuccess(`Successfully submit split index request.`);
      onCloseFlyout();
      onDelete();
    } else {
      coreServices.notifications.toasts.addDanger(
        result?.error || "There was a problem submit split index request, please check with admin"
      );
    }
  };

  const onOpenIndexModalClose = () => {
    setOpenIndexModalVisible(false);
  };

  const openIndices = async (indices: string[], callback: any) => {
    try {
      const indexPayload = selectedItems.map((item) => item.index).join(",");
      const result = await services.commonService.apiCaller({
        endpoint: "indices.open",
        data: {
          index: indexPayload,
        },
      });
      if (result && result.ok) {
        coreServices.notifications.toasts.addSuccess(`Open [${indexPayload}] successfully`);
        callback && callback();
      } else {
        coreServices.notifications.toasts.addDanger(result.error);
      }
    } catch (err) {
      coreServices.notifications.toasts.addDanger(getErrorMessage(err, "There was a problem opening index."));
    }
  };

  const onOpenIndexModalConfirm = useCallback(async () => {
    await openIndices(
      selectedItems.map((item) => item.index),
      () => {
        onOpenIndexModalClose();
        onOpen();
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

  const getIndexSettings = async (indexName: string, flat: boolean): Promise<Record<string, IndexItem>> => {
    const result: ServerResponse<Record<string, IndexItem>> = await services.commonService.apiCaller({
      endpoint: "indices.getSettings",
      data: {
        index: indexName,
        flat_settings: flat,
      },
    });
    if (result && result.ok) {
      return result.response;
    } else {
      console.log("result:" + JSON.stringify(result));
      const errorMessage = `There is a problem getting index setting for ${indexName}, please check with Admin`;
      coreServices.notifications.toasts.addDanger(result?.error || errorMessage);
      throw new Error(result?.error || errorMessage);
    }
  };

  const setIndexSettings = async (indexName: string, flat: boolean, settings: {}) => {
    const result = await services.commonService.apiCaller({
      endpoint: "indices.putSettings",
      method: "PUT",
      data: {
        index: indexName,
        flat_settings: flat,
        body: {
          settings: {
            ...settings,
          },
        },
      },
    });
    if (result && result.ok) {
      coreServices.notifications.toasts.addSuccess(`Successfully update index setting for ${indexName}`);
    } else {
      const errorMessage = `There is a problem set index setting for ${indexName}, please check with Admin`;
      coreServices.notifications.toasts.addDanger(result?.error || errorMessage);
      throw new Error(result?.error || errorMessage);
    }
  };

  const getAlias = async (aliasName: string) => {
    return await services.commonService.apiCaller({
      endpoint: "cat.aliases",
      method: "GET",
      data: {
        format: "json",
        name: `${aliasName || ""}*`,
        expand_wildcards: "open",
      },
    });
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
                      disabled: !selectedItems.length || selectedItems.length != 1,
                      "data-test-subj": "Shrink Action",
                      onClick: () => setShrinkIndexFlyoutVisible(true),
                    },
                    {
                      name: "Split",
                      "data-test-subj": "Split Action",
                      disabled: !selectedItems.length || selectedItems.length > 1,
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
          setIndexSettings={setIndexSettings}
        />
      )}

      {splitIndexFlyoutVisible && (
        <SplitIndexFlyout
          sourceIndex={selectedItems[0]}
          onCloseFlyout={onCloseFlyout}
          onSplitIndex={splitIndex}
          getIndexSettings={getIndexSettings}
          setIndexSettings={setIndexSettings}
          openIndex={onOpenIndexModalConfirm}
          getAlias={getAlias}
        />
      )}
    </>
  );
}
