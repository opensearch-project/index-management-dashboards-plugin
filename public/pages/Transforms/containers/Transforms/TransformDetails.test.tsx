/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter as Router } from "react-router";
import { Redirect, Route, RouteComponentProps, Switch } from "react-router-dom";
import { browserServicesMock, coreServicesMock } from "../../../../../test/mocks";
import { BrowserServices } from "../../../../models/interfaces";
import { ModalProvider, ModalRoot } from "../../../../components/Modal";
import { BREADCRUMBS, ROUTES } from "../../../../utils/constants";
import TransformDetails from "./TransformDetails";
import { ServicesConsumer, ServicesContext } from "../../../../services";
import { testTransform2, testTransformDisabled } from "../../../../../test/constants";
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

function renderTransformDetailsWithRouter(initialEntries = ["/"]) {
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
                        path={ROUTES.TRANSFORM_DETAILS}
                        render={(props: RouteComponentProps) => (
                          <TransformDetails {...props} transformService={services.transformService} />
                        )}
                      />
                      <Route path={ROUTES.EDIT_TRANSFORM} render={(props) => <div>Testing edit transform: {props.location.search}</div>} />
                      <Route path={ROUTES.TRANSFORMS} render={(props) => <div>Testing transform landing page</div>} />
                      <Redirect from="/" to={ROUTES.TRANSFORM_DETAILS} />
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

describe("<TransformDetails /> spec", () => {
  it("renders the component", async () => {
    browserServicesMock.transformService.getTransform = jest.fn().mockResolvedValue({
      ok: true,
      response: testTransform2,
    });
    const { container } = renderTransformDetailsWithRouter();

    expect(container.firstChild).toMatchSnapshot();
  });

  it("sets breadcrumbs when mounting", async () => {
    browserServicesMock.transformService.getTransform = jest.fn().mockResolvedValue({
      ok: true,
      response: testTransform2,
    });
    renderTransformDetailsWithRouter([`${ROUTES.TRANSFORM_DETAILS}?id=${testTransform2._id}`]);

    expect(coreServicesMock.chrome.setBreadcrumbs).toHaveBeenCalledTimes(2);
    expect(coreServicesMock.chrome.setBreadcrumbs).toHaveBeenCalledWith([
      BREADCRUMBS.INDEX_MANAGEMENT,
      BREADCRUMBS.TRANSFORMS,
      { text: testTransform2._id },
    ]);
  });

  it("can disable transform job", async () => {
    browserServicesMock.transformService.getTransform = jest.fn().mockResolvedValue({
      ok: true,
      response: testTransform2,
    });

    browserServicesMock.transformService.stopTransform = jest.fn().mockResolvedValue({
      ok: true,
      response: true,
    });
    const { getByTestId } = renderTransformDetailsWithRouter([`${ROUTES.TRANSFORM_DETAILS}?id=${testTransform2._id}`]);

    await waitFor(() => {});

    userEvent.click(getByTestId("actionButton"));

    expect(getByTestId("disableButton")).toBeEnabled();

    expect(getByTestId("enableButton")).toBeDisabled();

    userEvent.click(getByTestId("disableButton"));

    await waitFor(() => {});

    expect(browserServicesMock.transformService.stopTransform).toHaveBeenCalledTimes(1);
    expect(coreServicesMock.notifications.toasts.addSuccess).toHaveBeenCalledTimes(1);
  });

  it("shows toast when failed to disable transform job", async () => {
    browserServicesMock.transformService.getTransform = jest.fn().mockResolvedValue({
      ok: true,
      response: testTransform2,
    });

    browserServicesMock.transformService.stopTransform = jest.fn().mockResolvedValue({
      ok: false,
      response: "some error",
    });
    const { getByTestId } = renderTransformDetailsWithRouter([`${ROUTES.TRANSFORM_DETAILS}?id=${testTransform2._id}`]);

    await waitFor(() => {});

    userEvent.click(getByTestId("actionButton"));

    expect(getByTestId("disableButton")).toBeEnabled();

    expect(getByTestId("enableButton")).toBeDisabled();

    userEvent.click(getByTestId("disableButton"));

    await waitFor(() => {});

    expect(browserServicesMock.transformService.stopTransform).toHaveBeenCalledTimes(1);
    expect(coreServicesMock.notifications.toasts.addDanger).toHaveBeenCalledTimes(1);
  });

  it("can enable transform job", async () => {
    browserServicesMock.transformService.getTransform = jest.fn().mockResolvedValue({
      ok: true,
      response: testTransformDisabled,
    });

    browserServicesMock.transformService.startTransform = jest.fn().mockResolvedValue({
      ok: true,
      response: true,
    });

    const { getByTestId } = renderTransformDetailsWithRouter([`${ROUTES.TRANSFORM_DETAILS}?id=${testTransformDisabled._id}`]);

    await waitFor(() => {});

    userEvent.click(getByTestId("actionButton"));

    expect(getByTestId("enableButton")).toBeEnabled();

    expect(getByTestId("disableButton")).toBeDisabled();

    userEvent.click(getByTestId("enableButton"));

    await waitFor(() => {});

    expect(browserServicesMock.transformService.startTransform).toHaveBeenCalledTimes(1);
    expect(coreServicesMock.notifications.toasts.addSuccess).toHaveBeenCalledTimes(1);
  });

  it("can delete a transform job", async () => {
    const transforms = [testTransform2];
    browserServicesMock.transformService.getTransform = jest
      .fn()
      .mockResolvedValueOnce({ ok: true, response: testTransform2 })
      .mockResolvedValueOnce({ ok: false, response: {} });
    browserServicesMock.transformService.deleteTransform = jest.fn().mockResolvedValue({ ok: true, response: true });
    const { getByTestId } = renderTransformDetailsWithRouter([`${ROUTES.TRANSFORM_DETAILS}?id=${testTransform2._id}`]);

    await waitFor(() => {});

    userEvent.click(getByTestId("actionButton"));

    userEvent.click(getByTestId("deleteButton"));

    await waitFor(() => {});

    await waitFor(() => getByTestId("deleteTextField"));

    expect(getByTestId("confirmModalConfirmButton")).toBeDisabled();

    await userEvent.type(getByTestId("deleteTextField"), "delete");

    expect(getByTestId("confirmModalConfirmButton")).toBeEnabled();

    userEvent.click(getByTestId("confirmModalConfirmButton"));

    await waitFor(() => {});

    expect(browserServicesMock.transformService.deleteTransform).toHaveBeenCalledTimes(1);
    expect(coreServicesMock.notifications.toasts.addSuccess).toHaveBeenCalledTimes(1);
  }, 30000);

  it("can show a started transform job", async () => {
    let startedJob = testTransform2;
    startedJob.metadata.test1.transform_metadata.status = "init";

    browserServicesMock.transformService.getTransform = jest.fn().mockResolvedValue({
      ok: true,
      response: startedJob,
    });

    const { queryByText, getByText } = renderTransformDetailsWithRouter([`${ROUTES.TRANSFORM_DETAILS}?id=${startedJob._id}`]);

    await waitFor(() => {});

    expect(queryByText("Initializing...")).not.toBeNull();
  });

  it("can show a stopped transform job", async () => {
    let stoppedJob = testTransform2;
    stoppedJob.metadata.test1.transform_metadata.status = "stopped";

    browserServicesMock.transformService.getTransform = jest.fn().mockResolvedValue({
      ok: true,
      response: stoppedJob,
    });

    const { queryByText } = renderTransformDetailsWithRouter([`${ROUTES.TRANSFORM_DETAILS}?id=${stoppedJob._id}`]);

    await waitFor(() => {});

    expect(queryByText("Stopped")).not.toBeNull();
  });
});
