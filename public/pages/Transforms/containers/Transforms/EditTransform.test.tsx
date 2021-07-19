/*
 * SPDX-License-Identifier: Apache-2.0
 *
 * The OpenSearch Contributors require contributions made to
 * this file be licensed under the Apache-2.0 license or a
 * compatible open source license.
 *
 * Modifications Copyright OpenSearch Contributors. See
 * GitHub history for details.
 */

import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter as Router } from "react-router";
import { Redirect, Route, RouteComponentProps, Switch } from "react-router-dom";
import EditTransform from "./EditTransform";
import { browserServicesMock, coreServicesMock } from "../../../../../test/mocks";
import { ServicesConsumer, ServicesContext } from "../../../../services";
import { ModalProvider, ModalRoot } from "../../../../components/Modal";
import { BrowserServices } from "../../../../models/interfaces";
import { BREADCRUMBS, ROUTES } from "../../../../utils/constants";
import { testTransform } from "../../../../../test/constants";
import { CoreServicesContext } from "../../../../components/core_services";

function renderEditTransformWithRouter(initialEntries = ["/"]) {
  return {
    ...render(
      <Router initialEntries={initialEntries}>
        <CoreServicesContext.Provider value={coreServicesMock}>
          <ServicesContext.Provider value={browserServicesMock}>
            <ServicesConsumer>
              {(services: BrowserServices | null) =>
                services && (
                  <ModalProvider>
                    <ModalRoot services={services} />
                    <Switch>
                      <Route
                        path={ROUTES.EDIT_TRANSFORM}
                        render={(props: RouteComponentProps) => (
                          <EditTransform {...props} transformService={services.transformService} core={coreServicesMock} />
                        )}
                      />
                      <Route path={ROUTES.TRANSFORMS} render={(props) => <div>Testing transform edit page</div>} />
                      <Redirect from="/" to={ROUTES.EDIT_TRANSFORM} />
                    </Switch>
                  </ModalProvider>
                )
              }
            </ServicesConsumer>
          </ServicesContext.Provider>
        </CoreServicesContext.Provider>
      </Router>
    ),
  };
}

describe("<EditTransform /> spec", () => {
  it("renders the component", async () => {
    browserServicesMock.transformService.getTransform = jest.fn().mockResolvedValue({
      ok: true,
      response: testTransform,
    });
    const { container } = renderEditTransformWithRouter([`${ROUTES.EDIT_TRANSFORM}?id=${testTransform._id}`]);

    expect(container.firstChild).toMatchSnapshot();
  });

  it("sets breadcrumbs when mounting", async () => {
    browserServicesMock.transformService.getTransform = jest.fn().mockResolvedValue({
      ok: true,
      response: testTransform,
    });
    renderEditTransformWithRouter([`${ROUTES.EDIT_TRANSFORM}?id=${testTransform._id}`]);

    expect(coreServicesMock.chrome.setBreadcrumbs).toHaveBeenCalledTimes(1);
    expect(coreServicesMock.chrome.setBreadcrumbs).toHaveBeenCalledWith([
      BREADCRUMBS.INDEX_MANAGEMENT,
      BREADCRUMBS.TRANSFORMS,
      BREADCRUMBS.EDIT_TRANSFORM,
      { text: testTransform._id },
    ]);
  });

  it("adds error toaster when get transform has error", async () => {
    browserServicesMock.transformService.getTransform = jest.fn().mockResolvedValue({ ok: false, error: "some error" });
    const { getByText } = renderEditTransformWithRouter([`${ROUTES.EDIT_TRANSFORM}?id=${testTransform._id}`]);

    await waitFor(() => {});

    expect(coreServicesMock.notifications.toasts.addDanger).toHaveBeenCalledTimes(1);
    expect(coreServicesMock.notifications.toasts.addDanger).toHaveBeenCalledWith("Could not load transform job test1: some error");

    await waitFor(() => getByText("Testing transform edit page"));
  });

  it("adds error toaster when get transform throws error", async () => {
    browserServicesMock.transformService.getTransform = jest.fn().mockRejectedValue(new Error("rejected error"));
    const { getByText } = renderEditTransformWithRouter([`${ROUTES.EDIT_TRANSFORM}?id=${testTransform._id}`]);

    await waitFor(() => {});

    expect(coreServicesMock.notifications.toasts.addDanger).toHaveBeenCalledTimes(1);
    expect(coreServicesMock.notifications.toasts.addDanger).toHaveBeenCalledWith("rejected error");
    await waitFor(() => getByText("Testing transform edit page"));
  });

  it("can edit description", async () => {
    browserServicesMock.transformService.getTransform = jest.fn().mockResolvedValue({
      ok: true,
      response: testTransform,
    });

    browserServicesMock.transformService.putTransform = jest.fn().mockResolvedValue({
      ok: true,
      response: testTransform,
    });
    const { getByTestId } = renderEditTransformWithRouter([`${ROUTES.EDIT_TRANSFORM}?id=${testTransform._id}`]);

    await waitFor(() => {});

    fireEvent.focus(getByTestId("description"));
    await userEvent.type(getByTestId("description"), "some description");
    fireEvent.blur(getByTestId("description"));
  });
});
