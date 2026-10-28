/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ManagedIndexMetaData } from "../models/interfaces";

// Job status is derived from the managed index metadata rather than stored on the managed index document,
// so it can't be sorted by the ISM explain API and is sorted by the server route instead.
export const JOB_STATUS_SORT_FIELD = "jobStatus";

export const getManagedIndexJobStatus = (managedIndexMetaData: ManagedIndexMetaData | null): string => {
  if (!managedIndexMetaData) return "Initializing";
  const { policyCompleted, retryInfo, action } = managedIndexMetaData;
  if (policyCompleted) return "Completed";
  if (retryInfo && retryInfo.failed) return "Failed";
  if (action && action.failed) return "Failed";
  return "Running";
};
