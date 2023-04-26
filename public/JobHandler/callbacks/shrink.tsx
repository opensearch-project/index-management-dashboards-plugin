/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { ReactChild } from "react";
import { CallbackType, TaskResult } from "../interface";
import { RecoveryJobMetaData } from "../../models/interfaces";
import { CommonService } from "../../services";
import { triggerEvent, EVENT_MAP } from "../utils";
import { DetailLink } from "../components/DetailLink";

export const callbackForShrink: CallbackType = async (job: RecoveryJobMetaData, { core }) => {
  const extras = job.extras;
  const commonService = new CommonService(core.http);
  if (extras.taskId) {
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
          triggerEvent(EVENT_MAP.SHRINK_COMPLETE, job);
          core.notifications.toasts.addSuccess(
            {
              title: ((
                <>
                  Source index <DetailLink index={extras.sourceIndex} /> has been successfully shrunken as{" "}
                  <DetailLink index={extras.destIndex} />.
                </>
              ) as unknown) as string,
            },
            {
              toastLifeTimeMs: 1000 * 60 * 60 * 24 * 5,
            }
          );
        } else {
          let errors: ReactChild[] = [];

          errors.push(
            <ul key="error.reason">
              <li>{error.reason}</li>
            </ul>
          );

          core.notifications.toasts.addDanger(
            {
              title: ((
                <>
                  Shrink from {extras.sourceIndex} to {extras.destIndex} has some errors, please check the errors below:
                </>
              ) as unknown) as string,
              text: ((<div style={{ maxHeight: "30vh", overflowY: "auto" }}>{errors}</div>) as unknown) as string,
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

export const callbackForShrinkTimeout: CallbackType = (job: RecoveryJobMetaData, { core }) => {
  const extras = job.extras;
  if (extras.toastId) {
    core.notifications.toasts.remove(extras.toastId);
  }
  core.notifications.toasts.addDanger(
    {
      title: ((
        <>
          Shrink <DetailLink index={extras.sourceIndex} /> to {extras.destIndex} does not finish in reasonable time, please check the index
          manually.
        </>
      ) as unknown) as string,
    },
    {
      toastLifeTimeMs: 1000 * 60 * 60 * 24 * 5,
    }
  );
  return Promise.resolve(true);
};
