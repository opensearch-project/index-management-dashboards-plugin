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
import { AppPluginStartDependencies } from "./types";

export function renderApp(
  coreStart: CoreStart,
  pluginStartDependencies: AppPluginStartDependencies,
  params: AppMountParameters,
  landingPage: string
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
                multiDataSourceEnabled={!!pluginStartDependencies.dataSource}
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
