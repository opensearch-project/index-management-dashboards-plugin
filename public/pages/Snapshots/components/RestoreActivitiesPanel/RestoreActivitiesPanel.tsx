/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiInMemoryTable, EuiSpacer, EuiLink } from "@elastic/eui";
import _ from "lodash";
import React, { useEffect, useContext, useState } from "react";
import { IndexService, SnapshotManagementService } from "../../../../services";
import { CoreServicesContext } from "../../../../components/core_services";
import { getErrorMessage } from "../../../../utils/helpers";
import { GetIndexRecoveryResponse } from "../../../../../server/models/interfaces";
import { ContentPanel } from "../../../../components/ContentPanel";
import { info } from "console";

interface RestoreActivitiesPanelProps {
  snapshotManagementService: SnapshotManagementService;
  indexService: IndexService;
  snapshotId: string;
}

export const RestoreActivitiesPanel = ({ snapshotManagementService, indexService, snapshotId }: RestoreActivitiesPanelProps) => {
  const context = useContext(CoreServicesContext);
  const [startTime, setStartTime] = useState("");
  const [stopTime, setStopTime] = useState("");
  const [stage, setStage] = useState("");
  const [indices, setIndices] = useState([{}]);

  useEffect(() => {
    if (stage.indexOf("DONE") < 0) {
      getRestoreStatus();
      const newInterval = setInterval(() => {
        getRestoreStatus();
      }, 2000);
      return () => clearInterval(newInterval);
    }
  }, [stage]);

  const getRestoreStatus = async () => {
    try {
      const res = await snapshotManagementService.getIndexRecovery();

      if (res.ok) {
        const response: GetIndexRecoveryResponse = res.response;

        setRestoreStatus(response);
        console.log(response);
      } else {
        context?.notifications.toasts.addDanger(res.error);
      }
    } catch (err) {
      context?.notifications.toasts.addDanger(getErrorMessage(err, "There was a problem loading the recovery."));
    }
  };

  const onIndexesClick = (e: React.MouseEvent) => {
    e.preventDefault();
    console.log("index clicked");
  };

  const setRestoreStatus = (response: object) => {
    let minStartTime: number = 0;
    let maxStopTime: number = 0;
    let stageIndex: number = Infinity;
    let doneCount: number = 0;
    const indexes: object[] = [];
    const stages: string[] = ["START", "INIT", "INDEX", "FINALIZE", "DONE"];

    for (let item in response) {
      const info = response[item].shards[0];
      const stage = stages.indexOf(info.stage);
      const size = `${(info.index.size.total_in_bytes / 1024 ** 2).toFixed(2)}MB`;

      const time = {
        start_time: info.start_time_in_millis,
        stop_time: info.stop_time_in_millis,
      };

      doneCount = stage === 4 ? doneCount + 1 : doneCount;
      stageIndex = stage < stageIndex ? stage : stageIndex;
      minStartTime = minStartTime && minStartTime < time.start_time ? minStartTime : time.start_time;
      maxStopTime = maxStopTime && maxStopTime > time.stop_time ? maxStopTime : time.stop_time;
      if (info.source.index) {
        indexes.push({ index: info.source.index, size: size });
      }
    }
    let percent = Math.floor((doneCount / indices.length) * 100);
    percent = stageIndex === 4 ? 100 : percent;

    setStartTime(new Date(minStartTime).toLocaleString().replace(",", "  "));
    setStopTime(new Date(maxStopTime).toLocaleString().replace(",", "  "));
    setIndices(indexes);
    setStage(`${stages[stageIndex]} (${percent}%)`);
  };

  const indexes = `${indices.length} Indices`;
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
      <ContentPanel title="Restore activities in progress">
        <EuiInMemoryTable items={restoreStatus} columns={columns} pagination={false} />
        <EuiSpacer size="xxl" />
        <EuiSpacer size="xxl" />
        <EuiSpacer size="xxl" />
        <EuiSpacer size="xxl" />
      </ContentPanel>
    </>
  );
};
