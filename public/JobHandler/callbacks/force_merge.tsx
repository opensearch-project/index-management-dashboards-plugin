/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { ReactChild } from "react";
import { CallbackType, TaskResult } from "../interface";
import { ForceMergeJobMetaData } from "../../models/interfaces";
import { CommonService } from "../../services";
import { triggerEvent, EVENT_MAP } from "../utils";
import { EuiButton, EuiSpacer, EuiText } from "@elastic/eui";
import { Modal } from "../../components/Modal";

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

  if (job.extras.taskId) {
    const tasksResult = await commonService.apiCaller<ForceMergeTaskResult>({
      endpoint: "transport.request",
      data: {
        path: `.tasks/_doc/${extras.taskId}`,
        method: "GET",
      },
    });
    if (tasksResult.ok) {
      const { _source, found } = tasksResult.response;
      const { completed, error } = (_source || {}) as ForceMergeTaskResult["_source"];
      if (completed && found) {
        if (!error?.reason) {
          if (extras.toastId) {
            core.notifications.toasts.remove(extras.toastId);
          }
          triggerEvent(EVENT_MAP.FORCE_MERGE_COMPLETE, job);
          const { _shards } = _source.response || {};
          const { successful = 0, total = 0, failures = [] } = _shards || {};
          if (successful === total) {
            core.notifications.toasts.addSuccess(
              {
                title: `The indexes ${extras.sourceIndex.join(", ")} are successfully force merged.`,
              },
              {
                toastLifeTimeMs: 1000 * 60 * 60 * 24 * 5,
              }
            );
          } else {
            core.notifications.toasts.addWarning(
              {
                title: `Some shards of ${extras.sourceIndex.join(", ")} could not be force merged.`,
                text: ((
                  <>
                    <div>
                      {total - successful} out of {total} could not be force merged.
                    </div>
                    <EuiSpacer />
                    <EuiButton
                      onClick={() => {
                        Modal.show({
                          locale: {
                            ok: "Close",
                          },
                          title: `Some shards of ${extras.sourceIndex.join(", ")} could not be force merged.`,
                          content: (
                            <EuiText>
                              <div>
                                {total - successful} out of {total} could not be force merged. The following reasons may prevent shards from
                                performing a force merge:
                              </div>
                              <ul>
                                {failures.map((item) => (
                                  <li key={`${item.index}-${item.index}-${item.status}`}>
                                    The shard {item.shard} of index {item.index} failed to merge because of {item.status}.
                                  </li>
                                ))}
                                <li>Some shards are unassigned.</li>
                                <li>
                                  Insufficient disk space: Force merging requires disk space to create a new, larger segment. If the disk
                                  does not have enough space, the merge process may fail.
                                </li>
                                <li>
                                  Index read-only: If the index is marked as read-only, a force merge operation cannot modify the index, and
                                  the merge process will fail.
                                </li>
                                <li>
                                  Too many open files: The operating system may limit the number of files that a process can have open
                                  simultaneously, and a force merge operation may exceed this limit, causing the merge process to fail.
                                </li>
                                <li>
                                  Index corruption: If the index is corrupted or has some inconsistencies, the force merge operation may
                                  fail.
                                </li>
                              </ul>
                            </EuiText>
                          ),
                        });
                      }}
                      style={{ float: "right" }}
                    >
                      View details
                    </EuiButton>
                  </>
                ) as unknown) as string,
                iconType: "",
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
                <>Force merge from {extras.sourceIndex.join(", ")} has some errors, please check the errors below:</>
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
    } else {
      return true;
    }

    return false;
  }

  return false;
};

export const callbackForForceMergeTimeout: CallbackType = (job: ForceMergeJobMetaData, { core }) => {
  const extras = job.extras;
  if (extras.toastId) {
    core.notifications.toasts.remove(extras.toastId);
  }
  core.notifications.toasts.addDanger(
    {
      title: ((
        <>
          Force merge {extras.sourceIndex.join(", ")}
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
