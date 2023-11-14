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

import React from "react";
import { MemoryRouter as Router, Route, RouteComponentProps, Switch } from "react-router-dom";
import { render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CreateDataStream from "./CreateDataStream";
import { ServicesContext } from "../../../../services";
import { browserServicesMock, coreServicesMock, apiCallerMock } from "../../../../../test/mocks";
import { ROUTES } from "../../../../utils/constants";
import { CoreServicesContext } from "../../../../components/core_services";

function renderCreateDataStreamWithRouter(initialEntries = [ROUTES.DATA_STREAMS] as string[]) {
  return {
    ...render(
      <Router initialEntries={initialEntries}>
        <CoreServicesContext.Provider value={coreServicesMock}>
          <ServicesContext.Provider value={browserServicesMock}>
            <Switch>
              <Route
                path={`${ROUTES.CREATE_DATA_STREAM}/:template`}
                render={(props: RouteComponentProps) => <CreateDataStream {...props} />}
              />
              <Route path={ROUTES.CREATE_DATA_STREAM} render={(props: RouteComponentProps) => <CreateDataStream {...props} />} />
              <Route path={ROUTES.DATA_STREAMS} render={(props: RouteComponentProps) => <h1>location is: {ROUTES.DATA_STREAMS}</h1>} />
            </Switch>
          </ServicesContext.Provider>
        </CoreServicesContext.Provider>
      </Router>
    ),
  };
}

describe("<CreateDataStream /> spec", () => {
  beforeEach(() => {
    apiCallerMock(browserServicesMock);
  });
  it("it goes to data streams page when click cancel", async () => {
    const { getByTestId, getByText, container, findByText } = renderCreateDataStreamWithRouter([ROUTES.CREATE_DATA_STREAM]);
    await findByText("Define data stream");
    expect(container).toMatchSnapshot();
    userEvent.click(getByTestId("CreateDataStreamCancelButton"));
    await waitFor(() => {
      expect(getByText(`location is: ${ROUTES.DATA_STREAMS}`)).toBeInTheDocument();
    });
  });
});
