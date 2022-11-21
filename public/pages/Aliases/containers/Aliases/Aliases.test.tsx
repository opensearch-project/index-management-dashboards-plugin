/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { render } from "@testing-library/react";
import { Redirect, Route, Switch } from "react-router-dom";
import { HashRouter as Router } from "react-router-dom";
import { browserServicesMock, coreServicesMock } from "../../../../../test/mocks";
import Aliases from "./Aliases";
import { ServicesContext } from "../../../../services";
import { ROUTES } from "../../../../utils/constants";
import { CoreServicesContext } from "../../../../components/core_services";

function renderWithRouter() {
  return {
    ...render(
      <Router>
        <Switch>
          <Route
            path={ROUTES.ALIASES}
            render={(props) => (
              <CoreServicesContext.Provider value={coreServicesMock}>
                <ServicesContext.Provider value={browserServicesMock}>
                  <Aliases {...props} />
                </ServicesContext.Provider>
              </CoreServicesContext.Provider>
            )}
          />
          <Redirect from="/" to={ROUTES.ALIASES} />
        </Switch>
      </Router>
    ),
  };
}

describe("<Indices /> spec", () => {
  it("renders the component", async () => {
    const { container } = renderWithRouter();

    expect(container.firstChild).toMatchSnapshot();
  });
});
