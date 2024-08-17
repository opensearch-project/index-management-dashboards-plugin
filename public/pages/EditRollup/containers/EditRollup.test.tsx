/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter as Router } from "react-router";
import { Redirect, Route, RouteComponentProps, Switch } from "react-router-dom";
import EditRollup from "./EditRollup";
import { browserServicesMock, coreServicesMock } from "../../../../test/mocks";
import { ServicesConsumer, ServicesContext } from "../../../services";
import { ModalProvider, ModalRoot } from "../../../components/Modal";
import { BrowserServices } from "../../../models/interfaces";
import { BREADCRUMBS, ROUTES } from "../../../utils/constants";
import { testRollup } from "../../../../test/constants";
import { CoreServicesContext } from "../../../components/core_services";
import { getApplication, getNavigationUI, getUISettings } from "../../../services/Services";

jest.mock("../../../services/Services", () => ({
  ...jest.requireActual("../../../services/Services"),
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

function renderEditRollupWithRouter(initialEntries = ["/"]) {
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
                        path={ROUTES.EDIT_ROLLUP}
                        render={(props: RouteComponentProps) => (
                          <EditRollup {...props} rollupService={services.rollupService} core={coreServicesMock} />
                        )}
                      />
                      <Route path={ROUTES.ROLLUPS} render={(props) => <div>Testing rollup landing page</div>} />
                      <Redirect from="/" to={ROUTES.EDIT_ROLLUP} />
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

describe("<EditRollup /> spec", () => {
  it("renders the component", async () => {
    browserServicesMock.rollupService.getRollup = jest.fn().mockResolvedValue({
      ok: true,
      response: testRollup,
    });
    const { container } = renderEditRollupWithRouter([`${ROUTES.EDIT_ROLLUP}?id=${testRollup._id}`]);

    expect(container.firstChild).toMatchSnapshot();
  });

  it("sets breadcrumbs when mounting", async () => {
    browserServicesMock.rollupService.getRollup = jest.fn().mockResolvedValue({
      ok: true,
      response: testRollup,
    });
    renderEditRollupWithRouter([`${ROUTES.EDIT_ROLLUP}?id=${testRollup._id}`]);

    expect(coreServicesMock.chrome.setBreadcrumbs).toHaveBeenCalledTimes(1);
    expect(coreServicesMock.chrome.setBreadcrumbs).toHaveBeenCalledWith([
      BREADCRUMBS.INDEX_MANAGEMENT,
      BREADCRUMBS.ROLLUPS,
      BREADCRUMBS.EDIT_ROLLUP,
      { text: testRollup._id },
    ]);
  });

  it("adds error toaster when get rollup has error", async () => {
    browserServicesMock.rollupService.getRollup = jest.fn().mockResolvedValue({ ok: false, error: "some error" });
    const { getByText } = renderEditRollupWithRouter([`${ROUTES.EDIT_ROLLUP}?id=${testRollup._id}`]);

    await waitFor(() => {});

    expect(coreServicesMock.notifications.toasts.addDanger).toHaveBeenCalledTimes(1);
    expect(coreServicesMock.notifications.toasts.addDanger).toHaveBeenCalledWith("Could not load the rollup job: some error");

    await waitFor(() => getByText("Testing rollup landing page"));
  });

  it("adds error toaster when get rollup throws error", async () => {
    browserServicesMock.rollupService.getRollup = jest.fn().mockRejectedValue(new Error("rejected error"));
    const { getByText } = renderEditRollupWithRouter([`${ROUTES.EDIT_ROLLUP}?id=${testRollup._id}`]);

    await waitFor(() => {});

    expect(coreServicesMock.notifications.toasts.addDanger).toHaveBeenCalledTimes(1);
    expect(coreServicesMock.notifications.toasts.addDanger).toHaveBeenCalledWith("rejected error");
    await waitFor(() => getByText("Testing rollup landing page"));
  });

  it("can edit description", async () => {
    browserServicesMock.rollupService.getRollup = jest.fn().mockResolvedValue({
      ok: true,
      response: testRollup,
    });

    browserServicesMock.rollupService.putRollup = jest.fn().mockResolvedValue({
      ok: true,
      response: testRollup,
    });
    const { getByTestId } = renderEditRollupWithRouter([`${ROUTES.EDIT_ROLLUP}?id=${testRollup._id}`]);

    await waitFor(() => {});

    fireEvent.focus(getByTestId("description"));
    await userEvent.type(getByTestId("description"), "some description");
    fireEvent.blur(getByTestId("description"));

    //TODO: Verify changes are saved.
  });

  it("shows rollup job delay", async () => {
    let rollupJob = testRollup;
    rollupJob.rollup.delay = 90000;

    browserServicesMock.rollupService.getRollup = jest.fn().mockResolvedValue({
      ok: true,
      response: rollupJob,
    });

    const { queryByText } = renderEditRollupWithRouter([`${ROUTES.ROLLUP_DETAILS}?id=${testRollup._id}`]);

    await waitFor(() => {});

    await waitFor(() => queryByText("1.5"));
    await waitFor(() => queryByText("Minute(s)"));
  });
});
