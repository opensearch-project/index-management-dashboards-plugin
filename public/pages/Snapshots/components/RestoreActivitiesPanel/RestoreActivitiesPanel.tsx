/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiInMemoryTable } from "@elastic/eui";
import _ from "lodash";
import React, { Component, ChangeEvent } from "react";
import FlyoutFooter from "../../../VisualCreatePolicy/components/FlyoutFooter";
import { CoreServicesContext } from "../../../../components/core_services";
import { IndexService, SnapshotManagementService } from "../../../../services";
import { RESTORE_OPTIONS } from "../../../../models/interfaces";
import { getErrorMessage } from "../../../../utils/helpers";
import { IndexItem } from "../../../../../models/interfaces";
import { CatRepository, GetSnapshot } from "../../../../../server/models/interfaces";
import CustomLabel from "../../../../components/CustomLabel";
import { ContentPanel } from "../../../../components/ContentPanel";
import SnapshotRestoreAdvancedOptions from "../SnapshotRestoreAdvancedOptions";
import SnapshotRestoreOption from "../SnapshotRestoreOption";
import SnapshotRenameOptions from "../SnapshotRenameOptions";
import AddPrefixInput from "../AddPrefixInput";
import RenameInput from "../RenameInput";
import SnapshotIndicesInput from "../SnapshotIndicesInput";
import { ERROR_PROMPT } from "../../../CreateSnapshotPolicy/constants";

interface RestoreActivitiesPanelProps {
  snapshotManagementService: SnapshotManagementService;
  indexService: IndexService;
  snapshotId: string;
}

export const RestoreActivitiesPanel = ({ snapshotManagementService, indexService, snapshotId }: RestoreActivitiesPanelProps) => {
  let getRestoreStatus = () => {
    console.log("getting status");
  };

  const columns = [
    {
      field: "id",
      name: "Start time",
    },
    {
      field: "status",
      name: "Completion time",
    },
    {
      field: "policy",
      name: "Policy",
    },
    {
      field: "repository",
      name: "Snapshot name",
    },
    {
      field: "start_epoch",
      name: "Status",
    },
    {
      field: "end_epoch",
      name: "Indices being restored",
    },
  ];

  getRestoreStatus = _.debounce(getRestoreStatus, 500, { leading: true });

  return (
    <>
      <ContentPanel title="Restore activities in progress">
        <EuiInMemoryTable items={[1, 2, 3]} columns={columns} pagination={true} />
      </ContentPanel>
    </>
  );
};
