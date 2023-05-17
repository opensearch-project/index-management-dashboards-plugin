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
  [ActionType.REINDEX]: "Notify when any reindex operations has failed or completed.",
  [ActionType.RESIZE]: "Notify when any shrink, split, or clone operations has failed or completed.",
  [ActionType.FORCEMERGE]: "Notify when any force merge operations has failed or completed.",
  [ActionType.OPEN]: "Notify when any open operations has failed or completed.",
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
