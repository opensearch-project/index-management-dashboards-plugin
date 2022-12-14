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
              `Source index ${extras.sourceIndex} has been successfully reindexed as ${extras.destIndex}.`,
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
    timeoutCallback(job: ReindexJobMetaData) {
      const extras = job.extras;
      core.notifications.toasts.addDanger(
        `Reindex from [${extras.sourceIndex}] to [${extras.destIndex}] does not finish in reasonable time, please check the task [${extras.taskId}] manually`,
        {
          toastLifeTimeMs: 1000 * 60 * 60 * 24 * 5,
        }
      );
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
        if (firstItem && firstItem.health !== "red") {
          core.notifications.toasts.addSuccess(`Source index ${extras.sourceIndex} has been successfully split as ${extras.destIndex}.`, {
            toastLifeTimeMs: 1000 * 60 * 60 * 24 * 5,
          });
          return true;
        }
      }

      return false;
    },
    timeoutCallback(job: RecoveryJobMetaData) {
      const extras = job.extras;
      core.notifications.toasts.addDanger(
        `Split [${extras.sourceIndex}] to [${extras.destIndex}] does not finish in reasonable time, please check the index manually`,
        {
          toastLifeTimeMs: 1000 * 60 * 60 * 24 * 5,
        }
      );
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
        if (firstItem && firstItem.health !== "red") {
          core.notifications.toasts.addSuccess(
            `Source index ${extras.sourceIndex} has been successfully shrunken as ${extras.destIndex}.`,
            {
              toastLifeTimeMs: 1000 * 60 * 60 * 24 * 5,
            }
          );
          return true;
        }
      }

      return false;
    },
    timeoutCallback(job: RecoveryJobMetaData) {
      const extras = job.extras;
      core.notifications.toasts.addDanger(
        `Shrink [${extras.sourceIndex}] to [${extras.destIndex}] does not finish in reasonable time, please check the index manually`,
        {
          toastLifeTimeMs: 1000 * 60 * 60 * 24 * 5,
        }
      );
    },
    listenType: "shrink",
  });
}
