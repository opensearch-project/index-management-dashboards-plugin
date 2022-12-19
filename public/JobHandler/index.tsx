import React, { ReactChild } from "react";
import { EuiLink } from "@elastic/eui";
import { CoreSetup } from "../../../../src/core/public";
import { jobSchedulerInstance } from "../context/JobSchedulerContext";
import { CommonService, IndexService } from "../services";
import { ReindexJobMetaData, RecoveryJobMetaData } from "../models/interfaces";
import { ROUTES } from "../utils/constants";

const DetailLink = (props: { index: string }) => {
  return <EuiLink href={`#${ROUTES.INDEX_DETAIL}/${props.index}`}>{props.index}</EuiLink>;
};

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

export const EVENT_MAP = {
  REINDEX_COMPLETE: "REINDEX_COMPLETE",
  SPLIT_COMPLETE: "SPLIT_COMPLETE",
  SHRINK_COMPLETE: "SHRINK_COMPLETE",
};

const triggerEvent = (eventName: string, data?: unknown) => {
  const event = new CustomEvent(eventName, {
    detail: data,
  });
  window.dispatchEvent(event);
};

export const listenEvent = (eventName: string, callback: () => void) => {
  window.addEventListener(eventName, callback);
};

export const destroyListener = (eventName: string, callback: () => void) => {
  window.removeEventListener(eventName, callback);
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
            if (extras.toastId) {
              core.notifications.toasts.remove(extras.toastId);
            }
            triggerEvent(EVENT_MAP.REINDEX_COMPLETE, job);
            core.notifications.toasts.addSuccess(
              {
                title: ((
                  <>
                    Source index <DetailLink index={extras.sourceIndex} /> has been successfully reindexed as{" "}
                    <DetailLink index={extras.destIndex} />
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
                    Reindex from <DetailLink index={extras.sourceIndex} /> to {extras.destIndex} has some errors, please check the errors
                    below:
                  </>
                ) as unknown) as string,
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
      if (extras.toastId) {
        core.notifications.toasts.remove(extras.toastId);
      }
      core.notifications.toasts.addDanger(
        {
          title: ((
            <>
              Reindex from <DetailLink index={extras.sourceIndex} /> to {extras.destIndex} does not finish in reasonable time, please check
              the task {extras.taskId} manually
            </>
          ) as unknown) as string,
        },
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
          if (extras.toastId) {
            core.notifications.toasts.remove(extras.toastId);
          }
          triggerEvent(EVENT_MAP.SPLIT_COMPLETE, job);
          core.notifications.toasts.addSuccess(
            {
              title: ((
                <>
                  Source index <DetailLink index={extras.sourceIndex} /> has been successfully split as{" "}
                  <DetailLink index={extras.destIndex} />.
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
    },
    timeoutCallback(job: RecoveryJobMetaData) {
      const extras = job.extras;
      if (extras.toastId) {
        core.notifications.toasts.remove(extras.toastId);
      }
      core.notifications.toasts.addDanger(
        {
          title: ((
            <>
              Split <DetailLink index={extras.sourceIndex} /> to ${extras.destIndex} does not finish in reasonable time, please check the
              index manually
            </>
          ) as unknown) as string,
        },
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
          if (extras.toastId) {
            core.notifications.toasts.remove(extras.toastId);
          }
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
          return true;
        }
      }

      return false;
    },
    timeoutCallback(job: RecoveryJobMetaData) {
      const extras = job.extras;
      if (extras.toastId) {
        core.notifications.toasts.remove(extras.toastId);
      }
      core.notifications.toasts.addDanger(
        {
          title: ((
            <>
              Shrink <DetailLink index={extras.sourceIndex} /> to {extras.destIndex} does not finish in reasonable time, please check the
              index manually.
            </>
          ) as unknown) as string,
        },
        {
          toastLifeTimeMs: 1000 * 60 * 60 * 24 * 5,
        }
      );
    },
    listenType: "shrink",
  });
}
