/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { render, fireEvent, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, RouteComponentProps, Switch } from "react-router-dom";
import { MemoryRouter as Router } from "react-router-dom";
import { CoreStart } from "opensearch-dashboards/public";
import { browserServicesMock, coreServicesMock } from "../../../../../test/mocks";
import { ServicesConsumer, ServicesContext } from "../../../../services";
import { BREADCRUMBS, ROUTES } from "../../../../utils/constants";
import { CoreServicesConsumer, CoreServicesContext } from "../../../../components/core_services";
import ShrinkIndex from "./ShrinkIndex";
import { ModalProvider, ModalRoot } from "../../../../components/Modal";
import { BrowserServices } from "../../../../models/interfaces";

function renderWithRouter(initialEntries = [ROUTES.SHRINK_INDEX] as string[]) {
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
                              path={ROUTES.SHRINK_INDEX}
                              render={(props: RouteComponentProps) => <ShrinkIndex {...props} commonService={services.commonService} />}
                            />
                            <Route path={ROUTES.INDICES} render={(props: RouteComponentProps) => <h1>location is: {ROUTES.INDICES}</h1>} />
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

const indices = [
  {
    "docs.count": 5,
    "docs.deleted": 2,
    health: "green",
    index: "test1",
    pri: "10",
    "pri.store.size": "100KB",
    rep: "0",
    status: "open",
    "store.size": "100KB",
    uuid: "some_uuid",
  },
  {
    "docs.count": 5,
    "docs.deleted": 2,
    health: "green",
    index: "test2",
    pri: "3",
    "pri.store.size": "100KB",
    rep: "0",
    status: "open",
    "store.size": "100KB",
    uuid: "some_uuid",
  },
  {
    "docs.count": 5,
    "docs.deleted": 2,
    health: "green",
    index: "test3",
    pri: "5",
    "pri.store.size": "100KB",
    rep: "0",
    status: "open",
    "store.size": "100KB",
    uuid: "some_uuid",
  },
  {
    "docs.count": 5,
    "docs.deleted": 2,
    health: "red",
    index: "test4",
    pri: "1",
    "pri.store.size": "100KB",
    rep: "0",
    status: "open",
    "store.size": "100KB",
    uuid: "some_uuid",
  },
  {
    "docs.count": 5,
    "docs.deleted": 2,
    health: "green",
    index: "test5",
    pri: "3",
    "pri.store.size": "100KB",
    rep: "0",
    status: "close",
    "store.size": "100KB",
    uuid: "some_uuid",
  },
  {
    "docs.count": 5,
    "docs.deleted": 2,
    health: "yellow",
    index: "test6",
    pri: "3",
    "pri.store.size": "100KB",
    rep: "0",
    status: "open",
    "store.size": "100KB",
    uuid: "some_uuid",
  },
  {
    "docs.count": 5,
    "docs.deleted": 2,
    health: "yellow",
    index: "test7",
    pri: "3",
    "pri.store.size": "100KB",
    rep: "0",
    status: "close",
    "store.size": "100KB",
    uuid: "some_uuid",
  },
];

const mockApi = () => {
  browserServicesMock.indexService.getIndices = jest.fn().mockImplementation((args) => ({
    ok: true,
    response: { indices: args.search.length > 0 ? indices.filter((index) => index.index.startsWith(args.search)) : indices },
  }));

  browserServicesMock.commonService.apiCaller = jest.fn(
    async (payload): Promise<any> => {
      switch (payload.endpoint) {
        case "cat.indices":
          return {
            ok: true,
            response: indices.filter((indexItem) => indexItem.index === payload.data.index[0]),
          };
        case "indices.getSettings":
          if (payload.data.index === "test2") {
            return {
              ok: true,
              response: {
                test2: {
                  settings: {
                    "index.blocks.write": false,
                  },
                },
              },
            };
          } else if (payload.data.index === "test3") {
            return {
              ok: true,
              response: {
                test3: {
                  settings: {
                    "index.blocks.write": true,
                    "index.routing.allocation.require._name": "node1",
                  },
                },
              },
            };
          } else if (payload.data.index === "test6") {
            return {
              ok: true,
              response: {
                test6: {
                  settings: {
                    "index.blocks.write": true,
                    "index.blocks.read_only": true,
                  },
                },
              },
            };
          } else if (payload.data.index === "test7") {
            return {
              ok: true,
              response: {
                test6: {
                  settings: {
                    "index.blocks.read_only": true,
                  },
                },
              },
            };
          } else {
            return {
              ok: true,
              response: {},
            };
          }
        case "indices.putSettings":
          if (payload.data.index === "test7") {
            return {
              ok: false,
              error: "[cluster_block_exception] index [test7] blocked by: [FORBIDDEN/5/index read-only (api)];",
            };
          } else {
            return {
              ok: true,
              response: {},
            };
          }
        case "indices.open":
          if (payload.data.index === "test7") {
            return {
              ok: false,
              error: "[cluster_block_exception] index [test7] blocked by: [FORBIDDEN/5/index read-only (api)];",
            };
          } else {
            return {
              ok: true,
              response: {},
            };
          }
        case "cat.aliases":
          return {
            ok: true,
            response: [
              {
                alias: "a1",
                index: "acvxcvxc",
                filter: "-",
                "routing.index": "-",
                "routing.search": "-",
                is_write_index: "-",
              },
            ],
          };
        case "indices.shrink":
          return {
            ok: true,
            response: {},
          };
      }
      return {
        ok: true,
        response: {},
      };
    }
  );
};

describe("<Shrink index /> spec", () => {
  it("renders the component", async () => {
    mockApi();
    const { container, getByText } = renderWithRouter([`${ROUTES.SHRINK_INDEX}?source=test3`]);
    // wait for one tick
    await waitFor(() => {
      getByText("Configure target index");
    });
    expect(container).toMatchSnapshot();
  });

  it("set breadcrumbs when mounting", async () => {
    mockApi();
    renderWithRouter();

    // wait for one tick
    await waitFor(() => {});

    expect(coreServicesMock.chrome.setBreadcrumbs).toHaveBeenCalledTimes(1);
    expect(coreServicesMock.chrome.setBreadcrumbs).toHaveBeenCalledWith([
      BREADCRUMBS.INDEX_MANAGEMENT,
      BREADCRUMBS.INDICES,
      BREADCRUMBS.SHRINK_INDEX,
    ]);
  });

  it("cancel back to indices page", async () => {
    mockApi();
    const { getByText } = renderWithRouter([`${ROUTES.SHRINK_INDEX}?source=test1`]);
    await waitFor(() => {});
    userEvent.click(getByText("Cancel"));

    expect(getByText(`location is: ${ROUTES.INDICES}`)).toBeInTheDocument();
  });

  it("shows error when source index's setting index.blocks.write is null", async () => {
    mockApi();
    const { getByText, queryByText, getByTestId } = renderWithRouter([`${ROUTES.SHRINK_INDEX}?source=test1`]);
    await waitFor(() => {
      getByText("Source index details");
    });

    expect(queryByText("The source index must block write operations before shrinking.")).not.toBeNull();
    fireEvent.click(getByTestId("onSetIndexWriteBlockButton"));
    expect(browserServicesMock.commonService.apiCaller).toHaveBeenCalledWith({
      endpoint: "indices.putSettings",
      method: "PUT",
      data: {
        index: "test1",
        body: {
          settings: {
            "index.blocks.write": true,
          },
        },
      },
    });
  });

  it("shows error when source index's setting index.blocks.write is false", async () => {
    mockApi();
    const { getByText, queryByText, getByTestId } = renderWithRouter([`${ROUTES.SHRINK_INDEX}?source=test2`]);
    await waitFor(() => {
      getByText("Source index details");
    });

    expect(queryByText("The source index must block write operations before shrinking.")).not.toBeNull();
    fireEvent.click(getByTestId("onSetIndexWriteBlockButton"));
    expect(browserServicesMock.commonService.apiCaller).toHaveBeenCalledWith({
      endpoint: "indices.putSettings",
      method: "PUT",
      data: {
        index: "test2",
        body: {
          settings: {
            "index.blocks.write": true,
          },
        },
      },
    });
  });

  it("shows error when target index name is not set", async () => {
    mockApi();
    const { getByText, queryByText, getByTestId } = renderWithRouter([`${ROUTES.SHRINK_INDEX}?source=test3`]);
    await waitFor(async () => {
      getByText("Configure target index");
      expect(queryByText("Target index name required.")).toBeNull();
    });

    await act(async () => {
      userEvent.type(getByTestId("targetIndexNameInput"), "test_index_shrunken");
    });
    await waitFor(async () => {
      expect(queryByText("Target index name required.")).toBeNull();
    });

    await act(async () => {
      userEvent.clear(getByTestId("targetIndexNameInput"));
    });
    await act(async () => {
      fireEvent.click(getByTestId("shrinkIndexConfirmButton"));
    });
    await waitFor(() => {
      expect(queryByText("Target index name required.")).not.toBeNull();
    });
  });

  it("shows error when target index name is not valid", async () => {
    mockApi();
    const { getByText, queryByText, getByTestId } = renderWithRouter([`${ROUTES.SHRINK_INDEX}?source=test3`]);
    await waitFor(async () => {
      getByText("Configure target index");
      expect(queryByText("Invalid target index name.")).toBeNull();
    });

    await act(async () => {
      userEvent.type(getByTestId("targetIndexNameInput"), "$44@&**^*^*");
    });
    await waitFor(async () => {
      expect(queryByText("Invalid target index name.")).not.toBeNull();
    });
    await act(async () => {
      fireEvent.click(getByTestId("shrinkIndexConfirmButton"));
    });
    await waitFor(() => {
      expect(queryByText("Invalid target index name.")).not.toBeNull();
    });
  });

  it("shows error when number of replicas is not valid", async () => {
    mockApi();
    const { getByText, queryByText, getByTestId } = renderWithRouter([`${ROUTES.SHRINK_INDEX}?source=test3`]);
    await waitFor(async () => {
      getByText("Configure target index");
      expect(queryByText("Number of replicas must be greater than or equal to 0.")).toBeNull();
    });

    await act(async () => {
      userEvent.clear(getByTestId("numberOfReplicasInput"));
    });

    await waitFor(async () => {
      expect(queryByText("Number of replicas must be greater than or equal to 0.")).not.toBeNull();
    });
    await act(async () => {
      userEvent.type(getByTestId("numberOfReplicasInput"), "-1");
    });

    await waitFor(async () => {
      expect(queryByText("Number of replicas must be greater than or equal to 0.")).not.toBeNull();
    });
  });

  it("shows danger when source index is red", async () => {
    mockApi();
    const { queryByText, getByTestId } = renderWithRouter([`${ROUTES.SHRINK_INDEX}?source=test4`]);

    await waitFor(() => {
      expect(queryByText("The source index must be in green health status.")).not.toBeNull();
      expect(getByTestId("shrinkIndexConfirmButton")).toHaveAttribute("disabled");
    });
  });

  it("shows danger when source index has only one primary shard", async () => {
    mockApi();
    const { queryByText, getByTestId } = renderWithRouter([`${ROUTES.SHRINK_INDEX}?source=test4`]);

    await waitFor(() => {
      expect(queryByText("Cannot shrink source index with only one primary shard.")).not.toBeNull();
      expect(getByTestId("shrinkIndexConfirmButton")).toHaveAttribute("disabled");
    });
  });

  it("shows block write operations button when source index has no write block", async () => {
    mockApi();
    const { getByText, queryByText, getByTestId } = renderWithRouter([`${ROUTES.SHRINK_INDEX}?source=test5`]);

    await waitFor(() => {
      getByText("Source index details");
    });

    expect(queryByText("The source index must block write operations before shrinking.")).not.toBeNull();
    expect(getByTestId("shrinkIndexConfirmButton")).toHaveAttribute("disabled");
    expect(getByTestId("onSetIndexWriteBlockButton")).not.toBeNull();

    userEvent.click(getByTestId("onSetIndexWriteBlockButton"));
    expect(browserServicesMock.commonService.apiCaller).toHaveBeenCalledWith({
      endpoint: "indices.putSettings",
      method: "PUT",
      data: {
        index: "test5",
        body: {
          settings: {
            "index.blocks.write": true,
          },
        },
      },
    });
  });

  it("shows open index button when source index is close", async () => {
    mockApi();
    const { getByText, queryByText, getByTestId } = renderWithRouter([`${ROUTES.SHRINK_INDEX}?source=test5`]);

    await waitFor(() => {
      getByText("Source index details");
    });

    expect(queryByText("The source index must be open.")).not.toBeNull();
    expect(getByTestId("shrinkIndexConfirmButton")).toHaveAttribute("disabled");
    expect(getByTestId("onOpenIndexButton")).not.toBeNull();

    userEvent.click(getByTestId("onOpenIndexButton"));
    expect(browserServicesMock.commonService.apiCaller).toHaveBeenCalledWith({
      endpoint: "indices.open",
      data: {
        index: "test5",
      },
    });
  });

  it("shows warning when source index is yellow", async () => {
    mockApi();
    const { getByText, queryByText } = renderWithRouter([`${ROUTES.SHRINK_INDEX}?source=test6`]);

    await waitFor(() => {
      getByText("Source index details");
    });

    expect(queryByText("We recommend shrinking index with a green health status.")).not.toBeNull();
  });

  it("shows warning when source index is set to read-only", async () => {
    mockApi();
    const { getByText, queryByText } = renderWithRouter([`${ROUTES.SHRINK_INDEX}?source=test6`]);

    await waitFor(() => {
      getByText("Source index details");
    });

    expect(queryByText("Index setting [index.blocks.read_only] is [true].")).not.toBeNull();
  });

  it("shows error when source index cannot be opened", async () => {
    mockApi();
    const { getByText, getByTestId, queryByText } = renderWithRouter([`${ROUTES.SHRINK_INDEX}?source=test7`]);

    await waitFor(() => {
      getByText("Source index details");
    });

    expect(queryByText("The source index must be open.")).not.toBeNull();
    expect(getByTestId("shrinkIndexConfirmButton")).toHaveAttribute("disabled");
    expect(getByTestId("onOpenIndexButton")).not.toBeNull();

    userEvent.click(getByTestId("onOpenIndexButton"));

    await waitFor(() => {
      expect(browserServicesMock.commonService.apiCaller).toHaveBeenCalledWith({
        endpoint: "indices.open",
        data: {
          index: "test7",
        },
      });
      expect(coreServicesMock.notifications.toasts.addDanger).toHaveBeenCalledTimes(1);
      expect(coreServicesMock.notifications.toasts.addDanger).toHaveBeenCalledWith(
        "[cluster_block_exception] index [test7] blocked by: [FORBIDDEN/5/index read-only (api)];"
      );
    });
  });

  it("shows error when source index cannot be set to block write operations", async () => {
    mockApi();
    const { getByText, getByTestId, queryByText } = renderWithRouter([`${ROUTES.SHRINK_INDEX}?source=test7`]);

    await waitFor(() => {
      getByText("Source index details");
    });

    expect(queryByText("The source index must block write operations before shrinking.")).not.toBeNull();
    expect(getByTestId("shrinkIndexConfirmButton")).toHaveAttribute("disabled");
    expect(getByTestId("onSetIndexWriteBlockButton")).not.toBeNull();

    userEvent.click(getByTestId("onSetIndexWriteBlockButton"));
    await waitFor(() => {
      expect(browserServicesMock.commonService.apiCaller).toHaveBeenCalledWith({
        endpoint: "indices.putSettings",
        method: "PUT",
        data: {
          index: "test7",
          body: {
            settings: {
              "index.blocks.write": true,
            },
          },
        },
      });
      expect(coreServicesMock.notifications.toasts.addDanger).toHaveBeenCalledTimes(1);
      expect(coreServicesMock.notifications.toasts.addDanger).toHaveBeenCalledWith(
        "[cluster_block_exception] index [test7] blocked by: [FORBIDDEN/5/index read-only (api)];"
      );
    });
  });

  it("no warning when source index is ready", async () => {
    mockApi();
    const { getByText, queryByText, getByTestId } = renderWithRouter([`${ROUTES.SHRINK_INDEX}?source=test3`]);

    await waitFor(() => {
      getByText("Configure target index");
    });

    expect(queryByText("The source index must be in green health status.")).toBeNull();
    expect(queryByText("Cannot shrink source index with only one primary shard.")).toBeNull();
    expect(queryByText("The source index must block write operations before shrinking.")).toBeNull();
    expect(queryByText("The source index must be open.")).toBeNull();
    expect(queryByText("We recommend shrinking index with a green health status.")).toBeNull();
    expect(queryByText("Index setting [index.blocks.read_only] is [true].")).toBeNull();

    userEvent.type(getByTestId("targetIndexNameInput"), "test3_shrunken");

    await act(async () => {
      fireEvent.click(getByTestId("shrinkIndexConfirmButton"));
    });

    await waitFor(() => {
      expect(browserServicesMock.commonService.apiCaller).toHaveBeenCalledWith({
        endpoint: "indices.shrink",
        data: {
          index: "test3",
          target: "test3_shrunken",
          body: {
            settings: {
              "index.number_of_shards": "1",
              "index.number_of_replicas": "1",
            },
          },
        },
      });
    });
  });
});
