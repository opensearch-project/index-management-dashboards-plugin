/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useMemo, useState } from "react";
import { RouteComponentProps } from "react-router-dom";
import { EuiButton, EuiContextMenu } from "@elastic/eui";
import SimplePopover from "../../../../components/SimplePopover";
import DeleteIndexModal from "../DeleteDataStreamsModal";
import ClearCacheModal from "../../../../components/ClearCacheModal";
import { ROUTES } from "../../../../utils/constants";
import { DataStream } from "../../../../../server/models/interfaces";

export interface DataStreamsActionsProps {
  selectedItems: DataStream[];
  onDelete: () => void;
  history: RouteComponentProps["history"];
}

export default function DataStreamsActions(props: DataStreamsActionsProps) {
  const { selectedItems, onDelete, history } = props;
  const [deleteIndexModalVisible, setDeleteIndexModalVisible] = useState(false);
  const [clearCacheModalVisible, setClearCacheModalVisible] = useState(false);

  const onDeleteIndexModalClose = () => {
    setDeleteIndexModalVisible(false);
  };

  const onClearCacheModalClose = () => {
    setClearCacheModalVisible(false);
  };

  const renderKey = useMemo(() => Date.now(), [selectedItems]);
  const selectedItemsInString = selectedItems.map((item) => item.name);

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
                  name: "Clear cache",
                  disabled: selectedItems.length < 1,
                  "data-test-subj": "ClearCacheAction",
                  onClick: () => setClearCacheModalVisible(true),
                },
                {
                  name: "Force merge",
                  "data-test-subj": "ForceMergeAction",
                  onClick: () => {
                    props.history.push(`${ROUTES.FORCE_MERGE}/${selectedItemsInString.join(",")}`);
                  },
                },
                {
                  name: "Roll over",
                  disabled: selectedItems.length > 1,
                  "data-test-subj": "rolloverAction",
                  onClick: () => history.push(`${ROUTES.ROLLOVER}/${selectedItemsInString.join(",")}`),
                },
                {
                  name: "Delete",
                  disabled: selectedItems.length < 1,
                  "data-test-subj": "deleteAction",
                  onClick: () => setDeleteIndexModalVisible(true),
                },
              ],
            },
          ]}
        />
      </SimplePopover>
      <DeleteIndexModal
        selectedItems={selectedItemsInString}
        visible={deleteIndexModalVisible}
        onClose={onDeleteIndexModalClose}
        onDelete={() => {
          onDeleteIndexModalClose();
          onDelete();
        }}
      />
      <ClearCacheModal
        selectedItems={selectedItems}
        visible={clearCacheModalVisible}
        onClose={onClearCacheModalClose}
        type="data streams"
      />
    </>
  );
}
