/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { MemoryRouter as Router, Route, RouteComponentProps, Switch } from "react-router-dom";
import { render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CreateComposableTemplate from "./CreateComposableTemplate";
import { ServicesContext } from "../../../../services";
import { browserServicesMock, coreServicesMock, apiCallerMock } from "../../../../../test/mocks";
import { ROUTES } from "../../../../utils/constants";
import { CoreServicesContext } from "../../../../components/core_services";

function renderCreateComposableTemplateWithRouter(initialEntries = [ROUTES.CREATE_COMPOSABLE_TEMPLATE] as string[]) {
  return {
    ...render(
      <Router initialEntries={initialEntries}>
        <CoreServicesContext.Provider value={coreServicesMock}>
          <ServicesContext.Provider value={browserServicesMock}>
            <Switch>
              <Route
                path={`${ROUTES.CREATE_COMPOSABLE_TEMPLATE}/:template/:mode`}
                render={(props: RouteComponentProps) => <CreateComposableTemplate {...props} />}
              />
              <Route
                path={`${ROUTES.CREATE_COMPOSABLE_TEMPLATE}/:template`}
                render={(props: RouteComponentProps) => <CreateComposableTemplate {...props} />}
              />
              <Route
                path={ROUTES.CREATE_COMPOSABLE_TEMPLATE}
                render={(props: RouteComponentProps) => <CreateComposableTemplate {...props} />}
              />
              <Route
                path={ROUTES.COMPOSABLE_TEMPLATES}
                render={(props: RouteComponentProps) => <h1>location is: {ROUTES.COMPOSABLE_TEMPLATES}</h1>}
              />
            </Switch>
          </ServicesContext.Provider>
        </CoreServicesContext.Provider>
      </Router>
    ),
  };
}

describe("<CreateComposableTemplate /> spec", () => {
  beforeEach(() => {
    apiCallerMock(browserServicesMock);
  });
  it("it goes to templates page when click cancel", async () => {
    const { findByTitle, container } = renderCreateComposableTemplateWithRouter([`${ROUTES.CREATE_COMPOSABLE_TEMPLATE}/good_template`]);
    await findByTitle("good_template");
    expect(container).toMatchSnapshot();
  });
});
