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

export enum ActionType {
  REINDEX = "REINDEX",
  RESIZE = "RESIZE",
  FORCEMERGE = "FORCEMERGE",
  OPEN = "OPEN",
}

export enum OperationType {
  REINDEX = "REINDEX",
  FORCEMERGE = "FORCEMERGE",
  OPEN = "OPEN",
  SHRINK = "SHRINK",
  CLONE = "CLONE",
  SPLIT = "SPLIT",
}

export const ActionTypeMapTitle = {
  [ActionType.REINDEX]: "reindex",
  [ActionType.RESIZE]: "shrink, split, clone",
  [ActionType.FORCEMERGE]: "force merge",
  [ActionType.OPEN]: "open",
};

export const ActionTypeMapDescription = {
  [ActionType.REINDEX]: "Notify when any reindex operation has failed or completed.",
  [ActionType.RESIZE]: "Notify when any shrink, split, or clone operation has failed or completed.",
  [ActionType.FORCEMERGE]: "Notify when any force merge operation has failed or completed.",
  [ActionType.OPEN]: "Notify when any open operation has failed or completed.",
};

export const OperationTypeMapTitle = {
  ...ActionTypeMapTitle,
  [OperationType.SHRINK]: "shrink",
  [OperationType.SPLIT]: "split",
  [OperationType.CLONE]: "clone",
};

export const ActionTypeMapName = {
  [ActionType.REINDEX]: "indices:data/write/reindex",
  [ActionType.RESIZE]: "indices:admin/resize",
  [ActionType.FORCEMERGE]: "indices:admin/forcemerge",
  [ActionType.OPEN]: "indices:admin/open",
} as const;

export const getKeyByValue = <T extends {}, Key extends keyof T>(obj: T, value: T[Key]) => {
  if (!obj) {
    return undefined;
  }
  return Object.keys(obj).find((key) => obj[key as Key] === value);
};

export enum FieldEnum {
  channels = "channels",
  failure = "failure",
  success = "success",
}

export const FieldMapLabel = {
  [FieldEnum.channels]: "Notification channels",
};

export const LABEL_FOR_CONDITION = "Notify when operation";
export const VALIDATE_ERROR_FOR_CHANNELS = "One or more channels is required.";
