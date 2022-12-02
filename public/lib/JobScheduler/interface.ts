export interface IJobItemMetadata {
  id?: string; // a number to indicate the job
  cron: string; // cron expression to indicate the time of next excusion
  type: "reindex" | "recovery"; // enum for job type
  extras: Record<string, any>; // extra fields to store job-related info
  createTime: number; // the time when this job is created
  // the timeout for job to do, once the time goes beyond the timeout
  // a timeout error toast will show.
  timeout: number;
}

export type JobItemMetadata = IJobItemMetadata & { id: Required<IJobItemMetadata>["id"] };

export interface IJobSchedulerOptions {
  callbacks: {
    listenType?: IJobItemMetadata["type"];
    callback: (params: JobItemMetadata) => Promise<boolean>;
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
