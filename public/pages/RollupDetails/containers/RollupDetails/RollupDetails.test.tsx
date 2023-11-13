/*
 *   Copyright OpenSearch Contributors
 *
 *   Licensed under the Apache License, Version 2.0 (the "License").
 *   You may not use this file except in compliance with the License.
 *   A copy of the License is located at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   or in the "license" file accompanying this file. This file is distributed
 *   on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 *   express or implied. See the License for the specific language governing
 *   permissions and limitations under the License.
 */

/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter as Router } from "react-router-dom";
import { Redirect, Route, RouteComponentProps, Switch } from "react-router-dom";
import { browserServicesMock, coreServicesMock } from "../../../../../test/mocks";
import { BrowserServices } from "../../../../models/interfaces";
import { ModalProvider, ModalRoot } from "../../../../components/Modal";
import { BREADCRUMBS, ROUTES } from "../../../../utils/constants";
import RollupDetails from "./RollupDetails";
import { ServicesConsumer, ServicesContext } from "../../../../services";
import { testRollup, testRollup2 } from "../../../../../test/constants";
import { CoreServicesContext } from "../../../../components/core_services";

function renderRollupDetailsWithRouter(initialEntries = ["/"]) {
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
                        path={ROUTES.ROLLUP_DETAILS}
                        render={(props: RouteComponentProps) => <RollupDetails {...props} rollupService={services.rollupService} />}
                      />
                      <Route path={ROUTES.EDIT_ROLLUP} render={(props) => <div>Testing edit rollup: {props.location.search}</div>} />
                      <Route path={ROUTES.ROLLUPS} render={(props) => <div>Testing rollup landing page</div>} />
                      <Redirect from="/" to={ROUTES.ROLLUP_DETAILS} />
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

describe("<RollupDetails /> spec", () => {
  it("renders the component", async () => {
    browserServicesMock.rollupService.getRollup = jest.fn().mockResolvedValue({
      ok: true,
      response: testRollup,
    });
    const { container } = renderRollupDetailsWithRouter();

    expect(container.firstChild).toMatchSnapshot();
  });

  it("sets breadcrumbs when mounting", async () => {
    browserServicesMock.rollupService.getRollup = jest.fn().mockResolvedValue({
      ok: true,
      response: testRollup,
    });
    renderRollupDetailsWithRouter([`${ROUTES.ROLLUP_DETAILS}?id=${testRollup._id}`]);

    expect(coreServicesMock.chrome.setBreadcrumbs).toHaveBeenCalledTimes(2);
    expect(coreServicesMock.chrome.setBreadcrumbs).toHaveBeenCalledWith([
      BREADCRUMBS.INDEX_MANAGEMENT,
      BREADCRUMBS.ROLLUPS,
      { text: testRollup._id },
    ]);
  });

  it("can disable rollup job", async () => {
    browserServicesMock.rollupService.getRollup = jest.fn().mockResolvedValue({
      ok: true,
      response: testRollup,
    });

    browserServicesMock.rollupService.stopRollup = jest.fn().mockResolvedValue({
      ok: true,
      response: true,
    });
    const { getByTestId } = renderRollupDetailsWithRouter([`${ROUTES.ROLLUP_DETAILS}?id=${testRollup._id}`]);

    await waitFor(() => {});

    expect(getByTestId("disableButton")).toBeEnabled();

    expect(getByTestId("enableButton")).toBeDisabled();

    userEvent.click(getByTestId("disableButton"));

    await waitFor(() => {});

    expect(browserServicesMock.rollupService.stopRollup).toHaveBeenCalledTimes(1);
    expect(coreServicesMock.notifications.toasts.addSuccess).toHaveBeenCalledTimes(1);
  });

  it("shows toast when failed to disable rollup job", async () => {
    browserServicesMock.rollupService.getRollup = jest.fn().mockResolvedValue({
      ok: true,
      response: testRollup,
    });

    browserServicesMock.rollupService.stopRollup = jest.fn().mockResolvedValue({
      ok: false,
      response: "some error",
    });
    const { getByTestId } = renderRollupDetailsWithRouter([`${ROUTES.ROLLUP_DETAILS}?id=${testRollup._id}`]);

    await waitFor(() => {});

    expect(getByTestId("disableButton")).toBeEnabled();

    expect(getByTestId("enableButton")).toBeDisabled();

    userEvent.click(getByTestId("disableButton"));

    await waitFor(() => {});

    expect(browserServicesMock.rollupService.stopRollup).toHaveBeenCalledTimes(1);
    expect(coreServicesMock.notifications.toasts.addDanger).toHaveBeenCalledTimes(1);
  });

  it("can enable rollup job", async () => {
    browserServicesMock.rollupService.getRollup = jest.fn().mockResolvedValue({
      ok: true,
      response: testRollup2,
    });

    browserServicesMock.rollupService.startRollup = jest.fn().mockResolvedValue({
      ok: true,
      response: true,
    });

    const { getByTestId } = renderRollupDetailsWithRouter([`${ROUTES.ROLLUP_DETAILS}?id=${testRollup2._id}`]);

    await waitFor(() => {});

    expect(getByTestId("enableButton")).toBeEnabled();

    expect(getByTestId("disableButton")).toBeDisabled();

    userEvent.click(getByTestId("enableButton"));

    await waitFor(() => {});

    expect(browserServicesMock.rollupService.startRollup).toHaveBeenCalledTimes(1);
    expect(coreServicesMock.notifications.toasts.addSuccess).toHaveBeenCalledTimes(1);
  });

  it("can delete a rollup job", async () => {
    const rollups = [testRollup];
    browserServicesMock.rollupService.getRollups = jest
      .fn()
      .mockResolvedValueOnce({ ok: true, response: { rollups, totalRollups: 1 } })
      .mockResolvedValueOnce({ ok: true, response: { rollups: [], totalRollups: 0 } });
    browserServicesMock.rollupService.deleteRollup = jest.fn().mockResolvedValue({ ok: true, response: true });
    const { getByTestId } = renderRollupDetailsWithRouter([`${ROUTES.ROLLUP_DETAILS}?id=${testRollup._id}`]);

    await waitFor(() => {
      getByTestId("deleteButton");
    });

    userEvent.click(getByTestId("deleteButton"));

    await waitFor(() => getByTestId("deleteTextField"));

    expect(getByTestId("confirmModalConfirmButton")).toBeDisabled();

    await userEvent.type(getByTestId("deleteTextField"), "delete");

    expect(getByTestId("confirmModalConfirmButton")).toBeEnabled();

    userEvent.click(getByTestId("confirmModalConfirmButton"));

    await waitFor(() => {});

    expect(browserServicesMock.rollupService.deleteRollup).toHaveBeenCalledTimes(1);
    expect(coreServicesMock.notifications.toasts.addSuccess).toHaveBeenCalledTimes(1);
  }, 10000);

  it("can show a started rollup job", async () => {
    const startedJob = testRollup;
    startedJob.metadata.test1.rollup_metadata.status = "started";

    browserServicesMock.rollupService.getRollup = jest.fn().mockResolvedValue({
      ok: true,
      response: testRollup,
    });

    const { queryByText } = renderRollupDetailsWithRouter([`${ROUTES.ROLLUP_DETAILS}?id=${testRollup._id}`]);

    await waitFor(() => {});

    expect(queryByText("Started")).not.toBeNull();
  });

  it("can show a stopped rollup job", async () => {
    const stoppedJob = testRollup;
    stoppedJob.metadata.test1.rollup_metadata.status = "stopped";

    browserServicesMock.rollupService.getRollup = jest.fn().mockResolvedValue({
      ok: true,
      response: testRollup,
    });

    const { queryByText } = renderRollupDetailsWithRouter([`${ROUTES.ROLLUP_DETAILS}?id=${testRollup._id}`]);

    await waitFor(() => {});

    expect(queryByText("Stopped")).not.toBeNull();
  });
});
