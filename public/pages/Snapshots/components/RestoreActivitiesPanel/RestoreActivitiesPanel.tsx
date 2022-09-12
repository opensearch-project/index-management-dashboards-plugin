/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiInMemoryTable } from "@elastic/eui";
import _ from "lodash";
import React, { useEffect } from "react";
import { IndexService, SnapshotManagementService } from "../../../../services";
import { ContentPanel } from "../../../../components/ContentPanel";

interface RestoreActivitiesPanelProps {
  snapshotManagementService: SnapshotManagementService;
  indexService: IndexService;
  snapshotId: string;
}

export const RestoreActivitiesPanel = ({ snapshotManagementService, indexService, snapshotId }: RestoreActivitiesPanelProps) => {
  useEffect(() => {
    getRestoreStatus();
  }, []);

  const getRestoreStatus = async () => {
    const status = await snapshotManagementService.getIndexRecovery();
    console.log("status", status);
  };

  const columns = [
    {
      field: "index",
      name: "Index",
    },
    {
      field: "start_epoch",
      name: "Start time",
    },
    {
      field: "end_epoch",
      name: "Completion time",
    },
    {
      field: "snapshot",
      name: "Snapshot name",
    },
    {
      field: "stage",
      name: "Status",
    },
    {
      field: "indices",
      name: "Indices being restored",
    },
  ];

  return (
    <>
      <ContentPanel title="Restore activities in progress">
        <EuiInMemoryTable items={[1, 2, 3]} columns={columns} pagination={true} />
      </ContentPanel>
    </>
  );
};
