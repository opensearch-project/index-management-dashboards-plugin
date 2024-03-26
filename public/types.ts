import { DataSourcePluginStart } from "src/plugins/data_source/public/types";

export interface AppPluginStartDependencies {
  dataSource: DataSourcePluginStart;
}
