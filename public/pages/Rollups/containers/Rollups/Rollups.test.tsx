/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { render, waitFor } from "@testing-library/react";
import userEventModule from "@testing-library/user-event";
import { MemoryRouter as Router } from "react-router";
import { Redirect, Route, RouteComponentProps, Switch } from "react-router-dom";
import { browserServicesMock, coreServicesMock } from "../../../../../test/mocks";
import { ServicesConsumer, ServicesContext } from "../../../../services";
import { BrowserServices } from "../../../../models/interfaces";
import { ModalProvider, ModalRoot } from "../../../../components/Modal";
import { BREADCRUMBS, ROUTES } from "../../../../utils/constants";
import Rollups from "./Rollups";
import { TEXT } from "../../components/RollupEmptyPrompt/RollupEmptyPrompt";
import { testRollup } from "../../../../../test/constants";
import { CoreServicesContext } from "../../../../components/core_services";
import { getApplication, getNavigationUI, getUISettings } from "../../../../services/Services";

jest.mock("../../../../services/Services", () => ({
  ...jest.requireActual("../../../../services/Services"),
  getUISettings: jest.fn(),
  getApplication: jest.fn(),
  getNavigationUI: jest.fn(),
}));

function renderRollupsWithRouter() {
  return {
    ...render(
      <Router>
        <CoreServicesContext.Provider value={coreServicesMock}>
          <ServicesContext.Provider value={browserServicesMock}>
            <ServicesConsumer>
              {(services: BrowserServices | null) =>
                services && (
                  <ModalProvider>
                    <ModalRoot services={services} />
                    <Switch>
                      <Route
                        path={ROUTES.ROLLUPS}
                        render={(props: RouteComponentProps) => (
                          <div style={{ padding: "25px 25px" }}>
                            <Rollups {...props} rollupService={services.rollupService} />
                          </div>
                        )}
                      />
                      <Route path={ROUTES.CREATE_ROLLUP} render={(props) => <div>Testing create rollup</div>} />
                      <Route path={ROUTES.EDIT_ROLLUP} render={(props) => <div>Testing edit rollup: {props.location.search}</div>} />
                      <Route path={ROUTES.ROLLUP_DETAILS} render={(props) => <div>Testing rollup details: {props.location.search}</div>} />
                      <Redirect from="/" to={ROUTES.ROLLUPS} />
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

describe("<Rollups /> spec", () => {
  const userEvent = userEventModule.setup();
  beforeEach(() => {
    (getUISettings as jest.Mock).mockReturnValue({
      get: jest.fn().mockReturnValue(false), // or false, depending on your test case
    });
    (getApplication as jest.Mock).mockReturnValue({});

    (getNavigationUI as jest.Mock).mockReturnValue({});
  });

  it("renders the component", async () => {
    browserServicesMock.rollupService.getRollups = jest.fn().mockResolvedValue({
      ok: true,
      response: { rollups: [], totalRollups: 0 },
    });
    const { container } = renderRollupsWithRouter();

    expect(container.firstChild).toMatchSnapshot();
  });

  it("shows LOADING on mount", async () => {
    browserServicesMock.rollupService.getRollups = jest.fn().mockResolvedValue({
      ok: true,
      response: { rollups: [], totalRollups: 0 },
    });
    const { getByText } = renderRollupsWithRouter();

    getByText(TEXT.LOADING);
  });

  it("sets breadcrumbs when mounting", async () => {
    browserServicesMock.rollupService.getRollups = jest.fn().mockResolvedValue({
      ok: true,
      response: { rollups: [], totalRollups: 0 },
    });
    renderRollupsWithRouter();

    expect(coreServicesMock.chrome.setBreadcrumbs).toHaveBeenCalledTimes(1);
    expect(coreServicesMock.chrome.setBreadcrumbs).toHaveBeenCalledWith([BREADCRUMBS.INDEX_MANAGEMENT, BREADCRUMBS.ROLLUPS]);
  });

  it("loads rollups", async () => {
    const rollups = [testRollup];
    browserServicesMock.rollupService.getRollups = jest.fn().mockResolvedValue({
      ok: true,
      response: { rollups, totalRollups: 1 },
    });
    const { getByText } = renderRollupsWithRouter();
    await waitFor(() => {});

    await waitFor(() => getByText(testRollup._id));
  });

  it("adds error toaster when get rollups has error", async () => {
    browserServicesMock.rollupService.getRollups = jest.fn().mockResolvedValue({ ok: false, error: "some error" });
    renderRollupsWithRouter();

    await waitFor(() => {});

    expect(coreServicesMock.notifications.toasts.addDanger).toHaveBeenCalledTimes(1);
    expect(coreServicesMock.notifications.toasts.addDanger).toHaveBeenCalledWith("some error");
  });

  it("adds error toaster when get rollups throws error", async () => {
    browserServicesMock.rollupService.getRollups = jest.fn().mockRejectedValue(new Error("rejected error"));
    renderRollupsWithRouter();

    await waitFor(() => {});

    expect(coreServicesMock.notifications.toasts.addDanger).toHaveBeenCalledTimes(1);
    expect(coreServicesMock.notifications.toasts.addDanger).toHaveBeenCalledWith("rejected error");
  });

  it("can route to create rollup", async () => {
    browserServicesMock.rollupService.getRollups = jest.fn().mockResolvedValue({
      ok: true,
      response: { rollups: [], totalrollups: 0 },
    });
    const { getByText, getByTestId } = renderRollupsWithRouter();

    await waitFor(() => {});

    await userEvent.click(getByTestId("createRollupButton"));

    await waitFor(() => getByText("Testing create rollup"));
  });

  it("can route to edit rollup", async () => {
    const rollups = [testRollup];
    browserServicesMock.rollupService.getRollups = jest.fn().mockResolvedValue({
      ok: true,
      response: { rollups, totalrollups: 1 },
    });
    const { getByText, getByTestId } = renderRollupsWithRouter();

    await waitFor(() => getByText(testRollup._id));

    await userEvent.click(getByTestId(`checkboxSelectRow-${testRollup._id}`));

    await userEvent.click(getByTestId("actionButton"));

    await waitFor(() => getByTestId("editButton"));

    await userEvent.click(getByTestId("editButton"));

    await waitFor(() => getByText(`Testing edit rollup: ?id=${testRollup._id}`));
  });

  it("can view details of a rollup job", async () => {
    const rollups = [testRollup];
    browserServicesMock.rollupService.getRollups = jest.fn().mockResolvedValue({
      ok: true,
      response: { rollups, totalRollups: 1 },
    });
    const { getByText } = renderRollupsWithRouter();

    await waitFor(() => {});
    await waitFor(() => getByText(testRollup._id));

    await userEvent.click(getByText(testRollup._id));

    await waitFor(() => getByText(`Testing rollup details: ?id=${testRollup._id}`));
  });

  it("can enable a rollup job", async () => {
    const rollups = [testRollup];
    browserServicesMock.rollupService.getRollups = jest.fn().mockResolvedValue({
      ok: true,
      response: { rollups, totalRollups: 1 },
    });
    browserServicesMock.rollupService.startRollup = jest.fn().mockResolvedValue({
      ok: true,
      response: true,
    });
    const { getByText, getByTestId } = renderRollupsWithRouter();

    await waitFor(() => getByText(testRollup._id));

    expect(getByTestId("enableButton")).toBeDisabled();

    await userEvent.click(getByTestId(`checkboxSelectRow-${testRollup._id}`));

    expect(getByTestId("enableButton")).toBeEnabled();

    await userEvent.click(getByTestId("enableButton"));

    await waitFor(
      () => {
        expect(browserServicesMock.rollupService.startRollup).toHaveBeenCalledTimes(1);
        expect(coreServicesMock.notifications.toasts.addSuccess).toHaveBeenCalledTimes(1);
        expect(coreServicesMock.notifications.toasts.addSuccess).toHaveBeenCalledWith(`${testRollup._id} is enabled`);
      },
      {
        timeout: 3000,
      }
    );
  });

  it("can disable a rollup job", async () => {
    const rollups = [testRollup];
    browserServicesMock.rollupService.getRollups = jest.fn().mockResolvedValue({
      ok: true,
      response: { rollups, totalRollups: 1 },
    });
    browserServicesMock.rollupService.stopRollup = jest.fn().mockResolvedValue({
      ok: true,
      response: true,
    });

    const { getByText, getByTestId } = renderRollupsWithRouter();

    await waitFor(() => getByText(testRollup._id));

    expect(getByTestId("disableButton")).toBeDisabled();

    await userEvent.click(getByTestId(`checkboxSelectRow-${testRollup._id}`));

    expect(getByTestId("disableButton")).toBeEnabled();

    await userEvent.click(getByTestId("disableButton"));

    await waitFor(() => {});

    expect(browserServicesMock.rollupService.stopRollup).toHaveBeenCalledTimes(1);
    expect(coreServicesMock.notifications.toasts.addSuccess).toHaveBeenCalledTimes(1);
    expect(coreServicesMock.notifications.toasts.addSuccess).toHaveBeenCalledWith(`${testRollup._id} is disabled`);
  });

  it("calls getRollups when clicking refresh button", async () => {
    browserServicesMock.rollupService.getRollups = jest.fn();

    const { getByTestId } = renderRollupsWithRouter();

    await userEvent.click(getByTestId("refreshButton"));

    await waitFor(
      () => {
        expect(browserServicesMock.rollupService.getRollups).toHaveBeenCalledTimes(1);
      },
      { timeout: 3000 }
    );
  });
});
