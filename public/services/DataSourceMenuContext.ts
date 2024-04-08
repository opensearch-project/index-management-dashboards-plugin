import { createContext } from "react";
import { DataSourceOption } from "../../../../src/plugins/data_source_management/public/components/data_source_menu/types";

export interface DataSourceMenuProperties {
  dataSource: DataSourceOption[];
  multiDataSourceEnabled: boolean;
}

export interface DataSourceProperties {
  dataSourceId: string;
  multiDataSourceEnabled: boolean;
}

export interface DataSourceMenuReadOnlyProperties {
  dataSourceReadOnly: boolean;
  setDataSourceReadOnly: (dataSourceMenuReadOnly: boolean) => void;
}

const DataSourceMenuContext = createContext<DataSourceMenuProperties>({
  dataSource: [],
  multiDataSourceEnabled: false,
});

const DataSourceMenuConsumer = DataSourceMenuContext.Consumer;

export { DataSourceMenuContext, DataSourceMenuConsumer };
