/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { DataSourcePluginStart } from "src/plugins/data_source/public/types";

export interface AppPluginStartDependencies {
  dataSource: DataSourcePluginStart;
}
