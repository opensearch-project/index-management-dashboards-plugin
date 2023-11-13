/*
 *   Copyright OpenSearch Contributors
 *
 *   Licensed under the Apache License, Version 2.0 (the "License").
 *   You may not use this file except in compliance with the License.
 *   A copy of the License is located at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   or in the "license" file accompanying this file. This file is distributed
 *   on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 *   express or implied. See the License for the specific language governing
 *   permissions and limitations under the License.
 */

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
        path: `/.tasks/_doc/${extras.taskId}`,
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
