export enum ActionType {
  REINDEX = "REINDEX",
  RESIZE = "RESIZE",
  FORCEMERGE = "FORCEMERGE",
  OPEN = "OPEN",
}

export const ActionTypeMapTitle = {
  [ActionType.REINDEX]: "reindex",
  [ActionType.RESIZE]: "shrink, split, clone",
  [ActionType.FORCEMERGE]: "force merge",
  [ActionType.OPEN]: "open",
};

export const ActionTypeMapName = {
  [ActionType.REINDEX]: "indices:data/write/reindex",
  [ActionType.RESIZE]: "indices:admin/resize",
  [ActionType.FORCEMERGE]: "indices:admin/forcemerge",
  [ActionType.OPEN]: "indices:admin/open",
};

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
  [FieldEnum.channels]: "Select channels to notify",
};
