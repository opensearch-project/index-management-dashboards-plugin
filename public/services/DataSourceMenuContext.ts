import { createContext } from "react";

interface DataSourceMenuProperties {
  dataSourceId: string;
  dataSourceLabel: string;
  multiDataSourceEnabled: boolean;
}

const DataSourceMenuContext = createContext<DataSourceMenuProperties>({
  dataSourceId: "",
  dataSourceLabel: "",
  multiDataSourceEnabled: false,
});

export { DataSourceMenuContext };
