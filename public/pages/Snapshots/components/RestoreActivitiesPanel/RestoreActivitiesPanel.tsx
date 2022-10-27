/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiInMemoryTable, EuiSpacer, EuiLink, EuiFlyout, EuiButton, EuiEmptyPrompt } from "@elastic/eui";
import _ from "lodash";
import React, { useEffect, useContext, useState, useMemo } from "react";
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
  restoreStartRef: number;
  restoreCount: number
}

const intervalIds: ReturnType<typeof setInterval>[] = [];

export const RestoreActivitiesPanel = ({ snapshotManagementService, snapshotId, restoreStartRef, restoreCount }: RestoreActivitiesPanelProps) => {
  const context = useContext(CoreServicesContext);
  const [startTime, setStartTime] = useState("");
  const [stopTime, setStopTime] = useState("");
  const [stage, setStage] = useState("");
  const [indices, setIndices] = useState([{}]);
  const [flyout, setFlyout] = useState(false);

  useEffect(() => {
    context?.chrome.setBreadcrumbs([BREADCRUMBS.SNAPSHOT_MANAGEMENT, BREADCRUMBS.SNAPSHOTS, BREADCRUMBS.SNAPSHOT_RESTORE]);

    if (stage !== "Done (100%)" || indices.length < restoreCount) {
      intervalIds.push(setInterval(() => {
        getRestoreStatus();
      }, 2000))

      return () => {
        intervalIds.forEach((id) => {
          clearInterval(id);
        })
      }
    }
  }, [stage]);

  const getRestoreStatus = async () => {
    if (!restoreStartRef) {
      return;
    }

    try {
      const res = await snapshotManagementService.getIndexRecovery();

      if (res.ok) {
        const response: GetIndexRecoveryResponse = res.response;

        setRestoreStatus(response);
      } else {
        context?.notifications.toasts.addDanger(res.error);
        const message = JSON.parse(res.error).error.root_cause[0].reason
        const trimmedMessage = message.slice(message.indexOf("]") + 1, message.indexOf(".") + 1);
        context?.notifications.toasts.addError(JSON.parse(res.error), {
          title: `There was a problem loading the recovery status.`,
          toastMessage: `${trimmedMessage} Open browser console & click below for details.`
        });
      }
    } catch (err) {
      context?.notifications.toasts.addDanger(getErrorMessage(err, "There was a problem loading the recovery status."));
    }
  };

  const onIndexesClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    await getRestoreStatus();
    setFlyout(true);
  };

  const onCloseFlyout = () => {
    setFlyout(false);
  };

  const setRestoreStatus = (response: GetIndexRecoveryResponse) => {
    let minStartTime: number = 0;
    let maxStopTime: number = 0;
    let stageIndex: number = 4;
    let doneCount: number = 0;
    const indexes: CatSnapshotIndex[] = [];
    const stages: string[] = ["START", "INIT", "INDEX", "FINALIZE", "DONE"];

    // Loop through indices in response, filter out kibana index, 
    // gather progress info then use it to create progress field values.
    for (let item in response) {
      if (
        item.indexOf("kibana") < 0 &&
        response[item as keyof GetIndexRecoveryResponse].shards &&
        response[item as keyof GetIndexRecoveryResponse].shards[0].start_time_in_millis >= restoreStartRef
      ) {
        const info = response[item as keyof GetIndexRecoveryResponse].shards[0];
        const stage = stages.indexOf(info.stage);
        const size = `${(info.index.size.total_in_bytes / 1024 ** 2).toFixed(2)}mb`;

        const time = {
          start_time: info.start_time_in_millis,
          stop_time: info.stop_time_in_millis ? info.stop_time_in_millis : Date.now()
        };

        doneCount = stage === 4 ? doneCount + 1 : doneCount;
        stageIndex = stage < stageIndex ? stage : stageIndex;

        maxStopTime = maxStopTime && maxStopTime > time.stop_time ? maxStopTime : time.stop_time;

        if (info.source.index && info.source.snapshot === snapshotId) {
          minStartTime = minStartTime && minStartTime < time.start_time ? minStartTime : time.start_time;
          indexes.push({ index: info.source.index, "store.size": size });
        }
      }
    }
    let percent = Math.floor((doneCount / restoreCount) * 100);

    setIndices(indexes);
    setStopTime(new Date(maxStopTime).toLocaleString().replace(",", "  "));
    setStartTime(new Date(minStartTime).toLocaleString().replace(",", "  "))

    if (stages[stageIndex]) {
      stageIndex = (stageIndex === 4 && doneCount < restoreCount) ? 2 : stageIndex;
      setStage(`${stages[stageIndex][0] + stages[stageIndex].toLowerCase().slice(1)} (${percent}%)`);
    }

  };

  const actions = useMemo(() => (
    [
      <EuiButton iconType="refresh" onClick={getRestoreStatus} data-test-subj="refreshStatusButton" isDisabled={!!restoreStartRef}>
        Refresh
      </EuiButton>,
    ]
  ), []);

  const indexText = `${restoreCount === 1 ? "Index" : "Indices"}`
  const indexes = `${restoreCount} ${indexText}`;

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

  const message = (<EuiEmptyPrompt title={<h3>No restore activities currently in progress</h3>} titleSize="s" body=""></EuiEmptyPrompt>)

  return (
    <>
      {flyout && <EuiFlyout ownFocus={false} maxWidth={600} onClose={onCloseFlyout} size="m"><IndexList indices={indices} snapshot={snapshotId} onClick={onCloseFlyout} title="Indices being restored in" /></EuiFlyout>}
      <ContentPanel title="Restore activities in progress" actions={actions}>
        <EuiInMemoryTable items={snapshotId && restoreCount ? restoreStatus : []} columns={columns} pagination={false} message={message} />
        <EuiSpacer size="xxl" />
        <EuiSpacer size="xxl" />
        <EuiSpacer size="xxl" />
        <EuiSpacer size="xxl" />
      </ContentPanel>
    </>
  );
};
