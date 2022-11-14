/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { MemoryRouter as Router, Route, RouteComponentProps, Switch } from "react-router-dom";
import { render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CoreStart } from "opensearch-dashboards/public";
import CreateIndex from "./CreateIndex";
import { ServicesConsumer, ServicesContext } from "../../../../services";
import { browserServicesMock, coreServicesMock, apiCallerMock } from "../../../../../test/mocks";
import { BrowserServices } from "../../../../models/interfaces";
import { ModalProvider, ModalRoot } from "../../../../components/Modal";
import { ROUTES } from "../../../../utils/constants";
import { CoreServicesConsumer, CoreServicesContext } from "../../../../components/core_services";

apiCallerMock(browserServicesMock);

function renderCreateIndexWithRouter(initialEntries = [ROUTES.CREATE_INDEX] as string[]) {
  return {
    ...render(
      <Router initialEntries={initialEntries}>
        <CoreServicesContext.Provider value={coreServicesMock}>
          <ServicesContext.Provider value={browserServicesMock}>
            <ServicesConsumer>
              {(services: BrowserServices | null) =>
                services && (
                  <CoreServicesConsumer>
                    {(core: CoreStart | null) =>
                      core && (
                        <ModalProvider>
                          <ModalRoot services={services} />
                          <Switch>
                            <Route
                              path={`${ROUTES.CREATE_INDEX}/:index/:mode`}
                              render={(props: RouteComponentProps) => <CreateIndex {...props} commonService={services.commonService} />}
                            />
                            <Route
                              path={`${ROUTES.CREATE_INDEX}/:index`}
                              render={(props: RouteComponentProps) => <CreateIndex {...props} commonService={services.commonService} />}
                            />
                            <Route
                              path={ROUTES.CREATE_INDEX}
                              render={(props: RouteComponentProps) => <CreateIndex {...props} commonService={services.commonService} />}
                            />
                            <Route
                              path={ROUTES.INDICES}
                              render={(props: RouteComponentProps) => <h1>location is: {ROUTES.INDEX_POLICIES}</h1>}
                            />
                          </Switch>
                        </ModalProvider>
                      )
                    }
                  </CoreServicesConsumer>
                )
              }
            </ServicesConsumer>
          </ServicesContext.Provider>
        </CoreServicesContext.Provider>
      </Router>
    ),
  };
}

describe("<CreateIndex /> spec", () => {
  it("it goes to indices page when click cancel", async () => {
    const { getByText } = renderCreateIndexWithRouter([`${ROUTES.CREATE_INDEX}/good_index`]);
    await waitFor(() => {});
    userEvent.click(getByText("Cancel"));
    await waitFor(() => {
      expect(getByText(`location is: ${ROUTES.INDEX_POLICIES}`)).toBeInTheDocument();
    });
  });

  it("it goes to indices page when click create successfully", async () => {
    const { getByText, getByPlaceholderText } = renderCreateIndexWithRouter([`${ROUTES.CREATE_INDEX}`]);

    await waitFor(() => {
      getByText("Define index");
    });

    const indexNameInput = getByPlaceholderText("Please enter the name for your index");

    userEvent.type(indexNameInput, `good_index`);
    userEvent.click(document.body);
    userEvent.click(getByText("Create"));

    await waitFor(() => {
      expect(getByText(`location is: ${ROUTES.INDEX_POLICIES}`)).toBeInTheDocument();
    });
  });
});
