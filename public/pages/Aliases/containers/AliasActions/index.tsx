/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useMemo, useState, useContext, useCallback } from "react";
import { EuiButton, EuiContextMenu } from "@elastic/eui";
import { RouteComponentProps } from "react-router-dom";
import SimplePopover from "../../../../components/SimplePopover";
import DeleteIndexModal from "../DeleteAliasModal";
import FlushIndexModal from "../../../../containers/FlushIndexModal";
import { IAlias } from "../../interface";
import { ROUTES } from "../../../../utils/constants";
import { ServicesContext } from "../../../../services";
import { BrowserServices } from "../../../../models/interfaces";
import { aliasBlockedPredicate, filterBlockedItems } from "../../../../utils/helpers";
import { IndexOpBlocksType } from "../../../../utils/constants";

export interface AliasesActionsProps {
  selectedItems: IAlias[];
  onDelete: () => void;
  onUpdateAlias: () => void;
  history: RouteComponentProps["history"];
}

export default function AliasesActions(props: AliasesActionsProps) {
  const { selectedItems, onDelete, onUpdateAlias, history } = props;
  const [deleteIndexModalVisible, setDeleteIndexModalVisible] = useState(false);
  const [flushAliasModalVisible, setFlushAliasModalVisible] = useState(false);
  const [blockedAliases, setBlockedAliases] = useState<string[]>([]);
  const [flushableAliases, setFlushableAliases] = useState<string[]>([]);
  const services = useContext(ServicesContext) as BrowserServices;

  const onDeleteIndexModalClose = () => {
    setDeleteIndexModalVisible(false);
  };

  const onFlushAliasModalClose = () => {
    setFlushAliasModalVisible(false);
  };

  const onFlushModalClick = useCallback(async () => {
    try {
      const result = await filterBlockedItems<IAlias>(services, selectedItems, IndexOpBlocksType.Closed, aliasBlockedPredicate);
      setFlushableAliases(result.unBlockedItems.map((item) => item.alias));
      setBlockedAliases(result.blockedItems.map((item) => item.alias));
    } catch (err) {
      setFlushableAliases(selectedItems.map((item) => item.alias));
    }
    setFlushAliasModalVisible(true);
  }, [selectedItems, services]);

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
                  name: "Force merge",
                  "data-test-subj": "ForceMergeAction",
                  onClick: () => {
                    props.history.push(`${ROUTES.FORCE_MERGE}/${selectedItems.map((item) => item.alias).join(",")}`);
                  },
                },
                {
                  name: "Roll over",
                  disabled: selectedItems.length > 1,
                  "data-test-subj": "rolloverAction",
                  onClick: () => history.push(selectedItems.length ? `${ROUTES.ROLLOVER}/${selectedItems[0].alias}` : ROUTES.ROLLOVER),
                },
                {
                  name: "Flush",
                  disabled: !selectedItems.length,
                  "data-test-subj": "Flush Action",
                  onClick: onFlushModalClick,
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
        selectedItems={selectedItems}
        visible={deleteIndexModalVisible}
        onClose={onDeleteIndexModalClose}
        onDelete={() => {
          onDeleteIndexModalClose();
          onDelete();
        }}
      />

      <FlushIndexModal
        visible={flushAliasModalVisible}
        onClose={onFlushAliasModalClose}
        flushTarget="alias"
        flushableItems={flushableAliases}
        blockedItems={blockedAliases}
      />
    </>
  );
}
