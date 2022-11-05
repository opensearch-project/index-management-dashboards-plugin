/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { MemoryRouter as Router, Route, RouteComponentProps, Switch } from "react-router-dom";
import { render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CoreStart } from "opensearch-dashboards/public";
import CreateIndex from "./CreateIndex";
import { ServicesConsumer, ServicesContext } from "../../../../services";
import { browserServicesMock, coreServicesMock } from "../../../../../test/mocks";
import { BrowserServices } from "../../../../models/interfaces";
import { ModalProvider, ModalRoot } from "../../../../components/Modal";
import { IndicesUpdateMode, ROUTES } from "../../../../utils/constants";
import { CoreServicesConsumer, CoreServicesContext } from "../../../../components/core_services";

browserServicesMock.commonService.apiCaller = jest.fn(
  async (payload): Promise<any> => {
    switch (payload.endpoint) {
      case "transport.request": {
        if (payload.data?.path?.startsWith("/_index_template/_simulate_index/")) {
          return {
            ok: true,
            response: {
              template: {
                settings: {
                  index: {
                    number_of_replicas: "10",
                  },
                },
              },
            },
          };
        }
      }
      case "indices.create":
        if (payload.data?.index === "bad_index") {
          return {
            ok: false,
            error: "bad_index",
          };
        }

        return {
          ok: true,
          response: {},
        };
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
            [payload.data?.index]: {
              aliases: {
                update_test_1: {},
              },
              mappings: {
                properties: {
                  test_mapping_1: {
                    type: "text",
                  },
                },
              },
              settings: {
                "index.number_of_shards": "1",
                "index.number_of_replicas": "1",
              },
            },
          },
        };
    }
    return {
      ok: true,
      response: {},
    };
  }
);

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
                              path={`${ROUTES.CREATE_INDEX}/:index/:mode`}
                              render={(props: RouteComponentProps) => <CreateIndex {...props} commonService={services.commonService} />}
                            />
                            <Route
                              path={`${ROUTES.CREATE_INDEX}/:index`}
                              render={(props: RouteComponentProps) => <CreateIndex {...props} commonService={services.commonService} />}
                            />
                            <Route
                              path={ROUTES.CREATE_INDEX}
                              render={(props: RouteComponentProps) => <CreateIndex {...props} commonService={services.commonService} />}
                            />
                            <Route
                              path={ROUTES.INDICES}
                              render={(props: RouteComponentProps) => <h1>location is: {ROUTES.INDEX_POLICIES}</h1>}
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

  it("show a toast if getIndices gracefully fails", async () => {
    const { getByText } = renderCreateIndexWithRouter([`${ROUTES.CREATE_INDEX}/bad_index`]);

    await waitFor(() => {
      getByText("Update");
    });
    expect(coreServicesMock.notifications.toasts.addDanger).toHaveBeenCalledTimes(1);
    expect(coreServicesMock.notifications.toasts.addDanger).toHaveBeenCalledWith("bad_error");
  });

  it("shows error for index name input when clicking create", async () => {
    const { queryByText, getByText } = renderCreateIndexWithRouter();

    await waitFor(() => getByText("Define index"));

    expect(queryByText("Index name can not be null.")).toBeNull();

    userEvent.click(getByText("Create"));
    await waitFor(() => {
      expect(queryByText("Index name can not be null.")).not.toBeNull();
    });
  });

  it("routes you back to indices and shows a success toast when successfully creating a index", async () => {
    const { getByText, getByPlaceholderText, getByTestId } = renderCreateIndexWithRouter();

    await waitFor(() => {
      getByText("Define index");
    });

    userEvent.type(getByPlaceholderText("Please enter the name for your index"), `some_index`);
    userEvent.click(document.body);
    await waitFor(() => {
      expect(getByTestId("form-name-index.number_of_replicas").querySelector("input")).toHaveAttribute("value", "10");
    });
    userEvent.click(getByText("Create"));
    await waitFor(() => {
      expect(coreServicesMock.notifications.toasts.addSuccess).toHaveBeenCalledWith("some_index has been successfully created.");
    });
  });

  it("shows a danger toast when getting graceful error from create index", async () => {
    const { getByText, getByPlaceholderText } = renderCreateIndexWithRouter();

    await waitFor(() => getByText("Define index"));

    userEvent.type(getByPlaceholderText("Please enter the name for your index"), `bad_index`);
    userEvent.click(getByText("Create"));

    await waitFor(() => {
      expect(coreServicesMock.notifications.toasts.addDanger).toHaveBeenCalledWith("bad_index");
    });
  });

  it("it shows detail and does not call any api when nothing modified", async () => {
    const { getByText, getByTestId } = renderCreateIndexWithRouter([`${ROUTES.CREATE_INDEX}/good_index`]);
    await waitFor(() => getByText("Define index"));
    userEvent.click(getByText("Update"));
    await waitFor(() => {});
    userEvent.click(getByTestId("change_diff_confirm-confirm"));

    await waitFor(() => {
      // it shows detail and does not call any api when nothing modified
      expect(browserServicesMock.commonService.apiCaller).toBeCalledTimes(2);
    });
  });

  it("shows detail info and update others", async () => {
    const { getByText, getByTestId, getByTitle } = renderCreateIndexWithRouter([`${ROUTES.CREATE_INDEX}/good_index`]);

    await waitFor(() => getByText("Define index"));

    userEvent.click(getByTitle("update_test_1").querySelector("button") as Element);
    userEvent.type(getByTestId("comboBoxSearchInput"), "test_1{enter}");
    userEvent.type(getByTestId("form-name-index.number_of_replicas").querySelector("input") as Element, "2");
    userEvent.click(getByTestId("create index add field button"));
    await waitFor(() => {});
    await userEvent.clear(getByTestId("mapping-visual-editor-1-field-name"));
    await userEvent.type(getByTestId("mapping-visual-editor-1-field-name"), "test_mapping_2");
    await userEvent.click(document.body);
    userEvent.click(getByText("Update"));
    await waitFor(() => {});
    userEvent.click(getByTestId("change_diff_confirm-confirm"));

    await waitFor(() => {
      expect(coreServicesMock.notifications.toasts.addSuccess).toBeCalledTimes(1);
      expect(browserServicesMock.commonService.apiCaller).toBeCalledWith({
        endpoint: "indices.updateAliases",
        method: "PUT",
        data: {
          body: {
            actions: [
              {
                remove: {
                  index: "good_index",
                  alias: "update_test_1",
                },
              },
              {
                add: {
                  index: "good_index",
                  alias: "test_1",
                },
              },
            ],
          },
        },
      });

      expect(browserServicesMock.commonService.apiCaller).toBeCalledWith({
        endpoint: "indices.putSettings",
        method: "PUT",
        data: {
          index: "good_index",
          flat_settings: true,
          body: {
            "index.number_of_replicas": "12",
          },
        },
      });

      expect(browserServicesMock.commonService.apiCaller).toBeCalledWith({
        endpoint: "indices.putMapping",
        method: "PUT",
        data: {
          index: "good_index",
          body: {
            properties: {
              test_mapping_2: {
                type: "text",
              },
            },
          },
        },
      });
    });
  });

  it("shows detail alias and update alias only", async () => {
    const { getByText, getByTestId, getByTitle } = renderCreateIndexWithRouter([
      `${ROUTES.CREATE_INDEX}/good_index/${IndicesUpdateMode.alias}`,
    ]);

    await waitFor(() => {});

    userEvent.click(getByTitle("update_test_1").querySelector("button") as Element);
    userEvent.type(getByTestId("comboBoxSearchInput"), "test_1{enter}");
    await waitFor(() => {});
    userEvent.click(getByText("Update"));
    await waitFor(() => {});
    userEvent.click(getByTestId("change_diff_confirm-cancel"));
    await waitFor(() => {});
    userEvent.click(getByText("Update"));
    await waitFor(() => {});
    userEvent.click(getByTestId("change_diff_confirm-confirm"));

    await waitFor(() => {
      // shows detail alias and update alias only
      expect(coreServicesMock.notifications.toasts.addSuccess).toBeCalledTimes(1);
      expect(browserServicesMock.commonService.apiCaller).toBeCalledWith({
        endpoint: "indices.updateAliases",
        method: "PUT",
        data: {
          body: {
            actions: [
              {
                remove: {
                  index: "good_index",
                  alias: "update_test_1",
                },
              },
              {
                add: {
                  index: "good_index",
                  alias: "test_1",
                },
              },
            ],
          },
        },
      });
    });
  });

  it("shows detail settings and update settings only", async () => {
    const { getByText, getByTestId } = renderCreateIndexWithRouter([`${ROUTES.CREATE_INDEX}/good_index/${IndicesUpdateMode.mappings}`]);

    await waitFor(() => {});

    userEvent.click(getByTestId("create index add field button"));
    await waitFor(() => {});
    await userEvent.clear(getByTestId("mapping-visual-editor-1-field-name"));
    await userEvent.type(getByTestId("mapping-visual-editor-1-field-name"), "test_mapping_2");
    await userEvent.click(document.body);
    await waitFor(() => {});
    userEvent.click(getByText("Update"));
    await waitFor(() => {});
    userEvent.click(getByTestId("change_diff_confirm-confirm"));

    await waitFor(() => {
      // shows detail settings and update settings only
      expect(coreServicesMock.notifications.toasts.addSuccess).toBeCalledTimes(1);

      expect(browserServicesMock.commonService.apiCaller).toBeCalledWith({
        endpoint: "indices.putMapping",
        method: "PUT",
        data: {
          index: "good_index",
          body: {
            properties: {
              test_mapping_2: {
                type: "text",
              },
            },
          },
        },
      });
    });
  });

  it("shows detail mappings and update mappings only", async () => {
    const { getByText, getByTestId } = renderCreateIndexWithRouter([`${ROUTES.CREATE_INDEX}/good_index/${IndicesUpdateMode.settings}`]);

    await waitFor(() => {});

    userEvent.type(getByTestId("form-name-index.number_of_replicas").querySelector("input") as Element, "2");
    userEvent.click(getByText("Update"));
    await waitFor(() => {});
    userEvent.click(getByTestId("change_diff_confirm-confirm"));

    await waitFor(() => {
      // shows detail mappings and update mappings only
      expect(coreServicesMock.notifications.toasts.addSuccess).toBeCalledTimes(1);

      expect(browserServicesMock.commonService.apiCaller).toBeCalledWith({
        endpoint: "indices.putSettings",
        method: "PUT",
        data: {
          index: "good_index",
          flat_settings: true,
          body: {
            "index.number_of_replicas": "12",
          },
        },
      });
    });
  });

  it("it goes to indices page when click cancel", async () => {
    const { getByText } = renderCreateIndexWithRouter([`${ROUTES.CREATE_INDEX}/good_index`]);
    await waitFor(() => {});
    userEvent.click(getByText("Cancel"));
    await waitFor(() => {
      expect(getByText(`location is: ${ROUTES.INDEX_POLICIES}`)).toBeInTheDocument();
    });
  });
});
