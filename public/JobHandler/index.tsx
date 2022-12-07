import React, { ReactChild } from "react";
import { CoreSetup } from "../../../../src/core/public";
import { jobSchedulerInstance } from "../context/JobSchedulerContext";
import { CommonService, IndexService } from "../services";
import { ReindexJobMetaData, RecoveryJobMetaData } from "../models/interfaces";

type TaskResult = {
  found: boolean;
  _source: {
    completed: boolean;
    response: {
      failures: {
        cause?: {
          reason: string;
        };
      }[];
    };
    error?: {
      type: string;
      reason: string;
    };
  };
};

export function JobHandlerRegister(core: CoreSetup) {
  const indexService = new IndexService(core.http);
  const commonService = new CommonService(core.http);
  jobSchedulerInstance.addCallback({
    callbackName: "callbackForReindex",
    callback: async (job: ReindexJobMetaData) => {
      const extras = job.extras;
      const tasksResult = await commonService.apiCaller<TaskResult>({
        endpoint: "transport.request",
        data: {
          path: `.tasks/_doc/${extras.taskId}`,
          method: "GET",
        },
      });
      if (tasksResult.ok) {
        const { _source, found } = tasksResult.response;
        const { completed, response, error } = (_source || {}) as TaskResult["_source"];
        const { failures } = response;
        if (completed && found) {
          if (!failures.length && !error?.reason) {
            core.notifications.toasts.addSuccess(
              `Reindex from [${extras.sourceIndex}] to [${extras.destIndex}] has been finished successfully.`,
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

            core.notifications.toasts.addDanger(
              {
                title: `Reindex from [${extras.sourceIndex}] to [${extras.destIndex}] has some errors, please check the errors below:`,
                text: (errors as unknown) as string,
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
    },
    listenType: "reindex",
  });
  jobSchedulerInstance.addCallback({
    callbackName: "callbackForSplit",
    callback: async (job: RecoveryJobMetaData) => {
      const extras = job.extras;
      const indexResult = await indexService.getIndices({
        from: 0,
        size: 10,
        search: extras.destIndex,
        terms: extras.destIndex,
        sortField: "index",
        sortDirection: "desc",
        showDataStreams: false,
      });
      if (indexResult.ok) {
        const [firstItem] = indexResult.response.indices || [];
        if (firstItem && firstItem.status !== "recovery") {
          core.notifications.toasts.addSuccess(`Split [${extras.sourceIndex}] to [${extras.destIndex}] has been finished successfully.`, {
            toastLifeTimeMs: 1000 * 60 * 60 * 24 * 5,
          });
          return true;
        }
      }

      return false;
    },
    listenType: "split",
  });
  jobSchedulerInstance.addCallback({
    callbackName: "callbackForShrink",
    callback: async (job: RecoveryJobMetaData) => {
      const extras = job.extras;
      const indexResult = await indexService.getIndices({
        from: 0,
        size: 10,
        search: extras.destIndex,
        terms: extras.destIndex,
        sortField: "index",
        sortDirection: "desc",
        showDataStreams: false,
      });
      if (indexResult.ok) {
        const [firstItem] = indexResult.response.indices || [];
        if (firstItem && firstItem.status !== "recovery") {
          core.notifications.toasts.addSuccess(`Shrink [${extras.sourceIndex}] to [${extras.destIndex}] has been finished successfully.`, {
            toastLifeTimeMs: 1000 * 60 * 60 * 24 * 5,
          });
          return true;
        }
      }

      return false;
    },
    listenType: "shrink",
  });
}
