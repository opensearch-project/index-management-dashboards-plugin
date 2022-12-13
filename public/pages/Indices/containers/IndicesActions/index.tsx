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
import { BrowserServices, RecoveryJobMetaData } from "../../../../models/interfaces";
import { CoreStart } from "opensearch-dashboards/public";
import CloseIndexModal from "../../components/CloseIndexModal";
import OpenIndexModal from "../../components/OpenIndexModal";
import { getErrorMessage } from "../../../../utils/helpers";
import { IndexItem } from "../../../../../models/interfaces";
import { ServerResponse } from "../../../../../server/models/types";
import { ROUTES } from "../../../../utils/constants";

export interface IndicesActionsProps extends Pick<RouteComponentProps, "history"> {
  selectedItems: ManagedCatIndex[];
  onDelete: () => void;
  onOpen: () => void;
  onClose: () => void;
  onShrink: () => void;
  onSplit: () => void;
  getIndices: () => Promise<void>;
}

export default function IndicesActions(props: IndicesActionsProps) {
  const { selectedItems, onDelete, onOpen, onClose, onShrink } = props;
  const [deleteIndexModalVisible, setDeleteIndexModalVisible] = useState(false);
  const [closeIndexModalVisible, setCloseIndexModalVisible] = useState(false);
  const [openIndexModalVisible, setOpenIndexModalVisible] = useState(false);
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
      const toastIntance = coreServices?.notifications.toasts.addSuccess(
        `Successfully started splitting ${selectedItems.map((item) => item.index).join(",")}. The split index will be named ${targetIndex}.`
      );
      onCloseFlyout();
      onSplit();
      jobSchedulerInstance.addJob({
        interval: 30000,
        extras: {
          toastId: toastIntance.id,
          sourceIndex: selectedItems.map((item) => item.index).join(","),
          destIndex: targetIndex,
        },
        type: "split",
      } as RecoveryJobMetaData);
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
    return await services.commonService.apiCaller<{ alias: string }[]>({
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
            data-test-subj="moreAction"
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
    </>
  );
}
