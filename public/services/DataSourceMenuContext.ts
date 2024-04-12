import { create } from "lodash";
import { createContext } from "react";

export interface DataSourceMenuProperties {
  dataSourceId: string;
  multiDataSourceEnabled: boolean;
}

export interface DataSourceMenuReadOnlyProperties {
  dataSourceReadOnly: boolean;
  setDataSourceReadOnly: (dataSourceMenuReadOnly: boolean) => void;
}

const DataSourceMenuContext = createContext<DataSourceMenuProperties>({
  dataSourceId: "",
  multiDataSourceEnabled: false,
});

const DataSourceMenuConsumer = DataSourceMenuContext.Consumer;

export { DataSourceMenuContext, DataSourceMenuConsumer };
