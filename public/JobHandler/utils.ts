/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
export const EVENT_MAP = {
  REINDEX_COMPLETE: "REINDEX_COMPLETE",
  SPLIT_COMPLETE: "SPLIT_COMPLETE",
  SHRINK_COMPLETE: "SHRINK_COMPLETE",
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
