import { createContext } from "react";

export interface DataSourceMenuProperties {
  dataSourceId: string;
  dataSourceLabel: string;
  multiDataSourceEnabled: boolean;
}

const DataSourceMenuContext = createContext<DataSourceMenuProperties>({
  dataSourceId: "",
  dataSourceLabel: "",
  multiDataSourceEnabled: false,
});

const DataSourceMenuConsumer = DataSourceMenuContext.Consumer;

export { DataSourceMenuContext, DataSourceMenuConsumer };
