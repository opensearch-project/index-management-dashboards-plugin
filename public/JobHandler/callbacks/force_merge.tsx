/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import React from "react";
import { CallbackType, TaskResult } from "../interface";
import { ForceMergeJobMetaData } from "../../models/interfaces";
import { CommonService } from "../../services";
import { triggerEvent, EVENT_MAP } from "../utils";
import { ErrorToastContentForJob } from "../components/ErrorToastContentForJob";
import { FormatResourcesWithClusterInfo } from "../components/FormatResourceWithClusterInfo";

type ForceMergeTaskResult = TaskResult<{
  _shards?: {
    successful: number;
    total: number;
    failed: number;
    failures?: {
      index: string;
      status: string;
      shard: number;
    }[];
  };
}>;

export const callbackForForceMerge: CallbackType = async (job: ForceMergeJobMetaData, { core }) => {
  const extras = job.extras;
  const commonService = new CommonService(core.http);

  const tasksResult = await commonService.apiCaller<ForceMergeTaskResult>({
    endpoint: "transport.request",
    data: {
      path: `/_tasks/${extras.taskId}`,
      method: "GET",
    },
  });
  if (tasksResult.ok) {
    const _source = tasksResult.response;
    const { completed, error } = (_source || {}) as ForceMergeTaskResult;
    if (completed) {
      if (extras.toastId) {
        core.notifications.toasts.remove(extras.toastId);
      }
      if (!error?.reason) {
        triggerEvent(EVENT_MAP.FORCE_MERGE_COMPLETE, job);
        const { _shards } = _source.response || {};
        const { successful = 0, total = 0, failures = [] } = _shards || {};
        if (successful === total) {
          core.notifications.toasts.addSuccess(
            {
              title: ((
                <>
                  The indexes <FormatResourcesWithClusterInfo resources={extras.sourceIndex} clusterInfo={extras.clusterInfo} /> are
                  successfully force merged.
                </>
              ) as unknown) as string,
            },
            {
              toastLifeTimeMs: 1000 * 60 * 60 * 24 * 5,
            }
          );
        } else {
          core.notifications.toasts.addWarning(
            {
              iconType: "alert",
              title: ((
                <>
                  Some shards of <FormatResourcesWithClusterInfo resources={extras.sourceIndex} clusterInfo={extras.clusterInfo} />
                  could not be force merged.
                </>
              ) as unknown) as string,
              text: ((
                <ErrorToastContentForJob
                  shortError={
                    <>
                      {total - successful} out of {total} could not be force merged.
                    </>
                  }
                  fullError={
                    <>
                      <div>The following reasons may prevent shards from performing a force merge:</div>
                      <ul>
                        {failures.map((item) => (
                          <li key={`${item.index}-${item.index}-${item.status}`}>
                            The shard {item.shard} of index {item.index} failed to merge because of {item.status}.
                          </li>
                        ))}
                        <li>Some shards are unassigned.</li>
                        <li>
                          Insufficient disk space: Force merging requires disk space to create a new, larger segment. If the disk does not
                          have enough space, the merge process may fail.
                        </li>
                        <li>
                          Index read-only: If the index is marked as read-only, a force merge operation cannot modify the index, and the
                          merge process will fail.
                        </li>
                        <li>
                          Too many open files: The operating system may limit the number of files that a process can have open
                          simultaneously, and a force merge operation may exceed this limit, causing the merge process to fail.
                        </li>
                        <li>
                          Index corruption: If the index is corrupted or has some inconsistencies, the force merge operation may fail.
                        </li>
                      </ul>
                    </>
                  }
                />
              ) as unknown) as string,
            },
            {
              toastLifeTimeMs: 1000 * 60 * 60 * 24 * 5,
            }
          );
        }
      } else {
        core.notifications.toasts.addDanger(
          {
            iconType: "alert",
            title: ((
              <>
                Force merge from <FormatResourcesWithClusterInfo resources={extras.sourceIndex} clusterInfo={extras.clusterInfo} /> has some
                errors, please check the errors below:
              </>
            ) as unknown) as string,
            text: ((
              <div style={{ maxHeight: "30vh", overflowY: "auto" }}>
                <ul key="error.reason">
                  <li>{error.reason}</li>
                </ul>
              </div>
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

export const callbackForForceMergeTimeout: CallbackType = (job: ForceMergeJobMetaData, { core }) => {
  const extras = job.extras;
  if (extras.toastId) {
    core.notifications.toasts.remove(extras.toastId);
  }
  core.notifications.toasts.addWarning(
    {
      title: ((
        <>
          Force merging <FormatResourcesWithClusterInfo resources={extras.sourceIndex} clusterInfo={extras.clusterInfo} /> has failed.
        </>
      ) as unknown) as string,
      text: ((
        <>
          The force merge operation has taken more than one hour to complete. To see the latest status, use `GET /_tasks/
          {extras.taskId}`
        </>
      ) as unknown) as string,
    },
    {
      toastLifeTimeMs: 1000 * 60 * 60 * 24 * 5,
    }
  );
  return Promise.resolve(true);
};
