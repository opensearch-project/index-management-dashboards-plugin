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
    getRestoreStatus();

    let getStatusInterval: ReturnType<typeof setInterval>;

    if (stage.slice(0, 4) !== "Done") {
      console.log('Look here', stage.slice(0, 4))
      getStatusInterval = setInterval(() => {
        getRestoreStatus();
      }, 5000);
    }
    return () => {
      clearInterval(getStatusInterval)
    }
  }, [stage]);

  const getRestoreStatus = async () => {
    if (!restoreStartRef) {
      setIndices([{}])
      return;
    }
    if (stage.indexOf("Done") >= 0) {
      console.log("done");
      return;
    }

    try {
      const res = await snapshotManagementService.getIndexRecovery();

      if (res.ok) {
        const response: GetIndexRecoveryResponse = res.response;

        setRestoreStatus(response);
        console.log(response);
      } else {
        console.log('no indices')
        context?.notifications.toasts.addDanger(res.error);
      }
    } catch (err) {
      console.log('no indices 2')
      context?.notifications.toasts.addDanger(getErrorMessage(err, "There was a problem loading the recovery."));
    }
  };

  const onIndexesClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setFlyout(true);
    console.log("index clicked");
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

        console.log('recovery', response[item]);
        const info = response[item as keyof GetIndexRecoveryResponse].shards[0];
        const stage = stages.indexOf(info.stage);
        const size = `${(info.index.size.total_in_bytes / 1024 ** 2).toFixed(2)}mb`;

        const time = {
          start_time: info.start_time_in_millis,
          stop_time: info.stop_time_in_millis,
        };
        console.log("time", JSON.stringify(time))
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

    if (indexes.length > 0) {
      setStartTime(new Date(minStartTime).toLocaleString().replace(",", "  "));
      let completionTime = maxStopTime > 0 ? new Date(maxStopTime).toLocaleString().replace(",", "  ") : "In progress"
      console.log('completionTime', completionTime)
      setStopTime(completionTime);
      setStage(`${stages[stageIndex][0] + stages[stageIndex].toLowerCase().slice(1)} (${percent}%)`);
    }
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
