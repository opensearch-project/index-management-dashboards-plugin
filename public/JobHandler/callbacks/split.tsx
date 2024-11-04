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

export const callbackForSplit: CallbackType = async (job: RecoveryJobMetaData, { core }) => {
  const extras = job.extras;
  const commonService = new CommonService(core.http);

  if (job.extras.taskId) {
    const tasksResult = await commonService.apiCaller<TaskResult>({
      endpoint: "transport.request",
      data: {
        path: `/_tasks/${extras.taskId}`,
        method: "GET",
      },
    });
    if (tasksResult.ok) {
      const _source = tasksResult.response;
      const { completed, error } = (_source || {}) as TaskResult;
      if (completed) {
        if (extras.toastId) {
          core.notifications.toasts.remove(extras.toastId);
        }
        if (!error?.reason) {
          triggerEvent(EVENT_MAP.SPLIT_COMPLETE, job);
          core.notifications.toasts.addSuccess(
            {
              title: ((
                <>
                  Split operation on <DetailLink index={extras.sourceIndex} clusterInfo={extras.clusterInfo} /> has been completed.
                </>
              ) as unknown) as string,
              text: ((
                <>
                  The split index is <DetailLink index={extras.destIndex} clusterInfo={extras.clusterInfo} />.
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
              iconType: "alert",
              title: ((
                <>
                  Split operation on <DetailLink index={extras.sourceIndex} clusterInfo={extras.clusterInfo} /> has failed.
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
  core.notifications.toasts.addWarning(
    {
      title: ((
        <>
          Split operation on <DetailLink index={extras.sourceIndex} clusterInfo={extras.clusterInfo} /> has timed out.
        </>
      ) as unknown) as string,
      text: ((
        <>The split operation has taken more than one hour to complete. To see the latest status, use `GET /_tasks/{extras.taskId}`</>
      ) as unknown) as string,
    },
    {
      toastLifeTimeMs: 1000 * 60 * 60 * 24 * 5,
    }
  );
  return Promise.resolve(true);
};
