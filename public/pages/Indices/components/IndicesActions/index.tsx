/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useCallback, useContext, useMemo, useState } from "react";
import {
  // @ts-ignore
  Criteria,
  // @ts-ignore
  Pagination,
  EuiButton,
  EuiContextMenu,
} from "@elastic/eui";

import { ManagedCatIndex } from "../../../../../server/models/interfaces";
import ApplyPolicyModal from "../../components/ApplyPolicyModal";
import SimplePopover from "../../../../components/SimplePopover";
import { ModalConsumer } from "../../../../components/Modal";
import { CoreServicesContext } from "../../../../components/core_services";
import DeleteIndexModal from "../../components/DeleteIndexModal";
import ReindexFlyout from "../ReindexFlyout";
import { REQUEST } from "../../../../../utils/constants";
import { ReindexRequest } from "../../models/interfaces";
import IndexService from "../../../../services/IndexService";
import CommonService from "../../../../services/CommonService";
import { ServicesContext } from "../../../../services";

interface IndicesActionsProps {
  selectedItems: ManagedCatIndex[];
  onDelete?: () => void;
  indexService: IndexService;
  commonService: CommonService;
}

export default function IndicesActions(props: IndicesActionsProps) {
  const { selectedItems, onDelete, commonService } = props;
  const [deleteIndexModalVisible, setDeleteIndexModalVisible] = useState(false);
  const [isReindexFlyoutVisible, setIsReindexFlyoutVisible] = useState(false);
  const context = useContext(CoreServicesContext);
  const services = useContext(ServicesContext);

  const onDeleteIndexModalClose = () => {
    setDeleteIndexModalVisible(false);
  };

  const onDeleteIndexModalConfirm = useCallback(async () => {
    const result = await services?.commonService.apiCaller({
      endpoint: "indices.delete",
      data: {
        index: selectedItems.map((item) => item.index).join(","),
      },
    });
    if (result && result.ok) {
      onDeleteIndexModalClose();
      context?.notifications.toasts.addSuccess("Delete successfully");
      onDelete && onDelete();
    } else {
      context?.notifications.toasts.addDanger(result?.error || "");
    }
  }, [selectedItems, onDelete, services, context, onDeleteIndexModalClose]);

  const onReindexConfirmed = async (reindexRequest: ReindexRequest) => {
    let res = await commonService.apiCaller({
      endpoint: "reindex",
      method: REQUEST.POST,
      data: reindexRequest,
    });
    if (res.ok) {
      // @ts-ignore
      context?.notifications.toasts.addSuccess(`Reindex triggered successfully with taskId ${res.response.task}`);
      onCloseReindexFlyout();
    } else {
      context?.notifications.toasts.addDanger(`Reindex operation error happened ${res.error}`);
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
                      name: "Delete",
                      disabled: !selectedItems.length,
                      "data-test-subj": "Delete Action",
                      onClick: () => setDeleteIndexModalVisible(true),
                    },
                    {
                      name: "Apply policy",
                      disabled: !selectedItems.length,
                      "data-test-subj": "Apply policyButton",
                      onClick: () =>
                        onShow(ApplyPolicyModal, {
                          indices: selectedItems.map((item: ManagedCatIndex) => item.index),
                          core: context,
                        }),
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
          {...props}
          onCloseFlyout={onCloseReindexFlyout}
          sourceIndices={selectedItems.map((item) => item.index)}
          onReindexConfirmed={onReindexConfirmed}
        />
      )}
    </>
  );
}
