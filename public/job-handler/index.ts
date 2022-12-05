import { CoreSetup } from "../../../../src/core/public";
import { jobSchedulerInstance } from "../context/JobSchedulerContext";
import { IndexService } from "../services";
import { ReindexJobMetaData, RecoveryJobMetaData } from "../models/interfaces";

export function JobHandlerRegister(core: CoreSetup) {
  const indexService = new IndexService(core.http);
  jobSchedulerInstance.addCallback({
    callbackName: "callbackForReindex",
    callback: async (job: ReindexJobMetaData) => {
      const extras = job.extras;
      const indexResult = await indexService.getIndices({
        from: 0,
        size: 10,
        search: extras.destIndex,
        terms: extras.destIndex,
        sortField: "index",
        sortDirection: "desc",
        showDataStreams: extras.isDataStream || false,
      });
      if (indexResult.ok) {
        const [firstItem] = indexResult.response.indices || [];
        if (firstItem && firstItem.status !== "reindex") {
          core.notifications.toasts.addSuccess(
            `Reindex from [${extras.sourceIndex}] to [${extras.destIndex}] has been finished successfully.`,
            {
              toastLifeTimeMs: 1000 * 60 * 60 * 24 * 5,
            }
          );
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
