/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { render, waitFor } from "@testing-library/react";
import { HashRouter as Router, Redirect, Route, Switch } from "react-router-dom";
import { CoreStart } from "opensearch-dashboards/public";
import ChangePolicy from "./ChangePolicy";
import { browserServicesMock, coreServicesMock } from "../../../../../test/mocks";
import { BREADCRUMBS, ROUTES } from "../../../../utils/constants";
import { ServicesConsumer, ServicesContext } from "../../../../services";
import { ModalProvider, ModalRoot } from "../../../../components/Modal";
import { CoreServicesConsumer, CoreServicesContext } from "../../../../components/core_services";
import { getApplication, getNavigationUI, getUISettings } from "../../../../services/Services";

jest.mock("../../../../services/Services", () => ({
  ...jest.requireActual("../../../../services/Services"),
  getUISettings: jest.fn(),
  getApplication: jest.fn(),
  getNavigationUI: jest.fn(),
}));

beforeEach(() => {
  (getUISettings as jest.Mock).mockReturnValue({
    get: jest.fn().mockReturnValue(false), // or false, depending on your test case
  });
  (getApplication as jest.Mock).mockReturnValue({});

  (getNavigationUI as jest.Mock).mockReturnValue({});
});

function renderWithRouter(Component: React.ComponentType<any>) {
  return {
    ...render(
      <Router>
        <Switch>
          <Route
            path={ROUTES.CHANGE_POLICY}
            render={(props) => (
              <CoreServicesContext.Provider value={coreServicesMock}>
                <ServicesContext.Provider value={browserServicesMock}>
                  <ModalProvider>
                    <ServicesConsumer>{(services) => services && <ModalRoot services={services} />}</ServicesConsumer>
                    <CoreServicesConsumer>
                      {(core: CoreStart | null) => (
                        <ServicesConsumer>
                          {({ managedIndexService, indexService }: any) => (
                            <Component indexService={indexService} managedIndexService={managedIndexService} {...props} />
                          )}
                        </ServicesConsumer>
                      )}
                    </CoreServicesConsumer>
                  </ModalProvider>
                </ServicesContext.Provider>
              </CoreServicesContext.Provider>
            )}
          />
          <Redirect from="/" to={ROUTES.CHANGE_POLICY} />
        </Switch>
      </Router>
    ),
  };
}

describe("<ChangePolicy /> spec", () => {
  it("renders the component", async () => {
    const { container } = renderWithRouter(ChangePolicy);

    await waitFor(() => {});

    expect(container.firstChild).toMatchSnapshot();
  });

  it("sets breadcrumbs when mounting", async () => {
    renderWithRouter(ChangePolicy);
    expect(coreServicesMock.chrome.setBreadcrumbs).toHaveBeenCalledTimes(1);
    expect(coreServicesMock.chrome.setBreadcrumbs).toHaveBeenCalledWith([
      BREADCRUMBS.INDEX_MANAGEMENT,
      BREADCRUMBS.MANAGED_INDICES,
      BREADCRUMBS.CHANGE_POLICY,
    ]);
  });
});
