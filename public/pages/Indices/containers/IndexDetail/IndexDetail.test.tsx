/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { render, waitFor } from "@testing-library/react";
import { Route, Switch, HashRouter as Router } from "react-router-dom";
import { browserServicesMock, coreServicesMock, apiCallerMock } from "../../../../../test/mocks";
import IndexDetail, { IndexDetailModalProps } from "./index";
import { ModalProvider } from "../../../../components/Modal";
import { ServicesContext } from "../../../../services";
import { CoreServicesContext } from "../../../../components/core_services";

apiCallerMock(browserServicesMock);

function renderWithRouter(props: Omit<IndexDetailModalProps, "history">) {
  return {
    ...render(
      <Router>
        <CoreServicesContext.Provider value={coreServicesMock}>
          <ServicesContext.Provider value={browserServicesMock}>
            <ModalProvider>
              <Switch>
                <Route path="/" render={(routeProps) => <IndexDetail {...props} history={routeProps.history} />} />
              </Switch>
            </ModalProvider>
          </ServicesContext.Provider>
        </CoreServicesContext.Provider>
      </Router>
    ),
  };
}

describe("container <IndexDetail /> spec", () => {
  const onUpdateSuccessMock = jest.fn();
  it("render the component", async () => {
    const { container } = renderWithRouter({
      index: "test_index",
      record: {
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
      onUpdateIndex: onUpdateSuccessMock,
    });

    await waitFor(() => {
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
