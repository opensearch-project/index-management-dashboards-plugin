/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import { IStorage, JobItemMetadata } from "./interface";

export class StoreLocalStorage implements IStorage {
  private JOB_STORAGE_KEY = "ISM_JOBS";
  constructor(key?: string) {
    if (key) {
      this.JOB_STORAGE_KEY = key;
    }
  }
  async setup(): Promise<boolean> {
    // do nothing
    return true;
  }
  async getAll(): Promise<JobItemMetadata[]> {
    return JSON.parse(localStorage.getItem(this.JOB_STORAGE_KEY) || "[]");
  }
  async set(key: string, value: JobItemMetadata): Promise<boolean> {
    try {
      const result = await this.getAll();
      const findIndex = result.findIndex((item) => item.id === key);
      if (findIndex > -1) {
        result[findIndex] = value;
      } else {
        result.push(value);
      }
      this.saveToDisk(result);
      return true;
    } catch (e) {
      return false;
    }
  }
  async get(key: string): Promise<JobItemMetadata | undefined> {
    const all = await this.getAll();
    return all.find((item) => item.id === key);
  }
  async delete(key: string): Promise<boolean> {
    const result = await this.getAll();
    return this.saveToDisk(result.filter((item) => item.id !== key));
  }
  private saveToDisk(payload: JobItemMetadata[]) {
    try {
      localStorage.setItem(this.JOB_STORAGE_KEY, JSON.stringify(payload));
      return true;
    } catch (e) {
      return false;
    }
  }
}
