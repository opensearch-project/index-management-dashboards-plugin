/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useMemo, useState } from "react";
import { RouteComponentProps } from "react-router-dom";
import { EuiSmallButton, EuiContextMenu } from "@elastic/eui";
import SimplePopover from "../../../../components/SimplePopover";
import DeleteIndexModal from "../DeleteTemplatesModal";
import { ITemplate } from "../../interface";
import { ROUTES } from "../../../../utils/constants";

export interface TemplatesActionsProps {
  selectedItems: ITemplate[];
  onDelete: () => void;
  history: RouteComponentProps["history"];
}

export default function TemplatesActions(props: TemplatesActionsProps) {
  const { selectedItems, onDelete } = props;
  const [deleteIndexModalVisible, setDeleteIndexModalVisible] = useState(false);

  const onDeleteIndexModalClose = () => {
    setDeleteIndexModalVisible(false);
  };

  const renderKey = useMemo(() => Date.now(), [selectedItems]);

  return (
    <>
      <SimplePopover
        data-test-subj="moreAction"
        panelPaddingSize="none"
        button={
          <EuiSmallButton iconType="arrowDown" iconSide="right">
            Actions
          </EuiSmallButton>
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
                  disabled: selectedItems.length !== 1,
                  "data-test-subj": "editAction",
                  onClick: () => props.history.push(`${ROUTES.CREATE_TEMPLATE}/${selectedItems[0].name}`),
                },
                {
                  name: "Delete",
                  disabled: selectedItems.length !== 1,
                  "data-test-subj": "deleteAction",
                  onClick: () => setDeleteIndexModalVisible(true),
                },
              ],
            },
          ]}
        />
      </SimplePopover>
      <DeleteIndexModal
        selectedItems={selectedItems.map((item) => item.name)}
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
