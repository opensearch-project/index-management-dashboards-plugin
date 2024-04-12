import { createContext } from "react";

export interface DataSourceMenuProperties {
  dataSourceId: string;
  multiDataSourceEnabled: boolean;
}

const DataSourceMenuContext = createContext<DataSourceMenuProperties>({
  dataSourceId: "",
  multiDataSourceEnabled: false,
});

const DataSourceMenuConsumer = DataSourceMenuContext.Consumer;

export { DataSourceMenuContext, DataSourceMenuConsumer };
