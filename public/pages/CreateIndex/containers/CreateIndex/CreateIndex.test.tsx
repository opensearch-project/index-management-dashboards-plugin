/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { MemoryRouter as Router, Redirect, Route, RouteComponentProps, Switch } from "react-router-dom";
import { render, waitFor, fireEvent } from "@testing-library/react";
import { CoreStart } from "opensearch-dashboards/public";
import CreateIndex from "./CreateIndex";
import { ServicesConsumer, ServicesContext } from "../../../../services";
import { browserServicesMock, coreServicesMock } from "../../../../../test/mocks";
import { BrowserServices } from "../../../../models/interfaces";
import { ModalProvider, ModalRoot } from "../../../../components/Modal";
import { ROUTES } from "../../../../utils/constants";
import { CoreServicesConsumer, CoreServicesContext } from "../../../../components/core_services";

browserServicesMock.commonService.apiCaller = async (payload) => {
  switch (payload.endpoint) {
    case "cat.aliases":
      return {
        ok: true,
        response: [
          {
            alias: ".kibana",
            index: ".kibana_1",
            filter: "-",
            is_write_index: "-",
          },
          {
            alias: "2",
            index: "1234",
            filter: "-",
            is_write_index: "-",
          },
        ],
      };
    case "indices.get":
      const payloadIndex = payload.data?.index;
      if (payloadIndex === "bad_index") {
        return {
          ok: false,
          error: "bad_error",
          response: {},
        };
      }

      return {
        ok: true,
        response: {
          aliases: {
            "2": {},
          },
          mappings: {
            properties: {
              "3": {
                type: "text",
              },
              "34": {
                type: "text",
              },
              "123": {
                properties: {
                  "1234": {
                    type: "text",
                  },
                },
              },
              "4343": {
                type: "text",
              },
              "NAME_YOUR_FIELD-1666147195251": {
                type: "text",
              },
            },
          },
          settings: {
            index: {
              number_of_shards: "1",
              number_of_replicas: "1",
            },
          },
        },
      };
  }
  return {
    ok: true,
    response: {},
  };
};

function renderCreateIndexWithRouter(initialEntries = ["/"]) {
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
                              path={`${ROUTES.CREATE_INDEX}/:index`}
                              render={(props: RouteComponentProps) => <CreateIndex {...props} commonService={services.commonService} />}
                            />
                            <Route
                              path={ROUTES.CREATE_INDEX}
                              render={(props: RouteComponentProps) => <CreateIndex {...props} commonService={services.commonService} />}
                            />
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

describe("<CreateIndex /> spec", () => {
  it("renders the create component", () => {
    const { container } = renderCreateIndexWithRouter();

    expect(container.firstChild).toMatchSnapshot();
  });

  it("renders the edit component", async () => {
    const { container } = renderCreateIndexWithRouter([`${ROUTES.CREATE_INDEX}/some_index`]);

    await waitFor(() => {});

    expect(container.firstChild).toMatchSnapshot();
  });

  it("show a toast if getIndices gracefully fails", async () => {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const { getByText } = renderCreateIndexWithRouter([`${ROUTES.CREATE_INDEX}/bad_index`]);

    await waitFor(() => getByText("Update"));
    expect(coreServicesMock.notifications.toasts.addDanger).toHaveBeenCalledTimes(1);
    expect(coreServicesMock.notifications.toasts.addDanger).toHaveBeenCalledWith("bad_error");
  });

  it("disallows editing index name when in edit", async () => {
    const { getByDisplayValue, getByPlaceholderText } = renderCreateIndexWithRouter([`${ROUTES.CREATE_INDEX}/some_index`]);

    await waitFor(() => getByDisplayValue("some_index"));

    expect(getByPlaceholderText("Please enter the name for your index")).toHaveAttribute("disabled");
  });

  // it("shows error for index name input when clicking create", async () => {
  //   const { queryByText, getByPlaceholderText, getByText } = renderCreateIndexWithRouter();

  //   expect(queryByText("Required")).toBeNull();

  //   userEvent.click(getByText("Create"));

  //   expect(queryByText("Required")).not.toBeNull();

  //   fireEvent.focus(getByPlaceholderText("hot_cold_workflow"));
  //   userEvent.type(getByPlaceholderText("hot_cold_workflow"), `some_policy_id`);
  //   fireEvent.blur(getByPlaceholderText("hot_cold_workflow"));

  //   expect(queryByText("Required")).toBeNull();
  // });

  // it("routes you back to policies and shows a success toaster when successfully creating a policy", async () => {
  //   browserServicesMock.policyService.putPolicy = jest.fn().mockResolvedValue({ ok: true, response: { _id: "some_policy_id" } });
  //   const { getByText, getByTestId, getByPlaceholderText } = renderCreateIndexWithRouter();

  //   fireEvent.focus(getByPlaceholderText("hot_cold_workflow"));
  //   userEvent.type(getByPlaceholderText("hot_cold_workflow"), `some_policy_id`);
  //   fireEvent.blur(getByPlaceholderText("hot_cold_workflow"));

  //   userEvent.click(getByTestId("createPolicyCreateButton"));

  //   await waitFor(() => getByText("Testing Policies"));
  //   expect(coreServicesMock.notifications.toasts.addSuccess).toHaveBeenCalledWith("Created policy: some_policy_id");
  // });

  // it("shows a danger toaster when getting graceful error from create policy", async () => {
  //   browserServicesMock.policyService.putPolicy = jest.fn().mockResolvedValue({ ok: false, error: "bad policy" });
  //   const { getByText, getByTestId, getByPlaceholderText } = renderCreateIndexWithRouter();

  //   fireEvent.focus(getByPlaceholderText("hot_cold_workflow"));
  //   userEvent.type(getByPlaceholderText("hot_cold_workflow"), `some_policy_id`);
  //   fireEvent.blur(getByPlaceholderText("hot_cold_workflow"));

  //   userEvent.click(getByTestId("createPolicyCreateButton"));

  //   await waitFor(() => getByText("bad policy"));
  // });

  // it("shows a danger toaster when getting error from create policy", async () => {
  //   browserServicesMock.policyService.putPolicy = jest.fn().mockRejectedValue(new Error("this is an error"));
  //   const { getByText, getByTestId, getByPlaceholderText } = renderCreateIndexWithRouter();

  //   fireEvent.focus(getByPlaceholderText("hot_cold_workflow"));
  //   userEvent.type(getByPlaceholderText("hot_cold_workflow"), `some_policy_id`);
  //   fireEvent.blur(getByPlaceholderText("hot_cold_workflow"));

  //   userEvent.click(getByTestId("createPolicyCreateButton"));

  //   await waitFor(() => getByText("this is an error"));
  // });

  // it("routes you back to policies and shows a success toaster when successfully updating a policy", async () => {
  //   browserServicesMock.policyService.putPolicy = jest.fn().mockResolvedValue({ ok: true, response: { _id: "some_policy_id" } });
  //   browserServicesMock.policyService.getPolicy = jest
  //     .fn()
  //     .mockResolvedValue({ ok: true, response: { seqNo: 1, primaryTerm: 5, id: "some_policy_id", policy: JSON.parse(DEFAULT_POLICY) } });
  //   const { getByText, getByTestId, getByDisplayValue } = renderCreateIndexWithRouter([`${ROUTES.EDIT_POLICY}?id=some_policy_id`]);

  //   await waitFor(() => getByDisplayValue("some_policy_id"));

  //   userEvent.click(getByTestId("createPolicyCreateButton"));

  //   await waitFor(() => getByText("Testing Policies"));
  //   expect(coreServicesMock.notifications.toasts.addSuccess).toHaveBeenCalledWith("Updated policy: some_policy_id");
  // });

  // it("shows error when getting graceful error from create policy", async () => {
  //   browserServicesMock.policyService.putPolicy = jest.fn().mockResolvedValue({ ok: false, error: "bad policy" });
  //   browserServicesMock.policyService.getPolicy = jest
  //     .fn()
  //     .mockResolvedValue({ ok: true, response: { seqNo: 1, primaryTerm: 5, id: "some_policy_id", policy: JSON.parse(DEFAULT_POLICY) } });
  //   const { getByTestId, getByDisplayValue, getByText } = renderCreateIndexWithRouter([`${ROUTES.EDIT_POLICY}?id=some_policy_id`]);

  //   await waitFor(() => getByDisplayValue("some_policy_id"));

  //   userEvent.click(getByTestId("createPolicyCreateButton"));

  //   await waitFor(() => getByText("bad policy"));
  // });

  // it("shows a danger toaster when getting error from create policy", async () => {
  //   browserServicesMock.policyService.putPolicy = jest.fn().mockRejectedValue(new Error("this is an error"));
  //   browserServicesMock.policyService.getPolicy = jest
  //     .fn()
  //     .mockResolvedValue({ ok: true, response: { seqNo: 1, primaryTerm: 5, id: "some_policy_id", policy: JSON.parse(DEFAULT_POLICY) } });
  //   const { getByText, getByTestId, getByDisplayValue } = renderCreateIndexWithRouter([`${ROUTES.EDIT_POLICY}?id=some_policy_id`]);

  //   await waitFor(() => getByDisplayValue("some_policy_id"));

  //   userEvent.click(getByTestId("createPolicyCreateButton"));

  //   await waitFor(() => getByText("this is an error"));
  // });

  // it("brings you back to policies when clicking cancel", async () => {
  //   const { getByTestId, getByText } = renderCreateIndexWithRouter();

  //   userEvent.click(getByTestId("createPolicyCancelButton"));

  //   await waitFor(() => getByText("Testing Policies"));
  // });
});
