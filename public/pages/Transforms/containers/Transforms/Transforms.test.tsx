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
import { render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter as Router } from "react-router";
import { Redirect, Route, RouteComponentProps, Switch } from "react-router-dom";
import { browserServicesMock, coreServicesMock } from "../../../../../test/mocks";
import { ServicesConsumer, ServicesContext } from "../../../../services";
import { BrowserServices } from "../../../../models/interfaces";
import { ModalProvider, ModalRoot } from "../../../../components/Modal";
import { BREADCRUMBS, ROUTES } from "../../../../utils/constants";
import Transforms from "./Transforms";
import { TEXT } from "../../components/TransformEmptyPrompt/TransformEmptyPrompt";
import { testTransform } from "../../../../../test/constants";
import { CoreServicesContext } from "../../../../components/core_services";

function renderTransformsWithRouter() {
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
                        path={ROUTES.TRANSFORMS}
                        render={(props: RouteComponentProps) => (
                          <div style={{ padding: "25px 25px" }}>
                            <Transforms {...props} transformService={services.transformService} />
                          </div>
                        )}
                      />
                      <Route path={ROUTES.CREATE_TRANSFORM} render={(props) => <div>Testing create transform</div>} />
                      <Route path={ROUTES.EDIT_TRANSFORM} render={(props) => <div>Testing edit transform: {props.location.search}</div>} />
                      <Route path={ROUTES.TRANSFORM_DETAILS} render={(props) => <div>Testing transform details: {props.location.search}</div>} />
                      <Redirect from="/" to={ROUTES.TRANSFORMS} />
                    </Switch>
                  </ ModalProvider>
                )
              }
            </ServicesConsumer>
          </ServicesContext.Provider>
        </CoreServicesContext.Provider>
      </Router>
    ),
  };
}

describe("<Transforms /> spec", () => {
  it("renders the component", async () => {
    browserServicesMock.transformService.getTransforms = jest.fn().mockResolvedValue({
      ok: true,
      response: { transforms: [], totalTransforms: 0 },
    });
    const { container } = renderTransformsWithRouter();

    expect(container.firstChild).toMatchSnapshot();
  });

  it("shows LOADING on mount", async () => {
    browserServicesMock.transformService.getTransforms = jest.fn().mockResolvedValue({
      ok: true,
      response: { transforms: [], totalTransforms: 0 },
    });
    const { getByText } = renderTransformsWithRouter();

    getByText(TEXT.LOADING);
  });

  it("sets breadcrumbs when mounting", async () => {
    browserServicesMock.transformService.getTransforms = jest.fn().mockResolvedValue({
      ok: true,
      response: { transforms: [], totalTransforms: 0 },
    });
    renderTransformsWithRouter();

    expect(coreServicesMock.chrome.setBreadcrumbs).toHaveBeenCalledTimes(1);
    expect(coreServicesMock.chrome.setBreadcrumbs).toHaveBeenCalledWith([BREADCRUMBS.INDEX_MANAGEMENT, BREADCRUMBS.TRANSFORMS]);
  });

  it("loads transforms", async() => {
    const transforms = [testTransform];
    browserServicesMock.transformService.getTransforms = jest.fn().mockResolvedValue({
      ok: true,
      response: { transforms, totalTransforms: 1 },
    });
    const { getByText } = renderTransformsWithRouter();
    await waitFor(() => {});

    await waitFor(() => getByText(testTransform._id));
  });

  it("adds error toaster when get transforms has error", async() => {
    browserServicesMock.transformService.getTransforms = jest.fn().mockResolvedValue({
      ok: false,
      error: "some error"
    });
    renderTransformsWithRouter();

    await waitFor(() => {});

    expect(coreServicesMock.notifications.toasts.addDanger).toHaveBeenCalledTimes(1);
    expect(coreServicesMock.notifications.toasts.addDanger).toHaveBeenCalledWith("some error");
  });

  it("adds error toaster when get transforms throws error", async () => {
    browserServicesMock.transformService.getTransforms = jest.fn().mockRejectedValue(new Error("rejected error"));
    renderTransformsWithRouter();

    await waitFor(() => {});

    expect(coreServicesMock.notifications.toasts.addDanger).toHaveBeenCalledTimes(1);
    expect(coreServicesMock.notifications.toasts.addDanger).toHaveBeenCalledWith("rejected error");
  });

  it("can route to create transform", async () => {
    browserServicesMock.transformService.getTransforms = jest.fn().mockResolvedValue({
      ok: true,
      response: { transforms: [], totalTransforms: 0 }
    });
    const { getByText, getByTestId } = renderTransformsWithRouter();

    await waitFor(() => {});

    userEvent.click(getByTestId("createTransformButton"));

    await waitFor(() => getByText("Testing create transform"));
  });

  it("can route to edit transform", async () => {
    const transforms = [testTransform];
    browserServicesMock.transformService.getTransforms = jest.fn().mockResolvedValue({
      ok: true,
      response: { transforms, totalTransforms:1 },
    });
    const { getByText, getByTestId } = renderTransformsWithRouter();

    await waitFor(() => getByText(testTransform._id));

    userEvent.click(getByTestId(`checkboxSelectRow-${testTransform._id}`));

    userEvent.click(getByTestId("actionButton"));

    await waitFor(() => getByTestId("editButton"));

    userEvent.click(getByTestId("editButton"));

    await waitFor(() => getByText(`Testing edit transform: ?id=${testTransform._id}`));
  });

  it("can view details of a transform job", async () => {
    const transforms = [testTransform];
    browserServicesMock.transformService.getTransforms = jest.fn().mockResolvedValue({
      ok: true,
      response: { transforms, totalTransforms: 1 },
    });
    const { getByText } = renderTransformsWithRouter();

    await waitFor(() => {});
    await waitFor(() => getByText(testTransform._id));

    userEvent.click(getByText(testTransform._id));

    await waitFor(() => getByText(`Testing transform details: ?id=${testTransform._id}`));
  });

  it("can enable a transform job", async () => {
    const transforms = [testTransform];
    browserServicesMock.transformService.getTransforms = jest.fn().mockResolvedValue({
      ok: true,
      response: { transforms, totalTransforms: 1 },
    });
    browserServicesMock.transformService.startTransform = jest.fn().mockResolvedValue({
      ok: true,
      response: true,
    });
    const { getByText, getByTestId } = renderTransformsWithRouter();

    await waitFor(() => getByText(testTransform._id));

    expect(getByTestId("enableButton")).toBeDisabled();

    userEvent.click(getByTestId(`checkboxSelectRow-${testTransform._id}`));

    expect(getByTestId("enableButton")).toBeEnabled();

    userEvent.click(getByTestId("enableButton"));

    await waitFor(() => {});

    expect(browserServicesMock.transformService.startTransform).toHaveBeenCalledTimes(1);
    expect(coreServicesMock.notifications.toasts.addSuccess).toHaveBeenCalledTimes(1);
    expect(coreServicesMock.notifications.toasts.addSuccess).toHaveBeenCalledWith(`\"${testTransform._id}\" is enabled`);
  });

  it("can disable a transform job", async () => {
    const transforms = [testTransform];
    browserServicesMock.transformService.getTransforms = jest.fn().mockResolvedValue({
      ok: true,
      response: { transforms, totalTransforms: 1 },
    });
    browserServicesMock.transformService.stopTransform = jest.fn().mockResolvedValue({
      ok: true,
      response: true,
    });

    const { getByText, getByTestId } = renderTransformsWithRouter();

    await waitFor(() => getByText(testTransform._id));

    expect(getByTestId("disableButton")).toBeDisabled();

    userEvent.click(getByTestId(`checkboxSelectRow-${testTransform._id}`));

    expect(getByTestId("disableButton")).toBeEnabled();

    userEvent.click(getByTestId("disableButton"));

    await waitFor(() => {});

    expect(browserServicesMock.transformService.stopTransform).toHaveBeenCalledTimes(1);
    expect(coreServicesMock.notifications.toasts.addSuccess).toHaveBeenCalledTimes(1);
    expect(coreServicesMock.notifications.toasts.addSuccess).toHaveBeenCalledWith(`\"${testTransform._id}\" is disabled`);
  });
})
