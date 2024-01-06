/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { PluginInitializerContext } from "opensearch-dashboards/public";
import { IndexManagementPlugin } from "./plugin";
import { Action, UIAction } from "../models/interfaces";
import "@opensearch-project/oui/dist/oui_theme_light.css";

// export for other plugins to register action
export { Action, UIAction } from "../models/interfaces";

export interface IndexManagementPluginSetup {
  registerAction: (actionType: string, uiActionCtor: new (action: Action) => UIAction<any>, defaultAction: Action) => void;
}
export interface IndexManagementPluginStart {}

export function plugin(initializerContext: PluginInitializerContext) {
  return new IndexManagementPlugin(initializerContext);
}
