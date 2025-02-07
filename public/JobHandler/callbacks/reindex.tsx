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
  canceled?: string;
  failures: {
    cause?: {
      reason: string;
    };
    id?: string;
  }[];
}>;

export const callbackForReindex: CallbackType = async (job: ReindexJobMetaData, { core }) => {
  const extras = job.extras;
  const commonService = new CommonService(core.http);
  const tasksResult = await commonService.apiCaller<TaskResult>({
    endpoint: "transport.request",
    data: {
      path: `/_tasks/${extras.taskId}`,
      method: "GET",
    },
  });
  if (tasksResult.ok) {
    const _source = tasksResult.response;
    const { completed, response, error } = (_source || {}) as ReindexTaskResult;
    const { failures, canceled } = response || {};
    if (completed) {
      if (extras.toastId) {
        core.notifications.toasts.remove(extras.toastId);
      }

      if (canceled) {
        core.notifications.toasts.addDanger(
          {
            iconType: "alert",
            title: ((
              <>
                Reindex operation on <FormatResourceWithClusterInfo resource={extras.sourceIndex} clusterInfo={extras.clusterInfo} /> has
                been cancelled
              </>
            ) as unknown) as string,
            text: `The reindex job has been cancelled ${canceled}.`,
          },
          {
            toastLifeTimeMs: 1000 * 60 * 60 * 24 * 5,
          }
        );
        return true;
      }

      if (failures?.length || error?.reason) {
        core.notifications.toasts.addDanger(
          {
            iconType: "alert",
            title: ((
              <>
                Reindex operation on <FormatResourceWithClusterInfo resource={extras.sourceIndex} clusterInfo={extras.clusterInfo} /> has
                failed
              </>
            ) as unknown) as string,
            text: ((
              <ErrorToastContentForJob
                shortError={error?.reason || <>{failures?.length || 0} error(s) were found</>}
                fullError={
                  failures?.length ? (
                    <ul key="response.failures">
                      {failures.map((item) => (
                        <li key={item.id}>
                          {item.id || ""}: {item.cause?.reason}
                        </li>
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
        return true;
      }

      /**
       * If goes here, then the reindex is completed
       */
      triggerEvent(EVENT_MAP.REINDEX_COMPLETE, job);
      core.notifications.toasts.addSuccess(
        {
          title: ((
            <>
              Reindex operation on <FormatResourceWithClusterInfo resource={extras.sourceIndex} clusterInfo={extras.clusterInfo} /> has been
              completed.
            </>
          ) as unknown) as string,
          text: ((
            <>
              The reindexed index is <DetailLink index={extras.writingIndex} clusterInfo={extras.clusterInfo} />.
            </>
          ) as unknown) as string,
        },
        {
          toastLifeTimeMs: 1000 * 60 * 60 * 24 * 5,
        }
      );
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
  core.notifications.toasts.addWarning(
    {
      title: ((
        <>
          Reindex on <FormatResourceWithClusterInfo resource={extras.sourceIndex} clusterInfo={extras.clusterInfo} /> has timed out.
        </>
      ) as unknown) as string,
      text: ((
        <>The reindex operation has taken more than one hour to complete. To see the latest status, use `GET /_tasks/{extras.taskId}`</>
      ) as unknown) as string,
    },
    {
      toastLifeTimeMs: 1000 * 60 * 60 * 24 * 5,
    }
  );
  return Promise.resolve(true);
};
