/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useMemo, useState, useContext, useCallback } from "react";
import { RouteComponentProps } from "react-router-dom";
import { EuiButton, EuiContextMenu } from "@elastic/eui";
import SimplePopover from "../../../../components/SimplePopover";
import FlushIndexModal from "../../../../containers/FlushIndexModal";
import DeleteIndexModal from "../DeleteDataStreamsModal";
import { ROUTES } from "../../../../utils/constants";
import { DataStream } from "../../../../../server/models/interfaces";
import { ServicesContext } from "../../../../services";
import { BrowserServices } from "../../../../models/interfaces";
import { dataStreamBlockedPredicate, filterBlockedItems } from "../../../../utils/helpers";
import { IndexOpBlocksType } from "../../../../utils/constants";

export interface DataStreamsActionsProps {
  selectedItems: DataStream[];
  onDelete: () => void;
  history: RouteComponentProps["history"];
}

export default function DataStreamsActions(props: DataStreamsActionsProps) {
  const { selectedItems, onDelete, history } = props;
  const [deleteIndexModalVisible, setDeleteIndexModalVisible] = useState(false);
  const [flushDataStreamModalVisible, setFlushDataStreamModalVisible] = useState(false);
  const [blockedDataStreams, setBlockedDataStreams] = useState<string[]>([]);
  const [flushableDataStreams, setFlushableDataStreams] = useState<string[]>([]);
  const services = useContext(ServicesContext) as BrowserServices;

  const onDeleteIndexModalClose = () => {
    setDeleteIndexModalVisible(false);
  };

  const onFlushDataStreamModalClose = () => {
    setFlushDataStreamModalVisible(false);
  };

  const onFlushModalClick = useCallback(async () => {
    const result = await filterBlockedItems<DataStream>(services, selectedItems, IndexOpBlocksType.Closed, dataStreamBlockedPredicate);
    setFlushableDataStreams(result.unBlockedItems.map((item) => item.name));
    setBlockedDataStreams(result.blockedItems.map((item) => item.name));
    setFlushDataStreamModalVisible(true);
  }, [selectedItems, services]);

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
                  name: "Flush",
                  disabled: !selectedItems.length,
                  "data-test-subj": "Flush Action",
                  onClick: () => onFlushModalClick,
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

      <FlushIndexModal
        visible={flushDataStreamModalVisible}
        onClose={onFlushDataStreamModalClose}
        flushTarget="data stream"
        flushableItems={flushableDataStreams}
        blockedItems={blockedDataStreams}
      />
    </>
  );
}
