/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { PluginInitializerContext } from "opensearch-dashboards/public";
import { IndexManagementPlugin } from "./plugin";
import { Action, UIAction } from "../models/interfaces";

// export for other plugins to register action
export { Action, UIAction } from "../models/interfaces";

export interface IndexManagementPluginSetup {
  registerAction: (actionType: string, uiActionCtor: new (action: Action) => UIAction<any>, defaultAction: Action) => void;
}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IndexManagementPluginStart {}

export function plugin(initializerContext: PluginInitializerContext) {
  return new IndexManagementPlugin(initializerContext);
}
