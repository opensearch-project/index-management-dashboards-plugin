/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { render, waitFor } from "@testing-library/react";
import userEventModule from "@testing-library/user-event";
import { browserServicesMock, coreServicesMock } from "../../../../../test/mocks";
import ComposableTemplatesActions, { ComposableTemplatesActionsProps } from "./index";
import { ServicesContext } from "../../../../services";
import { CoreServicesContext } from "../../../../components/core_services";
import { Route, HashRouter as Router, Switch, Redirect } from "react-router-dom";
import { ROUTES } from "../../../../utils/constants";

function renderWithRouter(props: Omit<ComposableTemplatesActionsProps, "history">, Component = ComposableTemplatesActions) {
  return {
    ...render(
      <CoreServicesContext.Provider value={coreServicesMock}>
        <ServicesContext.Provider value={browserServicesMock}>
          <Router>
            <Switch>
              <Route path={ROUTES.COMPOSABLE_TEMPLATES} render={(routeProps) => <Component {...props} />} />
              <Redirect from="/" to={ROUTES.COMPOSABLE_TEMPLATES} />
            </Switch>
          </Router>
        </ServicesContext.Provider>
      </CoreServicesContext.Provider>
    ),
  };
}

describe("<ComposableTemplatesActions /> spec", () => {
  const userEvent = userEventModule.setup();

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
    const { container, getByTestId, findAllByText } = renderWithRouter({
      selectedItems: ["test_template"],
      onDelete,
    });

    await waitFor(() => {
      expect(container.firstChild).toMatchSnapshot();
    });

    await userEvent.click(getByTestId("deleteAction"));
    await findAllByText("Delete");
    await userEvent.click(getByTestId("deleteConfirmButton"));

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

    await userEvent.click(getByTestId("deleteConfirmButton"));

    await waitFor(() => {
      expect(browserServicesMock.commonService.apiCaller).toHaveBeenCalledTimes(3);
      expect(coreServicesMock.notifications.toasts.addSuccess).toHaveBeenCalledTimes(1);
      expect(coreServicesMock.notifications.toasts.addSuccess).toHaveBeenCalledWith("Delete [test_template] successfully");
      expect(onDelete).toHaveBeenCalledTimes(1);
    });
  }, 30000);

  it("renders delete action by using renderDeleteButton", async () => {
    browserServicesMock.commonService.apiCaller = jest.fn(
      async (payload): Promise<any> => {
        if (payload.data?.path?.startsWith("/_component_template/")) {
          return {
            ok: true,
            response: {},
          };
        } else if (payload.data?.path?.startsWith("/_index_template")) {
          return {
            ok: true,
            response: {
              index_templates: [
                {
                  name: "test",
                  index_template: {
                    composed_of: ["test_component_template"],
                  },
                },
              ],
            },
          };
        }
        return { ok: true, response: {} };
      }
    );
    const { container, findByText, getByText, findByTestId, getByTestId } = renderWithRouter({
      selectedItems: ["test_component_template"],
      onDelete: () => {},
      renderDeleteButton: ({ triggerDelete }) => <button onClick={triggerDelete}>test button</button>,
    });
    await findByText("test button");
    await userEvent.click(getByText("test button"));
    await findByTestId("UnlinkConfirmCheckBox");
    expect(container).toMatchSnapshot();
    await waitFor(() => {
      expect(getByTestId("UnlinkConfirmCheckBox")).not.toBeChecked();
    });
    await userEvent.click(getByTestId("UnlinkConfirmCheckBox"));
    await waitFor(() => {
      expect(getByTestId("deleteConfirmUnlinkButton")).toBeEnabled();
    });
    await userEvent.click(getByTestId("deleteConfirmUnlinkButton"));
    await waitFor(
      () => {
        expect(browserServicesMock.commonService.apiCaller).toBeCalledTimes(4);
        expect(coreServicesMock.notifications.toasts.addSuccess).toBeCalledWith(`Delete [test_component_template] successfully`);
      },
      {
        timeout: 3000,
      }
    );
  });
});
