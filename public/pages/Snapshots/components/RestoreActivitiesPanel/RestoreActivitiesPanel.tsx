/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiInMemoryTable, EuiSpacer, EuiLink, EuiFlyout, EuiButton } from "@elastic/eui";
import _ from "lodash";
import React, { useEffect, useContext, useState } from "react";
import { SnapshotManagementService } from "../../../../services";
import { CoreServicesContext } from "../../../../components/core_services";
import { getErrorMessage } from "../../../../utils/helpers";
import { GetIndexRecoveryResponse, CatSnapshotIndex } from "../../../../../server/models/interfaces";
import { BREADCRUMBS } from "../../../../utils/constants";
import { ContentPanel } from "../../../../components/ContentPanel";
import IndexList from "../IndexList";

interface RestoreActivitiesPanelProps {
  snapshotManagementService: SnapshotManagementService;
  snapshotId: string;
  repository: string;
  restoreStartRef: number;
}

export const RestoreActivitiesPanel = ({ snapshotManagementService, snapshotId, restoreStartRef }: RestoreActivitiesPanelProps) => {
  const context = useContext(CoreServicesContext);
  const [startTime, setStartTime] = useState("");
  const [stopTime, setStopTime] = useState("");
  const [stage, setStage] = useState("");
  const [indices, setIndices] = useState([{}]);
  const [flyout, setFlyout] = useState(false);

  useEffect(() => {
    context!.chrome.setBreadcrumbs([BREADCRUMBS.SNAPSHOT_MANAGEMENT, BREADCRUMBS.SNAPSHOTS, BREADCRUMBS.SNAPSHOT_RESTORE]);

    let getStatusInterval: ReturnType<typeof setInterval>;

    if (stage.slice(0, 4) !== "Done") {
      getStatusInterval = setInterval(() => {
        getRestoreStatus();
      }, 1000);
      return () => {
        clearInterval(getStatusInterval)
      }
    }
  }, [stage]);

  const getRestoreStatus = async () => {
    if (!restoreStartRef) {
      return;
    }

    try {
      const res = await snapshotManagementService.getIndexRecovery();

      if (stage.indexOf("Done") >= 0) {
        return;
      }

      if (res.ok) {
        const response: GetIndexRecoveryResponse = res.response;

        setRestoreStatus(response);
      } else {
        context?.notifications.toasts.addDanger(res.error);
      }
    } catch (err) {
      context?.notifications.toasts.addDanger(getErrorMessage(err, "There was a problem loading the recovery."));
    }
  };

  const onIndexesClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setFlyout(true);
  };

  const onCloseFlyout = () => {
    setFlyout(false);
  };

  const setRestoreStatus = (response: GetIndexRecoveryResponse) => {
    let minStartTime: number = 0;
    let maxStopTime: number = 0;
    let stageIndex: number = Infinity;
    let doneCount: number = 0;
    const indexes: CatSnapshotIndex[] = [];
    const stages: string[] = ["START", "INIT", "INDEX", "FINALIZE", "DONE"];

    for (let item in response) {
      if (item.indexOf("kibana") < 0 && response[item as keyof GetIndexRecoveryResponse].shards[0].start_time_in_millis >= restoreStartRef) {
        const info = response[item as keyof GetIndexRecoveryResponse].shards[0];
        const stage = stages.indexOf(info.stage);
        const size = `${(info.index.size.total_in_bytes / 1024 ** 2).toFixed(2)}mb`;

        const time = {
          start_time: info.start_time_in_millis,
          stop_time: info.stop_time_in_millis,
        };

        doneCount = stage === 4 ? doneCount + 1 : doneCount;
        stageIndex = stage < stageIndex ? stage : stageIndex;
        minStartTime = minStartTime && minStartTime < time.start_time ? minStartTime : time.start_time;
        maxStopTime = maxStopTime && maxStopTime > time.stop_time ? maxStopTime : time.stop_time;

        if (info.source.index && info.source.snapshot === snapshotId) {
          indexes.push({ index: info.source.index, "store.size": size });
        }
      }
    }
    let percent = Math.floor((doneCount / indices.length) * 100);
    percent = stageIndex === 4 ? 100 : percent;

    setIndices(indexes);
    setStartTime(new Date(minStartTime).toLocaleString().replace(",", "  "));
    setStopTime(new Date(maxStopTime).toLocaleString().replace(",", "  ") || "In progress");
    setStage(`${stages[stageIndex][0] + stages[stageIndex].toLowerCase().slice(1)} (${percent}%)`);
  };

  const actions = [
    <EuiButton iconType="refresh" onClick={getRestoreStatus} data-test-subj="refreshStatusButton">
      Refresh
    </EuiButton>,
  ];

  const indexText = `${indices.length === 1 && Object.keys(indices[0]).length > 0 ? "Index" : "Indices"}`
  const indexes = `${indices.length === 1 && Object.keys(indices[0]).length === 0 ? "0" : indices.length} ${indexText}`;

  const restoreStatus = [
    {
      start_time: startTime,
      stop_time: stopTime,
      snapshot: snapshotId,
      status: stage,
      indexes: indexes,
    },
  ];

  const columns = [
    {
      field: "start_time",
      name: "Start time",
    },
    {
      field: "stop_time",
      name: "Completion time",
    },
    {
      field: "snapshot",
      name: "Snapshot name",
    },
    {
      field: "status",
      name: "Status",
    },
    {
      field: "indexes",
      name: "Indices being restored",
      render: (text: object) => <EuiLink onClick={onIndexesClick}>{text}</EuiLink>,
    },
  ];

  return (
    <>
      {flyout && <EuiFlyout ownFocus={false} maxWidth={600} onClose={onCloseFlyout} size="m"><IndexList indices={indices} snapshot={snapshotId} onClick={onCloseFlyout} title="Indices being restored in" /></EuiFlyout>}
      <ContentPanel title="Restore activities in progress" actions={actions}>
        <EuiInMemoryTable items={restoreStatus} columns={columns} pagination={false} />
        <EuiSpacer size="xxl" />
        <EuiSpacer size="xxl" />
        <EuiSpacer size="xxl" />
        <EuiSpacer size="xxl" />
      </ContentPanel>
    </>
  );
};
