export const ActionType = {
  REINDEX: "REINDEX",
  RESIZE: "RESIZE",
  FORCEMERGE: "FORCEMERGE",
  OPEN: "OPEN",
};

export const ActionTypeMapTitle = {
  [ActionType.REINDEX]: "Reindex",
  [ActionType.RESIZE]: "Resize",
  [ActionType.FORCEMERGE]: "Force merge",
  [ActionType.OPEN]: "Open",
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
