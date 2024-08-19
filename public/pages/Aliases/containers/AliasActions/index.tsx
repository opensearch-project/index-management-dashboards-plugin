/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useMemo, useState } from "react";
import { EuiButton, EuiContextMenu } from "@elastic/eui";
import { RouteComponentProps } from "react-router-dom";
import SimplePopover from "../../../../components/SimplePopover";
import DeleteIndexModal from "../DeleteAliasModal";
import ClearCacheModal from "../../../../containers/ClearCacheModal";
import FlushIndexModal from "../../../../containers/FlushIndexModal";
import RefreshActionModal from "../../../../containers/RefreshAction";
import { IAlias } from "../../interface";
import { ROUTES, INDEX_OP_TARGET_TYPE } from "../../../../utils/constants";
import { getUISettings } from "../../../../services/Services";

export interface AliasesActionsProps {
  selectedItems: IAlias[];
  onDelete: () => void;
  onUpdateAlias: () => void;
  history: RouteComponentProps["history"];
}

export default function AliasesActions(props: AliasesActionsProps) {
  const { selectedItems, onDelete, onUpdateAlias, history } = props;
  const [deleteIndexModalVisible, setDeleteIndexModalVisible] = useState(false);
  const [clearCacheModalVisible, setClearCacheModalVisible] = useState(false);
  const [flushAliasModalVisible, setFlushAliasModalVisible] = useState(false);
  const [refreshModalVisible, setRefreshModalVisible] = useState(false);

  const onDeleteIndexModalClose = () => {
    setDeleteIndexModalVisible(false);
  };

  const onClearCacheModalClose = () => {
    setClearCacheModalVisible(false);
  };

  const onFlushAliasModalClose = () => {
    setFlushAliasModalVisible(false);
  };

  const onRefreshModalClose = () => {
    setRefreshModalVisible(false);
  };

  const renderKey = useMemo(() => Date.now(), [selectedItems]);
  const uiSettings = getUISettings();
  const useUpdatedUX = uiSettings.get("home:useNewHomePage");

  const size = useUpdatedUX ? "s" : undefined;

  return (
    <>
      <SimplePopover
        data-test-subj="moreAction"
        panelPaddingSize="none"
        button={
          <EuiButton iconType="arrowDown" iconSide="right" size={size}>
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
                  isSeparator: true,
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
                  onClick: () => setFlushAliasModalVisible(true),
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
      <ClearCacheModal
        selectedItems={selectedItems}
        visible={clearCacheModalVisible}
        onClose={onClearCacheModalClose}
        type={INDEX_OP_TARGET_TYPE.ALIAS}
      />
      <FlushIndexModal
        selectedItems={selectedItems}
        visible={flushAliasModalVisible}
        onClose={onFlushAliasModalClose}
        flushTarget={INDEX_OP_TARGET_TYPE.ALIAS}
      />
      <RefreshActionModal
        selectedItems={selectedItems}
        visible={refreshModalVisible}
        onClose={onRefreshModalClose}
        type={INDEX_OP_TARGET_TYPE.ALIAS}
      />
    </>
  );
}
