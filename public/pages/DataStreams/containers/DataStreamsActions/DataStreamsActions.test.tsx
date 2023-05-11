/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { browserServicesMock, coreServicesMock } from "../../../../../test/mocks";
import DataStreamsActions, { DataStreamsActionsProps } from "./index";
import { ServicesContext } from "../../../../services";
import { CoreServicesContext } from "../../../../components/core_services";
import { Route, HashRouter as Router, Switch, Redirect } from "react-router-dom";
import { ROUTES } from "../../../../utils/constants";
import { buildMockApiCallerForFlush, selectedDataStreams } from "../../../../containers/FlushIndexModal/FlushIndexModalTestHelper";
const historyPushMock = jest.fn();

function renderWithRouter(props: Omit<DataStreamsActionsProps, "history">) {
  return {
    ...render(
      <CoreServicesContext.Provider value={coreServicesMock}>
        <ServicesContext.Provider value={browserServicesMock}>
          <Router>
            <Switch>
              <Route
                path={ROUTES.DATA_STREAMS}
                render={(routeProps) => (
                  <CoreServicesContext.Provider value={coreServicesMock}>
                    <ServicesContext.Provider value={browserServicesMock}>
                      <DataStreamsActions
                        {...props}
                        history={{
                          ...routeProps.history,
                          push: (...args) => {
                            routeProps.history.push(...args);
                            historyPushMock(...args);
                          },
                        }}
                      />
                    </ServicesContext.Provider>
                  </CoreServicesContext.Provider>
                )}
              />
              <Redirect from="/" to={ROUTES.DATA_STREAMS} />
            </Switch>
          </Router>
        </ServicesContext.Provider>
      </CoreServicesContext.Provider>
    ),
  };
}

describe("<DataStreamsActions /> spec", () => {
  it("renders the component and all the actions should be disabled when no items selected", async () => {
    const { container, getByTestId } = renderWithRouter({
      selectedItems: [],
      onDelete: () => null,
    });

    await waitFor(() => {
      expect(container.firstChild).toMatchSnapshot();
    });

    userEvent.click(document.querySelector('[data-test-subj="moreAction"] button') as Element);
    await waitFor(() => {
      expect(getByTestId("deleteAction")).toBeDisabled();
    });
  });

  it("delete data streams by calling commonService", async () => {
    const onDelete = jest.fn();
    browserServicesMock.commonService.apiCaller = jest.fn(
      async (): Promise<any> => {
        return { ok: true, response: {} };
      }
    );
    const { container, getByTestId, getByPlaceholderText } = renderWithRouter({
      selectedItems: [{ name: "test_data_stream" }],
      onDelete,
    });

    await waitFor(() => {
      expect(container.firstChild).toMatchSnapshot();
    });

    userEvent.click(document.querySelector('[data-test-subj="moreAction"] button') as Element);
    userEvent.click(getByTestId("deleteAction"));
    userEvent.type(getByPlaceholderText("delete"), "delete");
    userEvent.click(getByTestId("deleteConfirmButton"));

    await waitFor(() => {
      expect(browserServicesMock.commonService.apiCaller).toHaveBeenCalledTimes(1);
      expect(browserServicesMock.commonService.apiCaller).toHaveBeenCalledWith({
        endpoint: "transport.request",
        data: {
          path: `/_data_stream/test_data_stream`,
          method: "DELETE",
        },
      });
      expect(onDelete).toHaveBeenCalledTimes(1);
      expect(coreServicesMock.notifications.toasts.addSuccess).toHaveBeenCalledTimes(1);
      expect(coreServicesMock.notifications.toasts.addSuccess).toHaveBeenCalledWith("Delete [test_data_stream] successfully");
    });
  }, 30000);

  it("renders flush component", async () => {
    browserServicesMock.commonService.apiCaller = buildMockApiCallerForFlush();
    const { getByTestId, getByText } = render(
      <CoreServicesContext.Provider value={coreServicesMock}>
        <ServicesContext.Provider value={browserServicesMock}>
          <Router>
            <Switch>
              <Route
                path={ROUTES.DATA_STREAMS}
                render={(routeProps) => (
                  <CoreServicesContext.Provider value={coreServicesMock}>
                    <ServicesContext.Provider value={browserServicesMock}>
                      <DataStreamsActions
                        selectedItems={selectedDataStreams}
                        history={{
                          ...routeProps.history,
                          push: (...args) => {
                            routeProps.history.push(...args);
                            historyPushMock(...args);
                          },
                        }}
                      />
                    </ServicesContext.Provider>
                  </CoreServicesContext.Provider>
                )}
              />
              <Redirect from="/" to={ROUTES.DATA_STREAMS} />
            </Switch>
          </Router>
        </ServicesContext.Provider>
      </CoreServicesContext.Provider>
    );
    userEvent.click(document.querySelector('[data-test-subj="moreAction"] button') as Element);
    userEvent.click(getByTestId("Flush Action"));
    await waitFor(() => {
      expect(getByText("The following data streams will be flushed:")).toBeInTheDocument();
    });
    expect(document.body.children).toMatchSnapshot();
  });
});
