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

export const getNotifyCreation = (policy: SMPolicy) => {
  return String(_.get(policy, "notification.conditions.creation", false)) == "true";
};

export const getNotifyDeletion = (policy: SMPolicy) => {
  return String(_.get(policy, "notification.conditions.deletion", false)) == "true";
};

export const getNotifyFailure = (policy: SMPolicy) => {
  return String(_.get(policy, "notification.conditions.failure", false)) == "true";
};

export const showNotification = (policy: SMPolicy) => {
  const notifyOnCreation = getNotifyCreation(policy);
  const notifyOnDeletion = getNotifyDeletion(policy);
  const notifyOnFailure = getNotifyFailure(policy);

  let showNotificationChannel = false;
  if (notifyOnCreation || notifyOnDeletion || notifyOnFailure) {
    showNotificationChannel = true;
  }

  return showNotificationChannel;
};
