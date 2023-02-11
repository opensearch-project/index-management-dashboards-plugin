/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
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
