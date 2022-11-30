/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useMemo, useState } from "react";
import { EuiButton, EuiContextMenu } from "@elastic/eui";

import SimplePopover from "../../../../components/SimplePopover";
import DeleteIndexModal from "../DeleteTemplatesModal";
import { ITemplate } from "../../interface";

export interface IndicesActionsProps {
  selectedItems: ITemplate[];
  onDelete: () => void;
  onUpdateAlias: () => void;
}

export default function IndicesActions(props: IndicesActionsProps) {
  const { selectedItems, onDelete, onUpdateAlias } = props;
  const [deleteIndexModalVisible, setDeleteIndexModalVisible] = useState(false);

  const onDeleteIndexModalClose = () => {
    setDeleteIndexModalVisible(false);
  };

  const renderKey = useMemo(() => Date.now(), [selectedItems]);

  return (
    <>
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
                  name: "Edit",
                  disabled: !selectedItems.length,
                  "data-test-subj": "Edit Action",
                  onClick: onUpdateAlias,
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
      <DeleteIndexModal
        selectedItems={selectedItems.map((item) => item.alias)}
        visible={deleteIndexModalVisible}
        onClose={onDeleteIndexModalClose}
        onDelete={() => {
          onDeleteIndexModalClose();
          onDelete();
        }}
      />
    </>
  );
}
