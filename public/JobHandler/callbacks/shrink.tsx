import React from "react";
import { CallbackType } from "../interface";
import { RecoveryJobMetaData } from "../../models/interfaces";
import { IndexService } from "../../services";
import { triggerEvent, EVENT_MAP } from "../utils";
import { DetailLink } from "../components/DetailLink";

export const callbackForShrink: CallbackType = async (job: RecoveryJobMetaData, { core }) => {
  const extras = job.extras;
  const indexService = new IndexService(core.http);
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
