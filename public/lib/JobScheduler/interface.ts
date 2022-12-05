export interface IJobItemMetadata {
  cron: string; // cron expression to indicate the time of next excusion
  extras: any; // extra fields to store job-related info
  type: "reindex" | "split" | "shrink"; // enum for job type
  id?: string; // a number to indicate the job
  createTime?: number; // the time when this job is created
  // the timeout for job to do, once the time goes beyond the timeout
  // a timeout error toast will show.
  timeout?: number;
}

export type JobItemMetadata = IJobItemMetadata & Required<Pick<IJobItemMetadata, "id" | "createTime" | "timeout">>;

export interface IJobSchedulerOptions {
  callbacks: {
    listenType?: IJobItemMetadata["type"];
    callback: (params: IJobItemMetadata) => Promise<boolean>;
    callbackName: string;
  }[];
  storage?: IStorage;
}

export interface IStorage {
  setup(): Promise<boolean>;
  getAll(): Promise<JobItemMetadata[]>;
  set(key: string, value: JobItemMetadata): Promise<boolean>;
  get(key: string): Promise<JobItemMetadata | undefined>;
  delete(key: string): Promise<boolean>;
}

export type TimeoutId = ReturnType<typeof setTimeout>;
