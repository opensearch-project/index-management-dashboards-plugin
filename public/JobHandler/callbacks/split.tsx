/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import React from "react";
import { CallbackType, TaskResult } from "../interface";
import { RecoveryJobMetaData } from "../../models/interfaces";
import { CommonService } from "../../services";
import { triggerEvent, EVENT_MAP } from "../utils";
import { DetailLink } from "../components/DetailLink";
import { FormatResourceWithClusterInfo } from "../components/FormatResourceWithClusterInfo";

export const callbackForSplit: CallbackType = async (job: RecoveryJobMetaData, { core }) => {
  const extras = job.extras;
  const commonService = new CommonService(core.http);

  if (job.extras.taskId) {
    const tasksResult = await commonService.apiCaller<TaskResult>({
      endpoint: "transport.request",
      data: {
        path: `.tasks/_doc/${extras.taskId}`,
        method: "GET",
      },
    });
    if (tasksResult.ok) {
      const { _source, found } = tasksResult.response;
      const { completed, error } = (_source || {}) as TaskResult["_source"];
      if (completed && found) {
        if (extras.toastId) {
          core.notifications.toasts.remove(extras.toastId);
        }
        if (!error?.reason) {
          triggerEvent(EVENT_MAP.SPLIT_COMPLETE, job);
          core.notifications.toasts.addSuccess(
            {
              title: ((
                <>
                  Source index <DetailLink index={extras.sourceIndex} clusterInfo={extras.clusterInfo} /> has been successfully split as{" "}
                  <DetailLink index={extras.destIndex} clusterInfo={extras.clusterInfo} />.
                </>
              ) as unknown) as string,
            },
            {
              toastLifeTimeMs: 1000 * 60 * 60 * 24 * 5,
            }
          );
        } else {
          core.notifications.toasts.addDanger(
            {
              title: ((
                <>
                  Split from <DetailLink index={extras.sourceIndex} clusterInfo={extras.clusterInfo} /> to{" "}
                  <FormatResourceWithClusterInfo resource={extras.destIndex} clusterInfo={extras.clusterInfo} /> has failed.
                </>
              ) as unknown) as string,
              text: ((<div style={{ maxHeight: "30vh", overflowY: "auto" }}>{error.reason}</div>) as unknown) as string,
            },
            {
              toastLifeTimeMs: 1000 * 60 * 60 * 24 * 5,
            }
          );
        }
        return true;
      }
    }
  }

  return false;
};

export const callbackForSplitTimeout: CallbackType = (job: RecoveryJobMetaData, { core }) => {
  const extras = job.extras;
  if (extras.toastId) {
    core.notifications.toasts.remove(extras.toastId);
  }
  core.notifications.toasts.addDanger(
    {
      title: ((
        <>
          Split <DetailLink index={extras.sourceIndex} clusterInfo={extras.clusterInfo} /> to{" "}
          <FormatResourceWithClusterInfo resource={extras.destIndex} clusterInfo={extras.clusterInfo} /> does not finish in reasonable time,
          please check the index manually
        </>
      ) as unknown) as string,
    },
    {
      toastLifeTimeMs: 1000 * 60 * 60 * 24 * 5,
    }
  );
  return Promise.resolve(true);
};
