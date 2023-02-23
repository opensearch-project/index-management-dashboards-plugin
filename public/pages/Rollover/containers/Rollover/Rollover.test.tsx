/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { render, waitFor } from "@testing-library/react";
import { MemoryRouter as Router } from "react-router";
import { Route, RouteComponentProps, Switch } from "react-router-dom";
import { browserServicesMock, coreServicesMock, apiCallerMock } from "../../../../../test/mocks";
import Rollover, { RolloverProps } from "./Rollover";
import { ModalProvider } from "../../../../components/Modal";
import { ServicesContext } from "../../../../services";
import { CoreServicesContext } from "../../../../components/core_services";

function renderWithRouter(props: Omit<RolloverProps, keyof RouteComponentProps>, initialEntries: string[]) {
  return {
    ...render(
      <Router initialEntries={initialEntries}>
        <CoreServicesContext.Provider value={coreServicesMock}>
          <ServicesContext.Provider value={browserServicesMock}>
            <ModalProvider>
              <Switch>
                <Route path="/:source" render={(routeProps) => <Rollover {...props} {...routeProps} />} />
              </Switch>
            </ModalProvider>
          </ServicesContext.Provider>
        </CoreServicesContext.Provider>
      </Router>
    ),
  };
}

describe("container <Rollover /> spec", () => {
  beforeEach(() => {
    apiCallerMock(browserServicesMock);
  });
  it("render the component", async () => {
    browserServicesMock.indexService.getDataStreams = jest.fn(() => {
      return {
        ok: true,
      } as any;
    }) as typeof browserServicesMock.indexService.getDataStreams;
    const { container } = renderWithRouter({}, [`/test_alias`]);

    await waitFor(() => {
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
