/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { ReactChild } from "react";
import { CallbackType, TaskResult } from "../interface";
import { ReindexJobMetaData } from "../../models/interfaces";
import { CommonService } from "../../services";
import { triggerEvent, EVENT_MAP } from "../utils";
import { DetailLink } from "../components/DetailLink";

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
    const { failures } = response;
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
                Source {extras.sourceIndex} has been successfully reindexed as{" "}
                <DetailLink index={extras.destIndex} writingIndex={extras.writingIndex} />
              </>
            ) as unknown) as string,
          },
          {
            toastLifeTimeMs: 1000 * 60 * 60 * 24 * 5,
          }
        );
      } else {
        let errors: ReactChild[] = [];
        if (failures.length) {
          errors.push(
            <ul key="response.failures">
              {Array.from(new Set(failures.map((item) => item.cause?.reason).filter((item) => item))).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          );
        }

        if (error?.reason) {
          errors.push(
            <ul key="error.reason">
              <li>{error.reason}</li>
            </ul>
          );
        }

        if (extras.toastId) {
          core.notifications.toasts.remove(extras.toastId);
        }
        core.notifications.toasts.addDanger(
          {
            title: ((
              <>
                Reindex from {extras.sourceIndex} to {extras.destIndex} has some errors, please check the errors below:
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
          Reindex from {extras.sourceIndex} to {extras.destIndex} does not finish in reasonable time, please check the task {extras.taskId}{" "}
          manually
        </>
      ) as unknown) as string,
    },
    {
      toastLifeTimeMs: 1000 * 60 * 60 * 24 * 5,
    }
  );
  return Promise.resolve(true);
};
