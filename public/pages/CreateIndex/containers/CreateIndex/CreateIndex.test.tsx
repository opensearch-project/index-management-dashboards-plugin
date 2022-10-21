/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { MemoryRouter as Router, Redirect, Route, RouteComponentProps, Switch } from "react-router-dom";
import { render, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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
    case "indices.create":
      if (payload.data?.index === "bad_index") {
        return {
          ok: false,
          error: "bad_index",
        };
      }
      break;
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

function renderCreateIndexWithRouter(initialEntries = [ROUTES.CREATE_INDEX] as string[]) {
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

  it("disallows editing index name when in edit mode", async () => {
    const { getByDisplayValue, getByPlaceholderText } = renderCreateIndexWithRouter([`${ROUTES.CREATE_INDEX}/some_index`]);

    await waitFor(() => getByDisplayValue("some_index"));

    expect(getByPlaceholderText("Please enter the name for your index")).toHaveAttribute("disabled");
  });

  it("shows error for index name input when clicking create", async () => {
    const { queryByText, getByText } = renderCreateIndexWithRouter();

    await waitFor(() => getByText("Define index"));

    expect(queryByText("Index name can not be null.")).toBeNull();

    userEvent.click(getByText("Create"));

    expect(queryByText("Index name can not be null.")).not.toBeNull();
  });

  it("routes you back to indices and shows a success toast when successfully creating a index", async () => {
    const { getByText, getByPlaceholderText } = renderCreateIndexWithRouter();

    await waitFor(() => getByText("Define index"));

    userEvent.type(getByPlaceholderText("Please enter the name for your index"), `some_index`);
    userEvent.click(getByText("Create"));
    await new Promise((resolve) => setTimeout(resolve, 1000));

    expect(coreServicesMock.notifications.toasts.addSuccess).toHaveBeenCalledWith("some_index has been successfully created.");
  });

  it("shows a danger toast when getting graceful error from create index", async () => {
    const { getByText, getByPlaceholderText } = renderCreateIndexWithRouter();

    await waitFor(() => getByText("Define index"));

    userEvent.type(getByPlaceholderText("Please enter the name for your index"), `bad_index`);
    userEvent.click(getByText("Create"));
    await new Promise((resolve) => setTimeout(resolve, 1000));

    expect(coreServicesMock.notifications.toasts.addDanger).toHaveBeenCalledWith("bad_index");
  });
});
