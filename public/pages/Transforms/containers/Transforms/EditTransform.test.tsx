/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
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
import { testTransform2 } from "../../../../../test/constants";
import { CoreServicesContext } from "../../../../components/core_services";
import { getApplication, getNavigationUI, getUISettings } from "../../../../services/Services";

jest.mock("../../../../services/Services", () => ({
  ...jest.requireActual("../../../../services/Services"),
  getUISettings: jest.fn(),
  getApplication: jest.fn(),
  getNavigationUI: jest.fn(),
}));

beforeEach(() => {
  (getUISettings as jest.Mock).mockReturnValue({
    get: jest.fn().mockReturnValue(false), // or false, depending on your test case
  });
  (getApplication as jest.Mock).mockReturnValue({});

  (getNavigationUI as jest.Mock).mockReturnValue({});
});

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
      response: testTransform2,
    });
    const { container } = renderEditTransformWithRouter([`${ROUTES.EDIT_TRANSFORM}?id=${testTransform2._id}`]);

    expect(container.firstChild).toMatchSnapshot();
  });

  it("sets breadcrumbs when mounting", async () => {
    browserServicesMock.transformService.getTransform = jest.fn().mockResolvedValue({
      ok: true,
      response: testTransform2,
    });
    renderEditTransformWithRouter([`${ROUTES.EDIT_TRANSFORM}?id=${testTransform2._id}`]);

    expect(coreServicesMock.chrome.setBreadcrumbs).toHaveBeenCalledTimes(1);
    expect(coreServicesMock.chrome.setBreadcrumbs).toHaveBeenCalledWith([
      BREADCRUMBS.INDEX_MANAGEMENT,
      BREADCRUMBS.TRANSFORMS,
      BREADCRUMBS.EDIT_TRANSFORM,
      { text: testTransform2._id },
    ]);
  });

  it("adds error toaster when get transform has error", async () => {
    browserServicesMock.transformService.getTransform = jest.fn().mockResolvedValue({ ok: false, error: "some error" });
    const { getByText } = renderEditTransformWithRouter([`${ROUTES.EDIT_TRANSFORM}?id=${testTransform2._id}`]);

    await waitFor(() => {});

    expect(coreServicesMock.notifications.toasts.addDanger).toHaveBeenCalledTimes(1);
    expect(coreServicesMock.notifications.toasts.addDanger).toHaveBeenCalledWith("Could not load transform job test1: some error");

    await waitFor(() => getByText("Testing transform edit page"));
  });

  it("adds error toaster when get transform throws error", async () => {
    browserServicesMock.transformService.getTransform = jest.fn().mockRejectedValue(new Error("rejected error"));
    const { getByText } = renderEditTransformWithRouter([`${ROUTES.EDIT_TRANSFORM}?id=${testTransform2._id}`]);

    await waitFor(() => {});

    expect(coreServicesMock.notifications.toasts.addDanger).toHaveBeenCalledTimes(1);
    expect(coreServicesMock.notifications.toasts.addDanger).toHaveBeenCalledWith("rejected error");
    await waitFor(() => getByText("Testing transform edit page"));
  });

  it("can edit description", async () => {
    browserServicesMock.transformService.getTransform = jest.fn().mockResolvedValue({
      ok: true,
      response: testTransform2,
    });

    browserServicesMock.transformService.putTransform = jest.fn().mockResolvedValue({
      ok: true,
      response: testTransform2,
    });
    const { getByTestId } = renderEditTransformWithRouter([`${ROUTES.EDIT_TRANSFORM}?id=${testTransform2._id}`]);

    await waitFor(() => {});

    fireEvent.focus(getByTestId("description"));
    userEvent.type(getByTestId("description"), "{selectall}{backspace}some description");
    fireEvent.blur(getByTestId("description"));

    userEvent.click(getByTestId("editTransformSaveButton"));

    expect(browserServicesMock.transformService.putTransform).toHaveBeenCalledTimes(1);
    expect(browserServicesMock.transformService.putTransform).toHaveBeenCalledWith(
      expect.objectContaining({
        transform: expect.objectContaining({
          description: "some description",
        }),
      }),
      "test1",
      7,
      1
    );
  });
});
