/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { render, waitFor } from "@testing-library/react";
import { SplitIndex } from "./SplitIndex";
import userEvent from "@testing-library/user-event";
import { browserServicesMock, coreServicesMock } from "../../../../../test/mocks";
import { Route, RouteComponentProps, Switch } from "react-router-dom";
import { MemoryRouter as Router } from "react-router-dom";
import { BREADCRUMBS, ROUTES } from "../../../../utils/constants";
import { CoreServicesConsumer, CoreServicesContext } from "../../../../components/core_services";
import { ServicesConsumer, ServicesContext } from "../../../../services";
import { IAlias } from "../../../Aliases/interface";
import { BrowserServices } from "../../../../models/interfaces";
import { ModalProvider, ModalRoot } from "../../../../components/Modal";
import { CoreStart } from "opensearch-dashboards/public";
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

function renderWithRouter(initialEntries = [ROUTES.SPLIT_INDEX] as string[]) {
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
                              path={ROUTES.SPLIT_INDEX}
                              render={(props: RouteComponentProps) => (
                                <SplitIndex {...props} commonService={services.commonService} coreService={core} />
                              )}
                            />
                            <Route path={ROUTES.INDICES} render={() => <h1>location is: {ROUTES.INDICES}</h1>} />
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

const sourceIndexName = "source-index";

describe("<SplitIndex /> spec", () => {
  it("renders the component", async () => {
    browserServicesMock.commonService.apiCaller = jest.fn(
      async (payload): Promise<any> => {
        if (payload.endpoint === "cat.aliases") {
          return {
            ok: true,
            response: [
              {
                alias: "testAlias",
                index: "1",
              },
            ] as IAlias[],
          };
        } else if (payload.endpoint === "cat.indices") {
          return {
            ok: true,
            response: [
              {
                health: "green",
                status: "open",
                index: sourceIndexName,
                pri: "1",
                rep: "0",
              },
            ],
          };
        }

        return {
          ok: true,
        };
      }
    );

    renderWithRouter([`${ROUTES.SPLIT_INDEX}?source=index-source`]);

    await waitFor(() => {
      expect(document.body.children).toMatchSnapshot();
    });
  });

  it("set breadcrumbs when mounting", async () => {
    renderWithRouter();

    // wait for one tick
    await waitFor(() => {});

    expect(coreServicesMock.chrome.setBreadcrumbs).toHaveBeenCalledTimes(1);
    expect(coreServicesMock.chrome.setBreadcrumbs).toHaveBeenCalledWith([
      BREADCRUMBS.INDEX_MANAGEMENT,
      BREADCRUMBS.INDICES,
      BREADCRUMBS.SPLIT_INDEX,
    ]);
  });

  it("Successful split an index whose shards number is greater than 1", async () => {
    browserServicesMock.commonService.apiCaller = jest.fn(
      async (payload): Promise<any> => {
        if (payload.endpoint === "cat.aliases") {
          return {
            ok: true,
            response: [
              {
                alias: "testAlias",
                index: "1",
              },
            ] as IAlias[],
          };
        } else if (payload.endpoint === "cat.indices") {
          return {
            ok: true,
            response: [
              {
                health: "green",
                status: "open",
                index: sourceIndexName,
                pri: "2",
                rep: "0",
              },
            ],
          };
        }

        return {
          ok: true,
        };
      }
    );

    const { getByTestId, getByText } = renderWithRouter([`${ROUTES.SPLIT_INDEX}?source=$(sourceIndexName)`]);

    await waitFor(() => {
      expect(getByTestId("splitButton")).not.toBeDisabled();
    });

    expect(getByText("The number must be 2x times of the primary shard count of the source index.")).not.toBeNull();

    userEvent.type(getByTestId("targetIndexNameInput"), "split_test_index-split");
    userEvent.type(
      getByTestId("numberOfShardsInput").querySelector('[data-test-subj="comboBoxSearchInput"]') as Element,
      "4{arrowdown}{enter}"
    );
    userEvent.click(getByTestId("splitButton"));

    await waitFor(() => {
      expect(browserServicesMock.commonService.apiCaller).toBeCalledWith({
        endpoint: "transport.request",
        data: {
          path: `/source-index/_split/split_test_index-split?wait_for_completion=false`,
          method: "PUT",
          body: {
            settings: {
              "index.number_of_shards": "4",
              "index.number_of_replicas": "1",
            },
          },
        },
      });
    });
  });

  it("Successful split an index whose shards number is 1", async () => {
    browserServicesMock.commonService.apiCaller = jest.fn(
      async (payload): Promise<any> => {
        if (payload.endpoint === "cat.aliases") {
          return {
            ok: true,
            response: [
              {
                alias: "testAlias",
                index: "1",
              },
            ] as IAlias[],
          };
        } else if (payload.endpoint === "cat.indices") {
          return {
            ok: true,
            response: [
              {
                health: "green",
                status: "open",
                index: sourceIndexName,
                pri: "1",
                rep: "0",
              },
            ],
          };
        }

        return {
          ok: true,
        };
      }
    );

    const { getByTestId, getByText } = renderWithRouter([`${ROUTES.SPLIT_INDEX}?source=$(sourceIndexName)`]);

    await waitFor(() => {
      expect(getByTestId("splitButton")).not.toBeDisabled();
    });

    expect(getByText("The number must be an integer greater than 1 but fewer or equal to 1024.")).not.toBeNull();
    userEvent.type(getByTestId("targetIndexNameInput"), "split_test_index-split");
    userEvent.type(
      getByTestId("numberOfShardsInput").querySelector('[data-test-subj="comboBoxSearchInput"]') as Element,
      "5{arrowdown}{enter}"
    );
    userEvent.clear(getByTestId("numberOfReplicasInput"));
    userEvent.type(getByTestId("numberOfReplicasInput"), "1");
    userEvent.click(getByTestId("splitButton"));

    await waitFor(() => {
      expect(browserServicesMock.commonService.apiCaller).toBeCalledWith({
        endpoint: "transport.request",
        data: {
          path: `/source-index/_split/split_test_index-split?wait_for_completion=false`,
          method: "PUT",
          body: {
            settings: {
              "index.number_of_shards": "5",
              "index.number_of_replicas": "1",
            },
          },
        },
      });
    });
  });

  it("Error message if number of shards is invalid", async () => {
    browserServicesMock.commonService.apiCaller = jest.fn(
      async (payload): Promise<any> => {
        if (payload.endpoint === "cat.aliases") {
          return {
            ok: true,
            response: [
              {
                alias: "testAlias",
                index: "1",
              },
            ] as IAlias[],
          };
        } else if (payload.endpoint === "cat.indices") {
          return {
            ok: true,
            response: [
              {
                health: "green",
                status: "open",
                index: sourceIndexName,
                pri: "3",
                rep: "0",
              },
            ],
          };
        }

        return {
          ok: true,
        };
      }
    );

    const { getByTestId, getByText } = renderWithRouter([`${ROUTES.SPLIT_INDEX}?source=$(sourceIndexName)`]);

    await waitFor(() => {
      expect(getByTestId("splitButton")).not.toBeDisabled();
    });

    userEvent.type(
      getByTestId("numberOfShardsInput").querySelector('[data-test-subj="comboBoxSearchInput"]') as Element,
      "5{arrowdown}{enter}"
    );
    userEvent.click(getByTestId("splitButton"));

    await waitFor(() => {
      expect(getByText("Number of shards is required")).not.toBeNull();
    });
  });

  it("Error message if index name or number of shards is not specified", async () => {
    const { getByTestId, getByText } = renderWithRouter([`${ROUTES.SPLIT_INDEX}?source=$(sourceIndexName)`]);

    await waitFor(() => {
      expect(getByTestId("splitButton")).not.toBeDisabled();
    });

    userEvent.click(getByTestId("splitButton"));

    await waitFor(() => {
      expect(getByText("Target index name is required")).not.toBeNull();
      expect(getByText("Number of shards is required")).not.toBeNull();
    });
  });

  it("Error message if index name is invalid", async () => {
    const { getByTestId, getByText } = renderWithRouter([`${ROUTES.SPLIT_INDEX}?source=$(sourceIndexName)`]);

    await waitFor(() => {
      expect(getByTestId("splitButton")).not.toBeDisabled();
    });

    userEvent.type(getByTestId("targetIndexNameInput"), "s*lit");
    userEvent.click(getByTestId("splitButton"));

    await waitFor(() => {
      expect(getByText("Target index name s*lit is invalid")).not.toBeNull();
    });
  });

  it("Red Index is not ready for split", async () => {
    browserServicesMock.commonService.apiCaller = jest.fn(
      async (payload): Promise<any> => {
        if (payload.endpoint === "cat.indices") {
          return {
            ok: true,
            response: [
              {
                health: "red",
                status: "open",
                index: sourceIndexName,
                pri: "1",
                rep: "0",
                "docs.count": "1",
                "docs.deleted": "0",
                "store.size": "5.2kb",
                "pri.store.size": "5.2kb",
              },
            ],
          };
        }

        return {
          ok: true,
        };
      }
    );

    const { getByTestId, queryByText } = renderWithRouter([`${ROUTES.SPLIT_INDEX}?source=$(sourceIndexName)`]);

    await waitFor(() => {
      expect(getByTestId("splitButton")).toBeDisabled();
      expect(queryByText("The source index must not have a Red health status.")).not.toBeNull();
    });
  });

  it("Closed Index is not ready for split", async () => {
    browserServicesMock.commonService.apiCaller = jest.fn(
      async (payload): Promise<any> => {
        if (payload.endpoint === "cat.indices") {
          return {
            ok: true,
            response: [
              {
                health: "green",
                status: "close",
                index: sourceIndexName,
                pri: "2",
                rep: "0",
                "docs.count": "1",
                "docs.deleted": "0",
                "store.size": "5.2kb",
                "pri.store.size": "5.2kb",
              },
            ],
          };
        } else if (payload.endpoint === "transport.request") {
          return {
            ok: true,
            response: [{}],
          };
        }

        return {
          ok: true,
        };
      }
    );

    const { getByTestId, queryByText } = renderWithRouter([`${ROUTES.SPLIT_INDEX}?source=$(sourceIndexName)`]);

    await waitFor(() => {
      expect(getByTestId("splitButton")).toBeDisabled();
      expect(queryByText("The source index must be open.")).not.toBeNull();
    });
    userEvent.click(getByTestId("open-index-button"));
    await waitFor(() => {});
    expect(browserServicesMock.commonService.apiCaller).toBeCalledWith({
      endpoint: "transport.request",
      data: {
        method: "POST",
        path: `/$(sourceIndexName)/_open?wait_for_completion=false`,
      },
    });
  });

  it("blocks.write is not set to true, Index is not ready for split", async () => {
    browserServicesMock.commonService.apiCaller = jest.fn(
      async (payload): Promise<any> => {
        if (payload.endpoint === "cat.indices") {
          return {
            ok: true,
            response: [
              {
                health: "green",
                status: "open",
                index: sourceIndexName,
                pri: "1",
                rep: "0",
                "docs.count": "1",
                "docs.deleted": "0",
                "store.size": "5.2kb",
                "pri.store.size": "5.2kb",
              },
            ],
          };
        } else if (payload.endpoint === "indices.getSettings") {
          return {
            ok: true,
            response: {
              [sourceIndexName]: {
                settings: {
                  "index.blocks.write": "false",
                },
              },
            },
          };
        } else if (payload.endpoint === "indices.putSettings") {
          return {
            ok: true,
            response: [{}],
          };
        }
      }
    );

    const { getByTestId, queryByText } = renderWithRouter([`${ROUTES.SPLIT_INDEX}?source=$(sourceIndexName)`]);

    await waitFor(() => {
      expect(getByTestId("splitButton")).toBeDisabled();
      expect(queryByText("The source index must block write operations before splitting.")).not.toBeNull();
    });

    userEvent.click(getByTestId("set-indexsetting-button"));
    await waitFor(() =>
      expect(browserServicesMock.commonService.apiCaller).toBeCalledWith({
        endpoint: "indices.putSettings",
        method: "PUT",
        data: {
          index: "source-index",
          flat_settings: true,
          body: {
            settings: {
              "index.blocks.write": "true",
            },
          },
        },
      })
    );
  });

  it("blocks.write is not set, Index is not ready for split", async () => {
    browserServicesMock.commonService.apiCaller = jest.fn(
      async (payload): Promise<any> => {
        if (payload.endpoint === "cat.indices") {
          return {
            ok: true,
            response: [
              {
                health: "green",
                status: "open",
                index: sourceIndexName,
                pri: "1",
                rep: "0",
                "docs.count": "1",
                "docs.deleted": "0",
                "store.size": "5.2kb",
                "pri.store.size": "5.2kb",
              },
            ],
          };
        } else if (payload.endpoint === "indices.getSettings") {
          return {
            ok: true,
            response: {
              [sourceIndexName]: {
                settings: {},
              },
            },
          };
        } else if (payload.endpoint === "indices.putSettings") {
          return {
            ok: true,
            response: [{}],
          };
        }
      }
    );

    const { getByTestId, queryByText } = renderWithRouter([`${ROUTES.SPLIT_INDEX}?source=$(sourceIndexName)`]);

    await waitFor(() => {
      expect(getByTestId("splitButton")).toBeDisabled();
      expect(queryByText("The source index must block write operations before splitting.")).not.toBeNull();
    });

    userEvent.click(getByTestId("set-indexsetting-button"));
    await waitFor(() =>
      expect(browserServicesMock.commonService.apiCaller).toBeCalledWith({
        endpoint: "indices.putSettings",
        method: "PUT",
        data: {
          index: "source-index",
          flat_settings: true,
          body: {
            settings: {
              "index.blocks.write": "true",
            },
          },
        },
      })
    );
  });

  it("Cancel works", async () => {
    const { getByTestId, getByText } = renderWithRouter([`${ROUTES.SPLIT_INDEX}?source=index-source`]);
    await waitFor(() => {});
    userEvent.click(getByTestId("splitCancelButton"));

    expect(getByText(`location is: ${ROUTES.INDICES}`)).toBeInTheDocument();
  });
});
