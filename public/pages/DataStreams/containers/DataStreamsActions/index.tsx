/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useMemo, useState } from "react";
import { RouteComponentProps } from "react-router-dom";
import { EuiButton, EuiContextMenu } from "@elastic/eui";
import SimplePopover from "../../../../components/SimplePopover";
import ClearCacheModal from "../../../../containers/ClearCacheModal";
import FlushIndexModal from "../../../../containers/FlushIndexModal";
import DeleteIndexModal from "../DeleteDataStreamsModal";
import { ROUTES, INDEX_OP_TARGET_TYPE } from "../../../../utils/constants";
import RefreshActionModal from "../../../../containers/RefreshAction";
import { DataStream } from "../../../../../server/models/interfaces";

export interface DataStreamsActionsProps {
  selectedItems: DataStream[];
  onDelete: () => void;
  history: RouteComponentProps["history"];
  useNewUX?: boolean;
}

export default function DataStreamsActions(props: DataStreamsActionsProps) {
  const { selectedItems, onDelete, history, useNewUX } = props;
  const [deleteIndexModalVisible, setDeleteIndexModalVisible] = useState(false);
  const [clearCacheModalVisible, setClearCacheModalVisible] = useState(false);
  const [flushDataStreamModalVisible, setFlushDataStreamModalVisible] = useState(false);
  const [refreshModalVisible, setRefreshModalVisible] = useState(false);

  const onDeleteIndexModalClose = () => {
    setDeleteIndexModalVisible(false);
  };

  const onClearCacheModalClose = () => {
    setClearCacheModalVisible(false);
  };

  const onFlushDataStreamModalClose = () => {
    setFlushDataStreamModalVisible(false);
  };

  const onRefreshModalClose = () => {
    setRefreshModalVisible(false);
  };

  const renderKey = useMemo(() => Date.now(), [selectedItems]);
  const selectedItemsInString = selectedItems.map((item) => item.name);

  return (
    <>
      <SimplePopover
        data-test-subj="moreAction"
        panelPaddingSize="s"
        button={
          <EuiButton iconType="arrowDown" iconSide="right" size={useNewUX ? "s" : undefined}>
            Actions
          </EuiButton>
        }
      >
        <EuiContextMenu
          size="s"
          initialPanelId={0}
          // The EuiContextMenu has bug when testing in jest
          // the props change won't make it rerender
          key={renderKey}
          panels={[
            {
              id: 0,
              items: [
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
                  isSeparator: true,
                },
                {
                  name: "Clear cache",
                  disabled: selectedItems.length < 1,
                  "data-test-subj": "ClearCacheAction",
                  onClick: () => setClearCacheModalVisible(true),
                },
                {
                  name: "Flush",
                  disabled: !selectedItems.length,
                  "data-test-subj": "Flush Action",
                  onClick: () => setFlushDataStreamModalVisible(true),
                },
                {
                  name: "Refresh",
                  disabled: !selectedItems.length,
                  "data-test-subj": "refreshAction",
                  onClick: () => setRefreshModalVisible(true),
                },
                {
                  isSeparator: true,
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
        type={INDEX_OP_TARGET_TYPE.DATA_STREAM}
      />
      <FlushIndexModal
        selectedItems={selectedItems}
        visible={flushDataStreamModalVisible}
        onClose={onFlushDataStreamModalClose}
        flushTarget={INDEX_OP_TARGET_TYPE.DATA_STREAM}
      />
      <RefreshActionModal
        selectedItems={selectedItems}
        visible={refreshModalVisible}
        onClose={onRefreshModalClose}
        type={INDEX_OP_TARGET_TYPE.DATA_STREAM}
      />
    </>
  );
}
