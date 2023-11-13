/*
 *   Copyright OpenSearch Contributors
 *
 *   Licensed under the Apache License, Version 2.0 (the "License").
 *   You may not use this file except in compliance with the License.
 *   A copy of the License is located at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   or in the "license" file accompanying this file. This file is distributed
 *   on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 *   express or implied. See the License for the specific language governing
 *   permissions and limitations under the License.
 */

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
  beforeEach(() => {
    apiCallerMock(browserServicesMock);
  });
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

    const indexNameInput = getByPlaceholderText("Specify a name for the new index.");

    userEvent.type(indexNameInput, `good_index`);
    userEvent.click(document.body);
    userEvent.click(getByText("Create"));

    await waitFor(() => {
      expect(getByText(`location is: ${ROUTES.INDEX_POLICIES}`)).toBeInTheDocument();
    });
  });
});
