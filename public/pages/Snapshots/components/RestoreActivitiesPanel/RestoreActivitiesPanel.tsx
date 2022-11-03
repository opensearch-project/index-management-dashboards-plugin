/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiInMemoryTable, EuiSpacer, EuiLink, EuiFlyout, EuiButton, EuiEmptyPrompt } from "@elastic/eui";
import _ from "lodash";
import React, { useEffect, useContext, useState, useMemo } from "react";
import { SnapshotManagementService } from "../../../../services";
import { CoreServicesContext } from "../../../../components/core_services";
import { getToasts } from "../../helper"
import { Toast, ModifiedStages } from "../../../../models/interfaces"
import { GetIndexRecoveryResponse, CatSnapshotIndex } from "../../../../../server/models/interfaces";
import { BREADCRUMBS, restoreIndicesCols } from "../../../../utils/constants";
import { ContentPanel } from "../../../../components/ContentPanel";
import IndexList from "../IndexList";

interface RestoreActivitiesPanelProps {
  snapshotManagementService: SnapshotManagementService;
  onOpenError: () => void;
  sendError: (error: object) => void;
  sendToasts: (toasts: Toast[]) => void;
  snapshotId: string;
  restoreStartRef: number;
  indicesToRestore: string[];
}

const intervalIds: ReturnType<typeof setInterval>[] = [];

export const RestoreActivitiesPanel = (
  {
    onOpenError,
    sendError,
    sendToasts,
    snapshotManagementService,
    snapshotId,
    restoreStartRef,
    indicesToRestore
  }: RestoreActivitiesPanelProps) => {
  const context = useContext(CoreServicesContext);
  const [startTime, setStartTime] = useState("");
  const [stopTime, setStopTime] = useState("");
  const [stage, setStage] = useState("");
  const [indices, setIndices] = useState([{}]);
  const [flyout, setFlyout] = useState(false);
  const [statusOk, setStatusOk] = useState(true)

  const restoreCount = indicesToRestore.length;

  useEffect(() => {
    context?.chrome.setBreadcrumbs([BREADCRUMBS.SNAPSHOT_MANAGEMENT, BREADCRUMBS.SNAPSHOTS, BREADCRUMBS.SNAPSHOT_RESTORE]);

    if (statusOk && stage !== "Done (100%)") {
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
        const toasts = getToasts(
          "error_restore_toast",
          "",
          snapshotId,
          onOpenError
        );

        res.error = res.error.concat(`, please check your connection`);
        sendError(res);
        sendToasts(toasts)
        intervalIds.forEach((id) => {
          clearInterval(id);
        });
        return;
      }
    } catch (err) {
      const toasts = getToasts(
        "error_restore_toast",
        "",
        snapshotId,
        onOpenError
      );

      setStatusOk(false);
      sendError(err);
      sendToasts(toasts)
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
    let stageIndex: number = 6;
    let doneCount: number = 0;
    const indexes: CatSnapshotIndex[] = [];
    const stages: string[] = ["START", "INIT", "INDEX", "VERIFY_INDEX", "TRANSLOG", "FINALIZE", "DONE"];
    const modifiedStages: ModifiedStages = {
      START: "Starting",
      INIT: "Initializing",
      INDEX: "Copying",
      VERIFY_INDEX: "Verifying",
      TRANSLOG: "Replaying translog",
      FINALIZE: "Cleaning up",
      DONE: "Completed"
    }
    const lastStage = stages.length - 1;

    // Loop through indices in response, filter out kibana index, 
    // gather progress info then use it to create progress field values.
    for (let item in response) {
      const responseItem = item as keyof GetIndexRecoveryResponse;
      if (
        item.indexOf("kibana") < 0 &&
        response[responseItem].shards &&
        response[responseItem].shards[0].start_time_in_millis >= restoreStartRef
      ) {
        const info = response[responseItem].shards[0];
        const stage = stages.indexOf(info.stage);
        const time = {
          start_time: info.start_time_in_millis,
          stop_time: info.stop_time_in_millis ? info.stop_time_in_millis : Date.now()
        };

        doneCount = stage === lastStage ? doneCount + 1 : doneCount;
        stageIndex = stage < stageIndex ? stage : stageIndex;

        maxStopTime = maxStopTime && maxStopTime > time.stop_time ? maxStopTime : time.stop_time;

        const indexStatus = modifiedStages[info.stage as keyof ModifiedStages];

        if (info.source.index && info.source.snapshot === snapshotId) {
          minStartTime = minStartTime && minStartTime < time.start_time ? minStartTime : time.start_time;
          indexes.push({ index: info.source.index, "restore_status": indexStatus });
        }
      }
    }

    const updatedIndices = [...indexes];
    const indicesStarted = indexes.map((index) => index.index);

    for (let index of indicesToRestore) {
      if (indicesStarted.indexOf(index) < 0) {
        updatedIndices.push({ index, restore_status: "Pending" })
      }
    }

    const sortedUpdatedIndices = updatedIndices.sort((a, b) => {
      if (a.index < b.index) return -1;
      if (a.index > b.index) return 1;
      return 0;
    });
    const percent = Math.floor((doneCount / restoreCount) * 100);

    setIndices(sortedUpdatedIndices);
    setStopTime(new Date(maxStopTime).toLocaleString().replace(",", "  "));
    setStartTime(new Date(minStartTime).toLocaleString().replace(",", "  "))

    if (stages[stageIndex]) {
      stageIndex = (stageIndex === lastStage && doneCount < restoreCount) ? 2 : stageIndex;
      setStage(`${modifiedStages[stages[stageIndex] as keyof ModifiedStages]} (${percent}%)`);
    }

  };

  const actions = useMemo(() => (
    [
      <EuiButton iconType="refresh" onClick={getRestoreStatus} data-test-subj="refreshStatusButton" isDisabled={restoreStartRef ? false : true}>
        Refresh
      </EuiButton>,
    ]
  ), []);

  const indexText = `${restoreCount === 1 ? "1 Index" : `${restoreCount} Indices`}`

  const restoreStatus = [
    {
      start_time: startTime,
      stop_time: stopTime,
      snapshot: snapshotId,
      status: stage,
      indexes: indexText,
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

  const message = (<EuiEmptyPrompt body={<p>There are no restore activities.</p>} titleSize="s"></EuiEmptyPrompt>)

  return (
    <>
      {flyout &&
        <EuiFlyout
          ownFocus={false}
          maxWidth={600}
          onClose={onCloseFlyout}
          size="m"
          hideCloseButton
        >
          <IndexList indices={indices} snapshot={snapshotId} onClick={onCloseFlyout} title="Indices being restored" columns={restoreIndicesCols} />
        </EuiFlyout>
      }
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
