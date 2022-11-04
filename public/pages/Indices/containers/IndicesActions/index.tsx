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
import { REQUEST } from "../../../../../utils/constants";
import { ReindexRequest } from "../../models/interfaces";
import { ServicesContext } from "../../../../services";
import { BrowserServices } from "../../../../models/interfaces";
import { CoreStart } from "opensearch-dashboards/public";
import ReindexFlyout from "../../components/ReindexFlyout";

export interface IndicesActionsProps {
  selectedItems: ManagedCatIndex[];
  onDelete: () => void;
  onReindex?: () => void;
}

export default function IndicesActions(props: IndicesActionsProps) {
  const { selectedItems, onDelete, onReindex } = props;
  const [deleteIndexModalVisible, setDeleteIndexModalVisible] = useState(false);
  const [isReindexFlyoutVisible, setIsReindexFlyoutVisible] = useState(false);
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
  }, [services, coreServices, props.onDelete, onDeleteIndexModalClose]);

  const onReindexConfirm = async (reindexRequest: ReindexRequest) => {
    const res = await services.commonService.apiCaller({
      endpoint: "reindex",
      method: REQUEST.POST,
      data: reindexRequest,
    });
    if (res && res.ok) {
      // @ts-ignore
      let toast = `Reindex from [${reindexRequest.body.source.index}] to [${reindexRequest.body.dest.index}]`;
      if (reindexRequest.waitForCompletion) {
        toast += ` finished!`;
      } else {
        toast += ` success with taskId ${res.response.task}`;
      }
      coreServices.notifications.toasts.addSuccess(toast);
      onCloseReindexFlyout();
      onReindex && onReindex();
    } else {
      coreServices.notifications.toasts.addDanger(`Reindex operation error ${res.error}`);
    }
  };

  const onCloseReindexFlyout = () => {
    setIsReindexFlyoutVisible(false);
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
                      name: "Delete",
                      disabled: !selectedItems.length,
                      "data-test-subj": "Delete Action",
                      onClick: () => setDeleteIndexModalVisible(true),
                    },
                    {
                      name: "Reindex",
                      disabled: !selectedItems.length,
                      "data-test-subj": "Reindex Action",
                      onClick: () => setIsReindexFlyoutVisible(true),
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

      {isReindexFlyoutVisible && (
        <ReindexFlyout
          services={services}
          onCloseFlyout={onCloseReindexFlyout}
          sourceIndices={selectedItems.map((item) => item.index)}
          onReindexConfirm={onReindexConfirm}
        />
      )}
    </>
  );
}
