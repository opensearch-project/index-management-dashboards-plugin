/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { AppMountParameters, CoreStart } from "opensearch-dashboards/public";
import React from "react";
import { createRoot } from "react-dom/client";
import { HashRouter as Router, Route } from "react-router-dom";
import { DarkModeContext } from "./components/DarkMode";
import Main from "./pages/Main";
import { CoreServicesContext } from "./components/core_services";
import "./app.scss";
import { AppPluginStartDependencies } from "./types";
import { DataSourceManagementPluginSetup } from "../../../src/plugins/data_source_management/public";

export function renderApp(
  coreStart: CoreStart,
  pluginStartDependencies: AppPluginStartDependencies,
  params: AppMountParameters,
  landingPage: string,
  dataSourceManagement: DataSourceManagementPluginSetup
) {
  const isDarkMode = coreStart.uiSettings.get("theme:darkMode") || false;

  const root = createRoot(params.element);
  root.render(
    <Router>
      <Route
        render={(props) => (
          <DarkModeContext.Provider value={isDarkMode}>
            <CoreServicesContext.Provider value={coreStart}>
              <Main
                {...props}
                landingPage={landingPage}
                setActionMenu={params.setHeaderActionMenu}
                multiDataSourceEnabled={!!pluginStartDependencies.dataSource}
                dataSourceManagement={dataSourceManagement}
              />
            </CoreServicesContext.Provider>
          </DarkModeContext.Provider>
        )}
      />
    </Router>
  );
  return () => root.unmount();
}
