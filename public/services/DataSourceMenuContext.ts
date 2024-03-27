import { create } from "lodash";
import { createContext } from "react";

export interface DataSourceMenuProperties {
  dataSourceId: string;
  dataSourceLabel: string;
  multiDataSourceEnabled: boolean;
}

export interface DataSourceMenuReadOnlyProperties {
  dataSourceReadOnly: boolean;
  setDataSourceReadOnly: (dataSourceMenuReadOnly: boolean) => void;
}

const DataSourceMenuContext = createContext<DataSourceMenuProperties>({
  dataSourceId: "",
  dataSourceLabel: "",
  multiDataSourceEnabled: false,
});

const DataSourceMenuConsumer = DataSourceMenuContext.Consumer;

const DataSourceMenuReadOnlyContext = createContext<DataSourceMenuReadOnlyProperties>({
  dataSourceReadOnly: false,
  setDataSourceReadOnly: () => {},
});

export { DataSourceMenuContext, DataSourceMenuReadOnlyContext, DataSourceMenuConsumer };
