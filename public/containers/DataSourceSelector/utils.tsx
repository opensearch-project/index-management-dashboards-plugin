const dataSourceSessionKey = "DATA_SOURCE_IN_ISM";
export const setDataSource = (dataSourceId: string) => {
  sessionStorage.setItem(dataSourceSessionKey, dataSourceId);
};

export const getDataSource = (): string => sessionStorage.getItem(dataSourceSessionKey) || "";
