/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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
                <Route path="/:index" render={(routeProps) => <Rollover {...props} {...routeProps} />} />
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
    browserServicesMock.indexService.getIndices = jest.fn(() => {
      return {
        ok: true,
        response: {
          indices: [
            {
              "docs.count": "5",
              "docs.deleted": "2",
              health: "green",
              index: "test_index",
              pri: "1",
              "pri.store.size": "100KB",
              rep: "0",
              status: "open",
              "store.size": "100KB",
              uuid: "some_uuid",
              managed: "",
              managedPolicy: "",
              data_stream: "",
            },
          ],
        },
      } as any;
    }) as typeof browserServicesMock.indexService.getIndices;
    const { container, getByTestId, queryByText } = renderWithRouter({}, [`/test_index`]);

    await waitFor(() => {
      expect(container.firstChild).toMatchSnapshot();
      expect(document.querySelector("#RolloverModalOverview")).not.toBeNull();
      expect(browserServicesMock.commonService.apiCaller).toBeCalledTimes(1);
      expect(browserServicesMock.commonService.apiCaller).toBeCalledWith({
        endpoint: "indices.get",
        data: {
          index: "test_index",
        },
      });
    });

    userEvent.click(document.getElementById("RolloverModalAlias") as Element);
    await waitFor(() => {
      expect(queryByText("Index alias")).not.toBeNull();
    });
    userEvent.click(getByTestId("detailModalEdit"));
    await waitFor(() => {});
    userEvent.click(getByTestId("createIndexCreateButton"));
    await waitFor(() => {
      expect(browserServicesMock.commonService.apiCaller).toBeCalledTimes(4);
    });
  });
});
