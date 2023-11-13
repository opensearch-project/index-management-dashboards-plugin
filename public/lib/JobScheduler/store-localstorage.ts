/*
 *   Copyright OpenSearch Contributors
 *
 *   Licensed under the Apache License, Version 2.0 (the "License").
 *   You may not use this file except in compliance with the License.
 *   A copy of the License is located at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   or in the "license" file accompanying this file. This file is distributed
 *   on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 *   express or implied. See the License for the specific language governing
 *   permissions and limitations under the License.
 */

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
