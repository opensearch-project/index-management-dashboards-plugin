/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { ReactChild } from "react";
import { CallbackType, TaskResult } from "../interface";
import { OpenJobMetaData } from "../../models/interfaces";
import { CommonService } from "../../services";
import { triggerEvent, EVENT_MAP } from "../utils";
import { DetailLink } from "../components/DetailLink";

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
      path: `.tasks/_doc/${extras.taskId}`,
      method: "GET",
    },
  });
  if (tasksResult.ok) {
    const { _source } = tasksResult.response;
    const { completed, error } = (_source || {}) as OpenTaskResult["_source"];
    if (completed) {
      if (!error?.reason) {
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
                  The indexes{" "}
                  {extras.indexes.map((item) => (
                    <DetailLink index={item} />
                  ))}{" "}
                  are successfully opened.
                </>
              ) as unknown) as string,
            },
            {
              toastLifeTimeMs: 1000 * 60 * 60 * 24 * 5,
            }
          );
        }
      } else {
        let errors: ReactChild[] = [];

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
                Open{" "}
                {extras.indexes.map((item) => (
                  <DetailLink index={item} />
                ))}{" "}
                has some errors, please check the errors below:
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

export const callbackForOpenTimeout: CallbackType = (job: OpenJobMetaData, { core }) => {
  const extras = job.extras;
  if (extras.toastId) {
    core.notifications.toasts.remove(extras.toastId);
  }
  core.notifications.toasts.addDanger(
    {
      title: ((
        <>
          Open{" "}
          {extras.indexes.map((item) => (
            <DetailLink index={item} />
          ))}
          does not finish in reasonable time, please check the index manually
        </>
      ) as unknown) as string,
    },
    {
      toastLifeTimeMs: 1000 * 60 * 60 * 24 * 5,
    }
  );
  return Promise.resolve(true);
};
