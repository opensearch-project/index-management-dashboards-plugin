/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import { jobSchedulerInstance } from "../context/JobSchedulerContext";
import { CoreSetup } from "../../../../src/core/public";
import { callbackForReindex, callbackForReindexTimeout } from "./callbacks/reindex";
import { callbackForSplit, callbackForSplitTimeout } from "./callbacks/split";
import { callbackForShrink, callbackForShrinkTimeout } from "./callbacks/shrink";
import { StoreLocalStorage } from "../lib/JobScheduler/store-localstorage";
import OSDPkg from "../../../../package.json";
import { ListenType } from "../lib/JobScheduler";
import { callbackForForceMerge, callbackForForceMergeTimeout } from "./callbacks/force_merge";
import { callbackForOpen, callbackForOpenTimeout } from "./callbacks/open";
import { CommonService } from "../services";
export { listenEvent, destroyListener, EVENT_MAP } from "./utils";

export async function JobHandlerRegister(core: CoreSetup) {
  const commonService = new CommonService(core.http);
  const accountResult = await commonService.accountInfo<{
    user_name: string;
  }>({
    endpoint: "transport.request",
    data: {
      path: "/_plugins/_security/api/account",
    },
  });
  /**
   * If security plugin is enabled, add user_name into storageKey
   */
  let storeLocalStorageKey = `OSD_VERSION_${OSDPkg.version}_ISM_JOBS`;
  if (accountResult && accountResult.ok && accountResult.response && accountResult.response.user_name) {
    storeLocalStorageKey = `OSD_VERSION_${OSDPkg.version}_${accountResult.response.user_name}_ISM_JOBS`;
  }
  jobSchedulerInstance.setStorage(new StoreLocalStorage(storeLocalStorageKey));
  jobSchedulerInstance.addCallback({
    callbackName: "callbackForReindex",
    callback: (job) => callbackForReindex(job, { core }),
    timeoutCallback: (job) => callbackForReindexTimeout(job, { core }),
    listenType: ListenType.REINDEX,
  });
  jobSchedulerInstance.addCallback({
    callbackName: "callbackForSplit",
    callback: (job) => callbackForSplit(job, { core }),
    timeoutCallback: (job) => callbackForSplitTimeout(job, { core }),
    listenType: ListenType.SPLIT,
  });
  jobSchedulerInstance.addCallback({
    callbackName: "callbackForShrink",
    callback: (job) => callbackForShrink(job, { core }),
    timeoutCallback: (job) => callbackForShrinkTimeout(job, { core }),
    listenType: ListenType.SHRINK,
  });
  jobSchedulerInstance.addCallback({
    callbackName: "callbackForForceMerge",
    callback: (job) => callbackForForceMerge(job, { core }),
    timeoutCallback: (job) => callbackForForceMergeTimeout(job, { core }),
    listenType: ListenType.FORCE_MERGE,
  });
  jobSchedulerInstance.addCallback({
    callbackName: "callbackForOpen",
    callback: (job) => callbackForOpen(job, { core }),
    timeoutCallback: (job) => callbackForOpenTimeout(job, { core }),
    listenType: ListenType.OPEN,
  });
}
