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

// Code from https://github.com/elastic/eui
// Used under the Apache-2.0 license.

// This is from EUI library, but cannot be used until we are at 7.2+
// This is a temporary import for 7.0 and 7.1
export default class AsyncInterval {
  timeoutId: number | undefined;
  isStopped: boolean = false;
  _pendingFn: Function | undefined;

  constructor(fn: Function, refreshInterval: number) {
    this.setAsyncInterval(fn, refreshInterval);
  }

  setAsyncInterval = (fn: Function, ms: number) => {
    if (!this.isStopped) {
      this.timeoutId = window.setTimeout(async () => {
        if (document.visibilityState === "visible") {
          this._pendingFn = await fn();
        }
        this.setAsyncInterval(fn, ms);
      }, ms);
    }
  };

  stop = () => {
    this.isStopped = true;
    window.clearTimeout(this.timeoutId);
  };
}
