/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import _ from "lodash";
import { SMPolicy } from "../../../../models/interfaces";

export const getIncludeGlobalState = (policy: SMPolicy) => {
  return String(_.get(policy, "snapshot_config.include_global_state", false)) == "true";
};

export const getIgnoreUnavailabel = (policy: SMPolicy) => {
  return String(_.get(policy, "snapshot_config.ignore_unavailable", false)) == "true";
};

export const getAllowPartial = (policy: SMPolicy) => {
  return String(_.get(policy, "snapshot_config.partial", false)) == "true";
};
