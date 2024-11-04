/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import React from "react";
import { CallbackType, TaskResult } from "../interface";
import { OpenJobMetaData } from "../../models/interfaces";
import { CommonService } from "../../services";
import { triggerEvent, EVENT_MAP } from "../utils";
import { DetailLink } from "../components/DetailLink";
import { ErrorToastContentForJob } from "../components/ErrorToastContentForJob";

type OpenTaskResult = TaskResult<{
  acknowledged: boolean;
  shards_acknowledged: boolean;
}>;

export const callbackForOpen: CallbackType = async (job: OpenJobMetaData, { core }) => {
  const extras = job.extras;
  const commonService = new CommonService(core.http);

  const tasksResult = await commonService.apiCaller<OpenTaskResult>({
    endpoint: "transport.request",
    data: {
      path: `/_tasks/${extras.taskId}`,
      method: "GET",
    },
  });
  if (tasksResult.ok) {
    const _source = tasksResult.response;
    const { completed, error } = (_source || {}) as OpenTaskResult;
    if (completed) {
      const { acknowledged, shards_acknowledged } = _source.response || {};
      if (acknowledged && shards_acknowledged) {
        if (extras.toastId) {
          core.notifications.toasts.remove(extras.toastId);
        }
        triggerEvent(EVENT_MAP.OPEN_COMPLETE, job);
        core.notifications.toasts.addSuccess(
          {
            title: ((
              <>
                {extras.indexes.map((item, index) => (
                  <span key={item}>
                    {index > 0 && ", "}
                    <DetailLink key={item} index={item} clusterInfo={extras.clusterInfo} />
                  </span>
                ))}{" "}
                have been opened.
              </>
            ) as unknown) as string,
          },
          {
            toastLifeTimeMs: 1000 * 60 * 60 * 24 * 5,
          }
        );

        return true;
      } else if (error?.reason) {
        if (extras.toastId) {
          core.notifications.toasts.remove(extras.toastId);
        }
        core.notifications.toasts.addDanger(
          {
            title: ((
              <>
                {extras.indexes.map((item, index) => (
                  <span key={item}>
                    {index > 0 && ", "}
                    <DetailLink key={item} index={item} clusterInfo={extras.clusterInfo} />
                  </span>
                ))}{" "}
                has failed to open.
              </>
            ) as unknown) as string,
            text: ((
              <ErrorToastContentForJob fullError={<div style={{ maxHeight: "30vh", overflowY: "auto" }}>{error?.reason}</div>} />
            ) as unknown) as string,
          },
          {
            toastLifeTimeMs: 1000 * 60 * 60 * 24 * 5,
          }
        );

        return true;
      }
    }
  }

  return false;
};

export const callbackForOpenTimeout: CallbackType = (job: OpenJobMetaData, { core }) => {
  const extras = job.extras;
  if (extras.toastId) {
    core.notifications.toasts.remove(extras.toastId);
  }
  core.notifications.toasts.addWarning(
    {
      title: ((
        <>
          Opening the index(es){" "}
          {extras.indexes.map((item, index) => (
            <span key={item}>
              {index > 0 && ", "}
              <DetailLink key={item} index={item} clusterInfo={extras.clusterInfo} />
            </span>
          ))}{" "}
          has timed out
        </>
      ) as unknown) as string,
      text: ((
        <>Opening the index has taken more than one hour to complete. To see the latest status, use `GET /_tasks/{extras.taskId}`</>
      ) as unknown) as string,
    },
    {
      toastLifeTimeMs: 1000 * 60 * 60 * 24 * 5,
    }
  );
  return Promise.resolve(true);
};
