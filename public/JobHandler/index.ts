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
export { listenEvent, destroyListener, EVENT_MAP } from "./utils";

export function JobHandlerRegister(core: CoreSetup) {
  jobSchedulerInstance.setStorage(new StoreLocalStorage(`OSD_VERSION_${OSDPkg.version}_ISM_JOBS`));
  jobSchedulerInstance.addCallback({
    callbackName: "callbackForReindex",
    callback: (job) => callbackForReindex(job, { core }),
    timeoutCallback: (job) => callbackForReindexTimeout(job, { core }),
    listenType: "reindex",
  });
  jobSchedulerInstance.addCallback({
    callbackName: "callbackForSplit",
    callback: (job) => callbackForSplit(job, { core }),
    timeoutCallback: (job) => callbackForSplitTimeout(job, { core }),
    listenType: "split",
  });
  jobSchedulerInstance.addCallback({
    callbackName: "callbackForShrink",
    callback: (job) => callbackForShrink(job, { core }),
    timeoutCallback: (job) => callbackForShrinkTimeout(job, { core }),
    listenType: "shrink",
  });
}
