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
import { ROUTES } from "../../../../utils/constants";
import { CoreServicesConsumer, CoreServicesContext } from "../../../../components/core_services";
import { ServicesConsumer, ServicesContext } from "../../../../services";
import { IAlias } from "../../../Aliases/interface";
import { BrowserServices } from "../../../../models/interfaces";
import { ModalProvider, ModalRoot } from "../../../../components/Modal";
import { CoreStart } from "opensearch-dashboards/public";

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

beforeEach(() => {
  browserServicesMock.commonService.apiCaller = jest.fn(async (payload) => {
    if (payload.endpoint === "cat.aliases") {
      return {
        ok: true,
        response: [
          {
            alias: "testAlias",
            index: "1",
          },
          {
            alias: "multiIndexAlias",
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
            "docs.count": "1",
            "docs.deleted": "0",
            "store.size": "5.2kb",
            "pri.store.size": "5.2kb",
          },
        ],
      };
    } else if (payload.endpoint === "indices.split") {
      return {
        ok: true,
        response: [{}],
      };
    }

    return {
      ok: true,
    };
  }) as any;
  window.location.hash = "/";
});

describe("<SplitIndex /> spec", () => {
  it("renders the component", async () => {
    renderWithRouter([`${ROUTES.SPLIT_INDEX}?source=index-source`]);

    await waitFor(() => {
      expect(document.body.children).toMatchSnapshot();
    });
  });

  it("Successful split an index whose shards number is greater than 1", async () => {
    const { getByTestId } = renderWithRouter([`${ROUTES.SPLIT_INDEX}?source=$(sourceIndexName)`]);

    await waitFor(() => {
      expect(getByTestId("splitButton")).not.toBeDisabled();
    });

    userEvent.type(getByTestId("targetIndexNameInput"), "split_test_index-split");
    userEvent.type(getByTestId("numberOfShardsInput").querySelector('[data-test-subj="comboBoxSearchInput"]') as Element, "3{enter}");
    userEvent.type(getByTestId("numberOfReplicasInput"), "1");
    userEvent.click(getByTestId("splitButton"));
    /*
    await waitFor(
      () => {
        expect(browserServicesMock.commonService.apiCaller).toBeCalledWith({
          endpoint: "indices.split",
        });
      },
      { timeout: 2000 }
    );
 */
  }, 15000);

  it("Successful split an index whose shards number is 1", async () => {
    browserServicesMock.commonService.apiCaller = jest.fn(async (payload) => {
      if (payload.endpoint === "cat.aliases") {
        return {
          ok: true,
          response: [
            {
              alias: "testAlias",
              index: "1",
            },
            {
              alias: "multiIndexAlias",
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
    });

    const { getByTestId } = renderWithRouter([`${ROUTES.SPLIT_INDEX}?source=$(sourceIndexName)`]);

    await waitFor(() => {
      expect(getByTestId("splitButton")).not.toBeDisabled();
    });

    userEvent.type(getByTestId("targetIndexNameInput"), "split_test_index-split");
    userEvent.type(getByTestId("numberOfShardsInput").querySelector('[data-test-subj="comboBoxSearchInput"]') as Element, "5{enter}");
    userEvent.type(getByTestId("numberOfReplicasInput"), "1");
    userEvent.click(getByTestId("splitButton"));

    /*
        await waitFor(
          () => {
            expect(browserServicesMock.commonService.apiCaller).toBeCalledWith({
              endpoint: "indices.split",
            });
          },
          { timeout: 2000 }
        );
     */
  }, 15000); // set timeout to 15s to overwrite the default 10s because this case takes a little long

  it("Error message if index name or number of shards is not specified", async () => {
    const { getByTestId, getByText } = renderWithRouter([`${ROUTES.SPLIT_INDEX}?source=$(sourceIndexName)`]);

    await waitFor(() => {
      expect(getByTestId("splitButton")).not.toBeDisabled();
    });

    userEvent.click(getByTestId("splitButton"));

    await waitFor(() => {
      expect(getByText("Target Index Name is required")).not.toBeNull();
      expect(getByText("Number of shards is required")).not.toBeNull();
    });
  });

  it("Red Index is not ready for split", async () => {
    browserServicesMock.commonService.apiCaller = jest.fn(async (payload) => {
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
    });

    const { getByTestId, queryByText } = renderWithRouter([`${ROUTES.SPLIT_INDEX}?source=$(sourceIndexName)`]);

    await waitFor(() => {
      expect(getByTestId("splitButton")).toBeDisabled();
      expect(queryByText("It must not have a Red health status.")).not.toBeNull();
    });
  });

  it("Closed Index is not ready for split", async () => {
    browserServicesMock.commonService.apiCaller = jest.fn(async (payload) => {
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
      } else if (payload.endpoint === "indices.open") {
        return {
          ok: true,
          response: [{}],
        };
      }

      return {
        ok: true,
      };
    });

    const { getByTestId, queryByText } = renderWithRouter([`${ROUTES.SPLIT_INDEX}?source=$(sourceIndexName)`]);

    await waitFor(() => {
      expect(getByTestId("splitButton")).toBeDisabled();
      expect(queryByText("It must not be in close status.")).not.toBeNull();
    });
    userEvent.click(getByTestId("open-index-button"));
    await waitFor(() => {});
    expect(browserServicesMock.commonService.apiCaller).toBeCalledWith({
      endpoint: "cat.indices",
      /*
      data: {
        index: sourceIndexName,
      },

       */
    });
  });

  it("blocks.write is not set to true, Index is not ready for split", async () => {
    browserServicesMock.commonService.apiCaller = jest.fn(async (payload) => {
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
    });

    const { getByTestId, queryByText } = renderWithRouter([`${ROUTES.SPLIT_INDEX}?source=$(sourceIndexName)`]);

    await waitFor(() => {
      expect(getByTestId("splitButton")).toBeDisabled();
      expect(queryByText("It's block write status must be set to true.")).not.toBeNull();
    });

    userEvent.click(getByTestId("set-indexsetting-button"));
    //expect(setIndexSettings).toBeCalledTimes(1);
  });

  it("blocks.write is not set, Index is not ready for split", async () => {
    browserServicesMock.commonService.apiCaller = jest.fn(async (payload) => {
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
        console.log("xluo");
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
    });

    const { getByTestId, queryByText } = renderWithRouter([`${ROUTES.SPLIT_INDEX}?source=$(sourceIndexName)`]);

    await waitFor(() => {
      expect(getByTestId("splitButton")).toBeDisabled();
      expect(queryByText("It's block write status must be set to true.")).not.toBeNull();
    });

    userEvent.click(getByTestId("set-indexsetting-button"));
    await waitFor(
      () =>
        expect(browserServicesMock.commonService.apiCaller).toBeCalledWith({
          endpoint: "indices.putSettings",
        }),
      {
        timeout: 3000,
      }
    );
  });

  it("Cancel works", async () => {
    const { getByTestId, getByText } = renderWithRouter([`${ROUTES.SPLIT_INDEX}?source=index-source`]);
    await waitFor(() => {});
    userEvent.click(getByTestId("splitCancelButton"));

    expect(getByText(`location is: ${ROUTES.INDICES}`)).toBeInTheDocument();
  });
});
