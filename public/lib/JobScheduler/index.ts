export * from "./interface";
import { IJobSchedulerOptions, IJobItemMetadata, IStorage, JobItemMetadata, TimeoutId } from "./interface";
import { StoreLocalStorage } from "./store-localstorage";
import { CronTime } from "cron";

export class JobScheduler {
  private options: IJobSchedulerOptions;
  // key: jobId value: timerid
  private runningJobMap: Record<string, TimeoutId> = {};
  private storage: IStorage;
  constructor(options: IJobSchedulerOptions) {
    this.options = options;
    this.storage = options.storage || new StoreLocalStorage();
  }
  async init(): Promise<boolean> {
    this.loopJob();
    return true;
  }
  private getId() {
    return `${Date.now()}_${Math.floor(Math.random() * 10)}`;
  }
  private formatJob(job: IJobItemMetadata): JobItemMetadata {
    const formattedJob = { ...job };
    if (!formattedJob.id) {
      formattedJob.id = this.getId();
    }

    return formattedJob as JobItemMetadata;
  }
  async addJob(job: IJobItemMetadata): Promise<boolean> {
    const formattedJob = this.formatJob(job);
    if (this.runningJobMap[formattedJob.id]) {
      return false;
    }

    await this.storage.set(formattedJob.id, formattedJob);
    this.loopJob();
    return true;
  }
  private async loopJob() {
    const jobs = await this.storage.getAll();
    // loop all the jobs to see if any job do not exist in runningJobMap
    jobs.forEach((job) => {
      if (![this.runningJobMap[job.id]]) {
        const cronInstance = new CronTime(job.cron);
        const timeoutCallback = setTimeout(() => {
          this.runJob(job.id);
        }, cronInstance.getTimeout());
        this.runningJobMap[job.id] = timeoutCallback;
      }
    });
  }
  private async runJob(jobId: JobItemMetadata["id"]): Promise<void> {
    const job = await this.getJob(jobId);
    if (!job) {
      return undefined;
    }
    const filteredCallbacks = this.options.callbacks.filter(
      (callbackItem) => callbackItem.listenType === job.type || !callbackItem.listenType
    );
    const result = await Promise.all(filteredCallbacks.map((callbackItem) => callbackItem.callback(job)));
    const hasFinish = result.some((res) => res === true);
    this.deleteJob(job.id);
    if (!hasFinish) {
      this.loopJob();
    }
  }
  async deleteJob(jobId: JobItemMetadata["id"]): Promise<boolean> {
    delete this.runningJobMap[jobId];
    const storageResult = await this.storage.delete(jobId);
    return storageResult || true;
  }
  getJob(jobId: JobItemMetadata["id"]): Promise<JobItemMetadata | undefined> {
    return this.storage.get(jobId);
  }
  getAllJobs(): Promise<JobItemMetadata[]> {
    return this.storage.getAll();
  }
  async changeJob(jobId: JobItemMetadata["id"], jobMeta: Partial<Omit<JobItemMetadata, "id">>): Promise<boolean> {
    const nowJob = await this.getJob(jobId);

    if (!nowJob) {
      return false;
    }

    return this.storage.set(jobId, {
      ...nowJob,
      ...jobMeta,
      id: jobId,
    });
  }
}
