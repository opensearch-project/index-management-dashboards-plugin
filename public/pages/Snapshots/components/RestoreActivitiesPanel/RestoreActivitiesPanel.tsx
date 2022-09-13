/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiInMemoryTable } from "@elastic/eui";
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
  const [restoreStatus, setRestoreStatus] = useState([]);
  const context = useContext(CoreServicesContext);

  useEffect(() => {
    getRestoreStatus();
    // const newInterval = setInterval(() => {
    //   getRestoreStatus();
    // }, 5000);
    // return () => clearInterval(newInterval);
  }, []);

  const getRestoreStatus = async () => {
    try {
      const res = await snapshotManagementService.getIndexRecovery();

      if (res.ok) {
        const response: GetIndexRecoveryResponse = res.response;
        console.log(response);

        let restoreInfo: object;
        let minStartTime: number | null = null;
        let maxStopTime: number | null = null;
        // let item: string;
        for (let item in response) {
          const info = response[item].shards[0];
          const stats = {
            index: info.source.index,
            status: info.stage,
            start_time: info.start_time_in_millis,
            stop_time: info.stop_time_in_millis,
          };
          minStartTime = minStartTime && minStartTime < stats.start_time ? minStartTime : stats.start_time;
          maxStopTime = maxStopTime && maxStopTime > stats.stop_time ? maxStopTime : stats.stop_time;
        }
        setRestoreStatus([{ start_time: minStartTime, stop_time: maxStopTime, snapshot: snapshotId, status: "OK", indices: 3 }]);
      } else {
        context?.notifications.toasts.addDanger(res.error);
      }
    } catch (err) {
      context?.notifications.toasts.addDanger(getErrorMessage(err, "There was a problem loading the recovery."));
    }
  };

  // const status = response.map((item: GetIndexRecoveryResponse) => {
  //   return ({
  //     index: item.shards[0].source.index,
  //     status: item.shards[0].stage,
  //     start_time: item.shards[0].start_time_in_millis,
  //     completion_time: item.shards[0].stop_time_in_millis,
  //   })
  // })

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
      field: "indices",
      name: "Indices being restored",
    },
  ];

  return (
    <>
      <ContentPanel title="Restore activities in progress">
        <EuiInMemoryTable items={restoreStatus} columns={columns} pagination={true} />
      </ContentPanel>
    </>
  );
};
