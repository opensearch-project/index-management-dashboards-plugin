/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { MemoryRouter as Router, Redirect, Route, RouteComponentProps, Switch } from "react-router-dom";
import { render, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CoreStart } from "opensearch-dashboards/public";
import CreatePolicy from "./CreatePolicy";
import { ServicesConsumer, ServicesContext } from "../../../../services";
import { browserServicesMock, coreServicesMock } from "../../../../../test/mocks";
import { BrowserServices } from "../../../../models/interfaces";
import { ModalProvider, ModalRoot } from "../../../../components/Modal";
import { DEFAULT_POLICY } from "../../utils/constants";
import { ROUTES } from "../../../../utils/constants";
import { CoreServicesConsumer, CoreServicesContext } from "../../../../components/core_services";
import { getApplication, getNavigationUI, getUISettings } from "../../../../services/Services";

jest.mock("../../components/DefinePolicy", () => require("../../components/DefinePolicy/__mocks__/DefinePolicyMock"));

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

function renderCreatePolicyWithRouter(initialEntries = ["/"]) {
  return {
    ...render(
      <Router initialEntries={initialEntries}>
        <CoreServicesContext.Provider value={coreServicesMock}>
          <ServicesContext.Provider value={browserServicesMock}>
            <ServicesConsumer>
              {(services: BrowserServices | null) =>
                services && (
                  <CoreServicesConsumer>
                    {(core: CoreStart | null) =>
                      core && (
                        <ModalProvider>
                          <ModalRoot services={services} />
                          <Switch>
                            <Route
                              path={ROUTES.CREATE_POLICY}
                              render={(props: RouteComponentProps) => (
                                <CreatePolicy {...props} isEdit={false} policyService={services.policyService} />
                              )}
                            />
                            <Route
                              path={ROUTES.EDIT_POLICY}
                              render={(props: RouteComponentProps) => (
                                <CreatePolicy {...props} isEdit={true} policyService={services.policyService} />
                              )}
                            />
                            <Route path={ROUTES.INDEX_POLICIES} render={(props: RouteComponentProps) => <div>Testing Policies</div>} />
                            <Redirect from="/" to={ROUTES.CREATE_POLICY} />
                          </Switch>
                        </ModalProvider>
                      )
                    }
                  </CoreServicesConsumer>
                )
              }
            </ServicesConsumer>
          </ServicesContext.Provider>
        </CoreServicesContext.Provider>
      </Router>
    ),
  };
}

describe("<CreatePolicy /> spec", () => {
  it("renders the create component", () => {
    const { container } = renderCreatePolicyWithRouter();

    expect(container.firstChild).toMatchSnapshot();
  });

  it("renders the edit component", async () => {
    browserServicesMock.policyService.getPolicy = jest
      .fn()
      .mockResolvedValue({ ok: true, response: { seqNo: 1, primaryTerm: 5, id: "some_policy", policy: JSON.parse(DEFAULT_POLICY) } });
    const { container } = renderCreatePolicyWithRouter([`${ROUTES.EDIT_POLICY}?id=some_policy`]);

    await waitFor(() => {});

    expect(container.firstChild).toMatchSnapshot();
  });

  it("routes back to policies if given bad id", async () => {
    const { getByText } = renderCreatePolicyWithRouter([`${ROUTES.EDIT_POLICY}?id=one&id=two`]);

    await waitFor(() => getByText("Testing Policies"));
    expect(coreServicesMock.notifications.toasts.addDanger).toHaveBeenCalledTimes(1);
    expect(coreServicesMock.notifications.toasts.addDanger).toHaveBeenCalledWith("Invalid policy id: one,two");
  });

  it("routes back to policies if getPolicy gracefully fails", async () => {
    browserServicesMock.policyService.getPolicy = jest.fn().mockResolvedValue({ ok: false, error: "some error" });
    const { getByText } = renderCreatePolicyWithRouter([`${ROUTES.EDIT_POLICY}?id=some_id`]);

    await waitFor(() => getByText("Testing Policies"));
    expect(coreServicesMock.notifications.toasts.addDanger).toHaveBeenCalledTimes(1);
    expect(coreServicesMock.notifications.toasts.addDanger).toHaveBeenCalledWith("Could not load the policy: some error");
  });

  it("routes back to policies if getPolicy gracefully fails", async () => {
    browserServicesMock.policyService.getPolicy = jest.fn().mockRejectedValue(new Error("another error"));
    const { getByText } = renderCreatePolicyWithRouter([`${ROUTES.EDIT_POLICY}?id=some_id`]);

    await waitFor(() => getByText("Testing Policies"));
    expect(coreServicesMock.notifications.toasts.addDanger).toHaveBeenCalledTimes(1);
    expect(coreServicesMock.notifications.toasts.addDanger).toHaveBeenCalledWith("another error");
  });

  it("disallows editing policy ID when in edit", async () => {
    browserServicesMock.policyService.getPolicy = jest
      .fn()
      .mockResolvedValue({ ok: true, response: { seqNo: 1, primaryTerm: 5, id: "some_id", policy: JSON.parse(DEFAULT_POLICY) } });
    const { getByDisplayValue, getByPlaceholderText } = renderCreatePolicyWithRouter([`${ROUTES.EDIT_POLICY}?id=some_id`]);

    await waitFor(() => getByDisplayValue("some_id"));

    expect(getByPlaceholderText("example_policy")).toHaveAttribute("readonly");
  });

  it("shows error for policyId input when clicking create", async () => {
    const { getByTestId, queryByText, getByPlaceholderText } = renderCreatePolicyWithRouter();

    expect(queryByText("Required")).toBeNull();

    userEvent.click(getByTestId("createPolicyCreateButton"));

    expect(queryByText("Required")).not.toBeNull();

    fireEvent.focus(getByPlaceholderText("example_policy"));
    userEvent.type(getByPlaceholderText("example_policy"), `some_policy_id`);
    fireEvent.blur(getByPlaceholderText("example_policy"));

    expect(queryByText("Required")).toBeNull();
  });

  it("routes you back to policies and shows a success toaster when successfully creating a policy", async () => {
    browserServicesMock.policyService.putPolicy = jest.fn().mockResolvedValue({ ok: true, response: { _id: "some_policy_id" } });
    const { getByText, getByTestId, getByPlaceholderText } = renderCreatePolicyWithRouter();

    fireEvent.focus(getByPlaceholderText("example_policy"));
    userEvent.type(getByPlaceholderText("example_policy"), `some_policy_id`);
    fireEvent.blur(getByPlaceholderText("example_policy"));

    userEvent.click(getByTestId("createPolicyCreateButton"));

    await waitFor(() => getByText("Testing Policies"));
    expect(coreServicesMock.notifications.toasts.addSuccess).toHaveBeenCalledWith("Created policy: some_policy_id");
  });

  it("shows a danger toaster when getting graceful error from create policy", async () => {
    browserServicesMock.policyService.putPolicy = jest.fn().mockResolvedValue({ ok: false, error: "bad policy" });
    const { getByText, getByTestId, getByPlaceholderText } = renderCreatePolicyWithRouter();

    fireEvent.focus(getByPlaceholderText("example_policy"));
    userEvent.type(getByPlaceholderText("example_policy"), `some_policy_id`);
    fireEvent.blur(getByPlaceholderText("example_policy"));

    userEvent.click(getByTestId("createPolicyCreateButton"));

    await waitFor(() => getByText("bad policy"));
  });

  it("shows a danger toaster when getting error from create policy", async () => {
    browserServicesMock.policyService.putPolicy = jest.fn().mockRejectedValue(new Error("this is an error"));
    const { getByText, getByTestId, getByPlaceholderText } = renderCreatePolicyWithRouter();

    fireEvent.focus(getByPlaceholderText("example_policy"));
    userEvent.type(getByPlaceholderText("example_policy"), `some_policy_id`);
    fireEvent.blur(getByPlaceholderText("example_policy"));

    userEvent.click(getByTestId("createPolicyCreateButton"));

    await waitFor(() => getByText("this is an error"));
  });

  it("routes you back to policies and shows a success toaster when successfully updating a policy", async () => {
    browserServicesMock.policyService.putPolicy = jest.fn().mockResolvedValue({ ok: true, response: { _id: "some_policy_id" } });
    browserServicesMock.policyService.getPolicy = jest
      .fn()
      .mockResolvedValue({ ok: true, response: { seqNo: 1, primaryTerm: 5, id: "some_policy_id", policy: JSON.parse(DEFAULT_POLICY) } });
    const { getByText, getByTestId, getByDisplayValue } = renderCreatePolicyWithRouter([`${ROUTES.EDIT_POLICY}?id=some_policy_id`]);

    await waitFor(() => getByDisplayValue("some_policy_id"));

    userEvent.click(getByTestId("createPolicyCreateButton"));

    await waitFor(() => getByText("Testing Policies"));
    expect(coreServicesMock.notifications.toasts.addSuccess).toHaveBeenCalledWith("Updated policy: some_policy_id");
  });

  it("shows error when getting graceful error from create policy", async () => {
    browserServicesMock.policyService.putPolicy = jest.fn().mockResolvedValue({ ok: false, error: "bad policy" });
    browserServicesMock.policyService.getPolicy = jest
      .fn()
      .mockResolvedValue({ ok: true, response: { seqNo: 1, primaryTerm: 5, id: "some_policy_id", policy: JSON.parse(DEFAULT_POLICY) } });
    const { getByTestId, getByDisplayValue, getByText } = renderCreatePolicyWithRouter([`${ROUTES.EDIT_POLICY}?id=some_policy_id`]);

    await waitFor(() => getByDisplayValue("some_policy_id"));

    userEvent.click(getByTestId("createPolicyCreateButton"));

    await waitFor(() => getByText("bad policy"));
  });

  it("shows a danger toaster when getting error from create policy", async () => {
    browserServicesMock.policyService.putPolicy = jest.fn().mockRejectedValue(new Error("this is an error"));
    browserServicesMock.policyService.getPolicy = jest
      .fn()
      .mockResolvedValue({ ok: true, response: { seqNo: 1, primaryTerm: 5, id: "some_policy_id", policy: JSON.parse(DEFAULT_POLICY) } });
    const { getByText, getByTestId, getByDisplayValue } = renderCreatePolicyWithRouter([`${ROUTES.EDIT_POLICY}?id=some_policy_id`]);

    await waitFor(() => getByDisplayValue("some_policy_id"));

    userEvent.click(getByTestId("createPolicyCreateButton"));

    await waitFor(() => getByText("this is an error"));
  });

  it("brings you back to policies when clicking cancel", async () => {
    const { getByTestId, getByText } = renderCreatePolicyWithRouter();

    userEvent.click(getByTestId("createPolicyCancelButton"));

    await waitFor(() => getByText("Testing Policies"));
  });
});
