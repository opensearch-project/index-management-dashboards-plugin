import { IJobItemMetadata } from "../lib/JobScheduler/interface";
import { CoreSetup } from "../../../../src/core/public";

export type CallbackType = (
  jobData: IJobItemMetadata,
  params: {
    core: CoreSetup;
  }
) => Promise<boolean>;
