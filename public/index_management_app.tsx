/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { AppMountParameters, CoreStart } from "opensearch-dashboards/public";
import React from "react";
import ReactDOM from "react-dom";
import { HashRouter as Router, Route } from "react-router-dom";
import { DarkModeContext } from "./components/DarkMode";
import Main from "./pages/Main";
import { CoreServicesContext } from "./components/core_services";
import "./app.scss";
import { DataSourceManagementPluginSetup } from "../../../src/plugins/data_source_management/public";
import { DataSourcePluginSetup } from "../../../src/plugins/data_source/public";

export function renderApp(
  coreStart: CoreStart,
  params: AppMountParameters,
  landingPage: string,
  dataSource: DataSourcePluginSetup,
  dataSourceManagement: DataSourceManagementPluginSetup
) {
  const isDarkMode = coreStart.uiSettings.get("theme:darkMode") || false;

  ReactDOM.render(
    <Router>
      <Route
        render={(props) => (
          <DarkModeContext.Provider value={isDarkMode}>
            <CoreServicesContext.Provider value={coreStart}>
              <Main
                {...props}
                landingPage={landingPage}
                setActionMenu={params.setHeaderActionMenu}
                multiDataSourceEnabled={dataSource.dataSourceEnabled}
                dataSourceManagement={dataSourceManagement}
              />
            </CoreServicesContext.Provider>
          </DarkModeContext.Provider>
        )}
      />
    </Router>,
    params.element
  );
  return () => ReactDOM.unmountComponentAtNode(params.element);
}
