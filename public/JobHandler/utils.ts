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
export const EVENT_MAP = {
  REINDEX_COMPLETE: "REINDEX_COMPLETE",
  SPLIT_COMPLETE: "SPLIT_COMPLETE",
  SHRINK_COMPLETE: "SHRINK_COMPLETE",
  FORCE_MERGE_COMPLETE: "FORCE_MERGE_COMPLETE",
  OPEN_COMPLETE: "OPEN_COMPLETE",
};

export const triggerEvent = (eventName: string, data?: unknown) => {
  const event = new CustomEvent(eventName, {
    detail: data,
  });
  window.dispatchEvent(event);
};

export const listenEvent = (eventName: string, callback: () => void) => {
  window.addEventListener(eventName, callback);
};

export const destroyListener = (eventName: string, callback: () => void) => {
  window.removeEventListener(eventName, callback);
};
