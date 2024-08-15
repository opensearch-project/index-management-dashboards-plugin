/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { createContext } from "react";
import { BrowserServices } from "../models/interfaces";
import { NavigationPublicPluginStart } from "../../../../src/plugins/navigation/public";
import { createGetterSetter } from "../../../../src/plugins/opensearch_dashboards_utils/public";
import { CoreStart, IUiSettingsClient } from "../../../../src/core/public";

const ServicesContext = createContext<BrowserServices | null>(null);

const ServicesConsumer = ServicesContext.Consumer;

export { ServicesContext, ServicesConsumer };

export const [getUISettings, setUISettings] = createGetterSetter<IUiSettingsClient>("UISettings");

export const [getNavigationUI, setNavigationUI] = createGetterSetter<NavigationPublicPluginStart["ui"]>("navigation");

export const [getApplication, setApplication] = createGetterSetter<CoreStart["application"]>("application");
