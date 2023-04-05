/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { browserServicesMock, coreServicesMock } from "../../../../../test/mocks";
import ComposableTemplatesActions, { ComposableTemplatesActionsProps } from "./index";
import { ServicesContext } from "../../../../services";
import { CoreServicesContext } from "../../../../components/core_services";
import { Route, HashRouter as Router, Switch, Redirect } from "react-router-dom";
import { ROUTES } from "../../../../utils/constants";
const historyPushMock = jest.fn();

function renderWithRouter(props: Omit<ComposableTemplatesActionsProps, "history">) {
  return {
    ...render(
      <CoreServicesContext.Provider value={coreServicesMock}>
        <ServicesContext.Provider value={browserServicesMock}>
          <Router>
            <Switch>
              <Route
                path={ROUTES.COMPOSABLE_TEMPLATES}
                render={(routeProps) => (
                  <CoreServicesContext.Provider value={coreServicesMock}>
                    <ServicesContext.Provider value={browserServicesMock}>
                      <ComposableTemplatesActions
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
              <Redirect from="/" to={ROUTES.COMPOSABLE_TEMPLATES} />
            </Switch>
          </Router>
        </ServicesContext.Provider>
      </CoreServicesContext.Provider>
    ),
  };
}

describe("<ComposableTemplatesActions /> spec", () => {
  beforeEach(() => {
    browserServicesMock.commonService.apiCaller = jest.fn(
      async (): Promise<any> => {
        return {
          ok: true,
          response: {
            index_templates: [],
          },
        };
      }
    );
  });
  it("renders the component and all the actions should be disabled when no items selected", async () => {
    const { container, getByTestId } = renderWithRouter({
      selectedItems: [],
      onDelete: () => null,
    });

    await waitFor(() => {
      expect(container.firstChild).toMatchSnapshot();
    });

    await waitFor(() => {
      expect(getByTestId("deleteAction")).toBeDisabled();
    });
  });

  it("delete templates by calling commonService", async () => {
    const onDelete = jest.fn();
    let times = 0;
    browserServicesMock.commonService.apiCaller = jest.fn(
      async (payload): Promise<any> => {
        if (payload.data?.path?.startsWith("/_component_template/")) {
          if (times >= 1) {
            return {
              ok: true,
              response: {},
            };
          } else {
            times++;
            return {
              ok: false,
              error: "test error",
            };
          }
        }
        return { ok: true, response: {} };
      }
    );
    const { container, getByTestId, findByText } = renderWithRouter({
      selectedItems: ["test_template"],
      onDelete,
    });

    await waitFor(() => {
      expect(container.firstChild).toMatchSnapshot();
    });

    userEvent.click(getByTestId("deleteAction"));
    await findByText("Delete");
    userEvent.click(getByTestId("deleteConfirmButton"));

    await waitFor(() => {
      expect(browserServicesMock.commonService.apiCaller).toHaveBeenCalledTimes(2);
      expect(browserServicesMock.commonService.apiCaller).toHaveBeenCalledWith({
        endpoint: "transport.request",
        data: {
          path: `/_component_template/test_template`,
          method: "DELETE",
        },
      });
      expect(coreServicesMock.notifications.toasts.addDanger).toHaveBeenCalledTimes(1);
      expect(coreServicesMock.notifications.toasts.addDanger).toHaveBeenCalledWith("test error");
      expect(onDelete).toHaveBeenCalledTimes(0);
    });

    userEvent.click(getByTestId("deleteConfirmButton"));

    await waitFor(() => {
      expect(browserServicesMock.commonService.apiCaller).toHaveBeenCalledTimes(3);
      expect(coreServicesMock.notifications.toasts.addSuccess).toHaveBeenCalledTimes(1);
      expect(coreServicesMock.notifications.toasts.addSuccess).toHaveBeenCalledWith("Delete [test_template] successfully");
      expect(onDelete).toHaveBeenCalledTimes(1);
    });
  }, 30000);
});
