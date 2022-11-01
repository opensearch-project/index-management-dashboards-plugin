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
}

export default function IndicesActions(props: IndicesActionsProps) {
  const { selectedItems, onDelete } = props;
  const [deleteIndexModalVisible, setDeleteIndexModalVisible] = useState(false);
  const [splitIndexFlyoutVisible, setSplitIndexFlyoutVisible] = useState(false);
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

  const onCloseFlyout = () => {
    setSplitIndexFlyoutVisible(false);
  };

  const splitIndex = async (targetIndex: String, numberOfShards: number) => {
    const result = await services?.commonService.apiCaller({
      endpoint: "indices.split",
      method: "PUT",
      data: {
        index: selectedItems.map((item) => item.index).join(","),
        target: targetIndex,
        body: {
          settings: {
            "index.number_of_shards": numberOfShards,
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
                          core: CoreServicesContext,
                        }),
                    },
                    {
                      name: "Split",
                      disabled: !selectedItems.length || selectedItems.length > 1,
                      "data-test-subj": "Split Action",
                      onClick: () => setSplitIndexFlyoutVisible(true),
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
      {splitIndexFlyoutVisible && <SplitIndexFlyout onCloseFlyout={onCloseFlyout} onSplitIndex={splitIndex} />}
    </>
  );
}
