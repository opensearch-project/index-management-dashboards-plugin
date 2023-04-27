/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import React from "react";
import { CallbackType, TaskResult } from "../interface";
import { ReindexJobMetaData } from "../../models/interfaces";
import { CommonService } from "../../services";
import { triggerEvent, EVENT_MAP } from "../utils";
import { DetailLink } from "../components/DetailLink";
import { FormatResourceWithClusterInfo } from "../components/FormatResourceWithClusterInfo";
import { ErrorToastContentForJob } from "../components/ErrorToastContentForJob";

type ReindexTaskResult = TaskResult<{
  failures: {
    cause?: {
      reason: string;
    };
  }[];
}>;

export const callbackForReindex: CallbackType = async (job: ReindexJobMetaData, { core }) => {
  const extras = job.extras;
  const commonService = new CommonService(core.http);
  const tasksResult = await commonService.apiCaller<TaskResult>({
    endpoint: "transport.request",
    data: {
      path: `.tasks/_doc/${extras.taskId}`,
      method: "GET",
    },
  });
  if (tasksResult.ok) {
    const { _source, found } = tasksResult.response;
    const { completed, response, error } = (_source || {}) as ReindexTaskResult["_source"];
    const { failures } = response || {};
    if (completed && found) {
      if (!failures?.length && !error?.reason) {
        if (extras.toastId) {
          core.notifications.toasts.remove(extras.toastId);
        }
        triggerEvent(EVENT_MAP.REINDEX_COMPLETE, job);
        core.notifications.toasts.addSuccess(
          {
            title: ((
              <>
                Source <FormatResourceWithClusterInfo resource={extras.sourceIndex} clusterInfo={extras.clusterInfo} /> has been
                successfully reindexed as <DetailLink index={extras.destIndex} writingIndex={extras.writingIndex} />
              </>
            ) as unknown) as string,
          },
          {
            toastLifeTimeMs: 1000 * 60 * 60 * 24 * 5,
          }
        );
      } else {
        if (extras.toastId) {
          core.notifications.toasts.remove(extras.toastId);
        }
        core.notifications.toasts.addDanger(
          {
            iconType: "alert",
            title: ((
              <>
                Reindex from <FormatResourceWithClusterInfo resource={extras.sourceIndex} clusterInfo={extras.clusterInfo} /> to{" "}
                {extras.destIndex} has failed
              </>
            ) as unknown) as string,
            text: ((
              <ErrorToastContentForJob
                shortError={
                  error?.reason || (
                    <>
                      There is some error(s) when reindexing{" "}
                      <FormatResourceWithClusterInfo resource={extras.sourceIndex} clusterInfo={extras.clusterInfo} />
                    </>
                  )
                }
                fullError={
                  failures?.length ? (
                    <ul key="response.failures">
                      {Array.from(new Set(failures.map((item) => item.cause?.reason).filter((item) => item))).map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  ) : undefined
                }
              />
            ) as unknown) as string,
          },
          {
            toastLifeTimeMs: 1000 * 60 * 60 * 24 * 5,
          }
        );
      }
      return true;
    }
  }

  return false;
};

export const callbackForReindexTimeout: CallbackType = (job: ReindexJobMetaData, { core }) => {
  const extras = job.extras;
  if (extras.toastId) {
    core.notifications.toasts.remove(extras.toastId);
  }
  core.notifications.toasts.addDanger(
    {
      title: ((
        <>
          Reindex from <FormatResourceWithClusterInfo resource={extras.sourceIndex} clusterInfo={extras.clusterInfo} /> to{" "}
          <FormatResourceWithClusterInfo resource={extras.destIndex} clusterInfo={extras.clusterInfo} /> does not finish in reasonable time,
          please check the task {extras.taskId} manually
        </>
      ) as unknown) as string,
    },
    {
      toastLifeTimeMs: 1000 * 60 * 60 * 24 * 5,
    }
  );
  return Promise.resolve(true);
};
