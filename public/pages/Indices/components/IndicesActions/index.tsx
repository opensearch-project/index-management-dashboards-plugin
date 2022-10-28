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
import { ServerResponse } from "../../../../../server/models/types";
import ApplyPolicyModal from "../../components/ApplyPolicyModal";
import SimplePopover from "../../../../components/SimplePopover";
import { ModalConsumer } from "../../../../components/Modal";
import { CoreServicesContext } from "../../../../components/core_services";
import DeleteIndexModal from "../../components/DeleteIndexModal";
import { ServicesContext } from "../../../../services";

export interface IndicesActionsProps {
  selectedItems: ManagedCatIndex[];
  onDelete: (indices: string) => Promise<ServerResponse<any>>;
}

export default function IndicesActions(props: IndicesActionsProps) {
  const { selectedItems, onDelete } = props;
  const [deleteIndexModalVisible, setDeleteIndexModalVisible] = useState(false);
  const context = useContext(CoreServicesContext);
  const services = useContext(ServicesContext);

  const onDeleteIndexModalClose = () => {
    setDeleteIndexModalVisible(false);
  };

  const onDeleteIndexModalConfirm = useCallback(async () => {
    const result = await onDelete(selectedItems.map((item) => item.index).join(","));
    if (result && result.ok) {
      onDeleteIndexModalClose();
    }
  }, [selectedItems, onDelete, services, context, onDeleteIndexModalClose]);

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
    </>
  );
}
