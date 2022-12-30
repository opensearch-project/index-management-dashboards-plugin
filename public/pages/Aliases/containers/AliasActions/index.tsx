/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useMemo, useState } from "react";
import { EuiButton, EuiContextMenu } from "@elastic/eui";
import { RouteComponentProps } from "react-router-dom";
import SimplePopover from "../../../../components/SimplePopover";
import DeleteIndexModal from "../DeleteAliasModal";
import { IAlias } from "../../interface";
import { ROUTES } from "../../../../utils/constants";

export interface AliasesActionsProps {
  selectedItems: IAlias[];
  onDelete: () => void;
  onUpdateAlias: () => void;
  history: RouteComponentProps["history"];
}

export default function AliasesActions(props: AliasesActionsProps) {
  const { selectedItems, onDelete, onUpdateAlias, history } = props;
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
                  disabled: selectedItems.length !== 1,
                  "data-test-subj": "editAction",
                  onClick: onUpdateAlias,
                },
                {
                  name: "Rollover",
                  disabled: !selectedItems.length,
                  "data-test-subj": "rolloverAction",
                  onClick: () => history.push(`${ROUTES.ROLLOVER}/${selectedItems[0].alias}`),
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
