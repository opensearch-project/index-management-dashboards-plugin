/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { render, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, RouteComponentProps, Switch } from "react-router-dom";
import { MemoryRouter as Router } from "react-router-dom";
import { CoreStart } from "opensearch-dashboards/public";
import { browserServicesMock, coreServicesMock } from "../../../../../test/mocks";
import { ServicesConsumer, ServicesContext } from "../../../../services";
import { BREADCRUMBS, ROUTES } from "../../../../utils/constants";
import { CoreServicesConsumer, CoreServicesContext } from "../../../../components/core_services";
import Reindex from "./Reindex";
import { ModalProvider, ModalRoot } from "../../../../components/Modal";
import { BrowserServices } from "../../../../models/interfaces";

function renderWithRouter(initialEntries = [ROUTES.REINDEX] as string[]) {
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
                              path={ROUTES.REINDEX}
                              render={(props: RouteComponentProps) => (
                                <Reindex {...props} indexService={services?.indexService} commonService={services.commonService} />
                              )}
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
    index: "index-source",
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
    index: "index-dest",
    pri: "1",
    "pri.store.size": "100KB",
    rep: "0",
    status: "open",
    "store.size": "100KB",
    uuid: "some_uuid",
  },
];

const dataStreams = [
  {
    name: "log-redis-daily",
    timestamp_field: "@timestamp",
    indices: [".ds-log-redis-daily-000001", ".ds-log-redis-daily-000002"],
    generation: 2,
    status: "GREEN",
    template: "",
  },
];

const aliases = [
  {
    alias: "alias-1",
    index: "index-source",
    filter: "-",
    is_write_index: "-",
    "routing.index": "-",
    "routing.search": "-",
  },
];

const mockApi = () => {
  browserServicesMock.indexService.getIndices = jest.fn().mockImplementation((args) => ({
    ok: true,
    response: { indices: args.search.length > 0 ? indices.filter((index) => index.index.startsWith(args.search)) : indices },
  }));

  browserServicesMock.indexService.getDataStreams = jest.fn().mockResolvedValue({
    ok: true,
    response: { dataStreams: dataStreams, totalDataStreams: 1 },
  });
  browserServicesMock.indexService.getAliases = jest.fn().mockResolvedValue({
    ok: true,
    response: { aliases: aliases, totalAliases: 1 },
  });

  browserServicesMock.commonService.apiCaller = jest.fn().mockImplementation((args) => {
    if (args.endpoint === "transport.request") {
      if (args.data.path.startsWith("_reindex")) {
        return Promise.resolve({
          ok: true,
          response: {
            task: "some task id",
          },
        });
      }
    } else if (args.endpoint === "indices.getFieldMapping") {
      return Promise.resolve({
        ok: true,
        response: {
          "index-source": {
            mappings: {
              _source: {
                full_name: "_source",
                mapping: {
                  _source: {
                    enabled: true,
                  },
                },
              },
            },
          },
        },
      });
    } else if (args.endpoint === "ingest.getPipeline") {
      return Promise.resolve({
        ok: true,
        response: {
          bumpOrderId: {
            description: "bump order id to add 200 prefix",
            processors: [
              {
                set: {
                  field: "order_id",
                  value: "200{{order_id}}",
                },
              },
            ],
          },
        },
      });
    }
    return Promise.resolve({ ok: true });
  });
};

describe("<Reindex /> spec", () => {
  it("renders the component", async () => {
    mockApi();
    const { container } = renderWithRouter();
    expect(container.firstChild).toMatchSnapshot();
  });

  it("set breadcrumbs when mounting", async () => {
    mockApi();
    renderWithRouter();

    expect(coreServicesMock.chrome.setBreadcrumbs).toHaveBeenCalledTimes(1);
    expect(coreServicesMock.chrome.setBreadcrumbs).toHaveBeenCalledWith([
      BREADCRUMBS.INDEX_MANAGEMENT,
      BREADCRUMBS.INDICES,
      BREADCRUMBS.REINDEX,
    ]);
  });

  it("cancel back to indices page", async () => {
    mockApi();
    const { getByText } = renderWithRouter();
    await waitFor(() => {});
    userEvent.click(getByText("Cancel"));
    await waitFor(() => {
      expect(getByText(`location is: ${ROUTES.INDICES}`)).toBeInTheDocument();
    });
  });

  it("auto populate source from search query", async () => {
    mockApi();
    const { getByTestId } = renderWithRouter([`${ROUTES.REINDEX}?source=index-source`]);

    await waitFor(() => {
      let sourceName = getByTestId("sourceSelector").querySelector(".euiBadge__text") as Element;
      expect(sourceName.textContent).toBe("index-source");
    });
  });

  it("source is required", async () => {
    mockApi();
    const { getByText } = renderWithRouter();

    await waitFor(() => {
      getByText("Configure source index");
    });

    userEvent.click(getByText("Execute"));

    expect(getByText("Source is required")).toBeInTheDocument();
  });

  it("source status is closed", async () => {
    mockApi();
    browserServicesMock.indexService.getIndices = jest.fn().mockResolvedValue({
      ok: true,
      response: {
        indices: [
          {
            "docs.count": 5,
            "docs.deleted": 2,
            health: "green",
            index: "index-source-closed",
            pri: "1",
            "pri.store.size": "100KB",
            rep: "0",
            status: "close",
            "store.size": "100KB",
            uuid: "some_uuid",
          },
        ],
      },
    });
    const { getByText, getAllByTestId } = renderWithRouter();

    await waitFor(() => {
      getByText("Configure source index");
    });

    await userEvent.type(getAllByTestId("comboBoxSearchInput")[0], "index-source-closed");
    fireEvent.keyDown(getAllByTestId("comboBoxSearchInput")[0], { key: "ArrowDown", code: "ArrowDown" });
    fireEvent.keyDown(getAllByTestId("comboBoxSearchInput")[0], { key: "Enter", code: "Enter" });

    userEvent.click(getByText("Execute"));

    await waitFor(() => {});

    await waitFor(() => {
      expect(getByText("Index [index-source-closed] status is closed")).toBeInTheDocument();
    });
  });

  it("source status is red", async () => {
    mockApi();
    browserServicesMock.indexService.getIndices = jest.fn().mockResolvedValue({
      ok: true,
      response: {
        indices: [
          {
            "docs.count": 5,
            "docs.deleted": 2,
            health: "red",
            index: "index-source-red",
            pri: "1",
            "pri.store.size": "100KB",
            rep: "0",
            status: "open",
            "store.size": "100KB",
            uuid: "some_uuid",
          },
        ],
      },
    });
    const { getByText, getAllByTestId } = renderWithRouter();

    await waitFor(() => {
      getByText("Configure source index");
    });

    await userEvent.type(getAllByTestId("comboBoxSearchInput")[0], "index-source-red");
    fireEvent.keyDown(getAllByTestId("comboBoxSearchInput")[0], { key: "ArrowDown", code: "ArrowDown" });
    fireEvent.keyDown(getAllByTestId("comboBoxSearchInput")[0], { key: "Enter", code: "Enter" });

    userEvent.click(getByText("Execute"));

    await waitFor(() => {}, { timeout: 4000 });

    await waitFor(() => {
      expect(getByText("Index [index-source-red] health status is red")).toBeInTheDocument();
    });
  });

  it("source index _source is not enabled", async () => {
    mockApi();
    browserServicesMock.commonService.apiCaller = jest.fn().mockImplementation((args) => {
      if (args.endpoint === "indices.getFieldMapping") {
        return Promise.resolve({
          ok: true,
          response: {
            "index-source": {
              mappings: {
                _source: {
                  full_name: "_source",
                  mapping: {
                    _source: {
                      enabled: false,
                    },
                  },
                },
              },
            },
          },
        });
      }
    });
    const { getByText, getAllByTestId } = renderWithRouter();

    await waitFor(() => {
      getByText("Configure source index");
    });

    await userEvent.type(getAllByTestId("comboBoxSearchInput")[0], "index-source");
    fireEvent.keyDown(getAllByTestId("comboBoxSearchInput")[0], { key: "ArrowDown", code: "ArrowDown" });
    fireEvent.keyDown(getAllByTestId("comboBoxSearchInput")[0], { key: "Enter", code: "Enter" });

    userEvent.click(getByText("Execute"));

    await waitFor(() => {}, { timeout: 4000 });

    await waitFor(() => {
      expect(getByText("Index [index-source] _sources is not enabled")).toBeInTheDocument();
    });
  });

  it("destination is required", async () => {
    mockApi();
    const { getByText, getAllByTestId } = renderWithRouter();

    await waitFor(() => {
      getByText("Configure source index");
    });
    userEvent.type(getAllByTestId("comboBoxSearchInput")[0], "index-source");
    await waitFor(() => {});
    fireEvent.keyDown(getAllByTestId("comboBoxSearchInput")[0], { key: "ArrowDown", code: "ArrowDown" });
    fireEvent.keyDown(getAllByTestId("comboBoxSearchInput")[0], { key: "Enter", code: "Enter" });
    await waitFor(() => {});

    userEvent.click(getByText("Execute"));

    await waitFor(() => {
      expect(getByText("Destination is required")).toBeInTheDocument();
    });
  });

  it("destination is closed", async () => {
    mockApi();
    const { getByText, getAllByTestId } = renderWithRouter();

    await waitFor(() => {
      getByText("Configure source index");
    });
    userEvent.type(getAllByTestId("comboBoxSearchInput")[0], "index-source");
    await waitFor(() => {});
    fireEvent.keyDown(getAllByTestId("comboBoxSearchInput")[0], { key: "ArrowDown", code: "ArrowDown" });
    fireEvent.keyDown(getAllByTestId("comboBoxSearchInput")[0], { key: "Enter", code: "Enter" });
    await waitFor(() => {});

    browserServicesMock.indexService.getIndices = jest.fn().mockResolvedValue({
      ok: true,
      response: {
        indices: [
          {
            "docs.count": 5,
            "docs.deleted": 2,
            health: "green",
            index: "index-dest",
            pri: "1",
            "pri.store.size": "100KB",
            rep: "0",
            status: "close",
            "store.size": "100KB",
            uuid: "some_uuid",
          },
        ],
      },
    });

    await userEvent.type(getAllByTestId("comboBoxSearchInput")[1], "index-dest");
    await waitFor(() => {});
    fireEvent.keyDown(getAllByTestId("comboBoxSearchInput")[1], { key: "ArrowDown", code: "ArrowDown" });
    fireEvent.keyDown(getAllByTestId("comboBoxSearchInput")[1], { key: "Enter", code: "Enter" });
    await waitFor(() => {});

    userEvent.click(getByText("Execute"));

    await waitFor(() => {
      expect(getByText("Index [index-dest] status is closed")).toBeInTheDocument();
    });
  });

  it("destination health status is red", async () => {
    mockApi();
    const { getByText, getAllByTestId } = renderWithRouter();

    await waitFor(() => {
      getByText("Configure source index");
    });
    userEvent.type(getAllByTestId("comboBoxSearchInput")[0], "index-source");
    await waitFor(() => {});
    fireEvent.keyDown(getAllByTestId("comboBoxSearchInput")[0], { key: "ArrowDown", code: "ArrowDown" });
    fireEvent.keyDown(getAllByTestId("comboBoxSearchInput")[0], { key: "Enter", code: "Enter" });
    await waitFor(() => {});

    browserServicesMock.indexService.getIndices = jest.fn().mockResolvedValue({
      ok: true,
      response: {
        indices: [
          {
            "docs.count": 5,
            "docs.deleted": 2,
            health: "red",
            index: "index-dest",
            pri: "1",
            "pri.store.size": "100KB",
            rep: "0",
            status: "open",
            "store.size": "100KB",
            uuid: "some_uuid",
          },
        ],
      },
    });

    await userEvent.type(getAllByTestId("comboBoxSearchInput")[1], "index-dest");
    await waitFor(() => {});
    fireEvent.keyDown(getAllByTestId("comboBoxSearchInput")[1], { key: "ArrowDown", code: "ArrowDown" });
    fireEvent.keyDown(getAllByTestId("comboBoxSearchInput")[1], { key: "Enter", code: "Enter" });
    await waitFor(() => {});

    userEvent.click(getByText("Execute"));

    await waitFor(() => {
      expect(getByText("Index [index-dest] health status is red")).toBeInTheDocument();
    });
  });

  it("slices format validation", async () => {
    mockApi();
    const { getByText, getAllByTestId, getByTestId } = renderWithRouter();

    await waitFor(() => {
      getByText("Configure source index");
    });
    userEvent.type(getAllByTestId("comboBoxSearchInput")[0], "index-source");
    await waitFor(() => {});
    fireEvent.keyDown(getAllByTestId("comboBoxSearchInput")[0], { key: "ArrowDown", code: "ArrowDown" });
    fireEvent.keyDown(getAllByTestId("comboBoxSearchInput")[0], { key: "Enter", code: "Enter" });
    await waitFor(() => {});

    await userEvent.type(getAllByTestId("comboBoxSearchInput")[1], "index-dest");
    await waitFor(() => {});
    fireEvent.keyDown(getAllByTestId("comboBoxSearchInput")[1], { key: "ArrowDown", code: "ArrowDown" });
    fireEvent.keyDown(getAllByTestId("comboBoxSearchInput")[1], { key: "Enter", code: "Enter" });
    await waitFor(() => {});

    // open advanced settings
    userEvent.click(getByTestId("advanceOptionToggle"));
    // slices
    userEvent.type(getByTestId("slices"), "not a number");

    userEvent.click(getByText("Execute"));

    await waitFor(() => {
      expect(getByText("Slices must be positive integer or auto")).toBeInTheDocument();
    });
  });

  it("it goes to indices page when submit reindex successfully", async () => {
    mockApi();
    const { getByText, getAllByTestId, getByTestId } = renderWithRouter();

    await waitFor(() => {
      getByText("Configure source index");
    });

    await userEvent.type(getAllByTestId("comboBoxSearchInput")[0], "index-source");
    await waitFor(() => {});
    fireEvent.keyDown(getAllByTestId("comboBoxSearchInput")[0], { key: "ArrowDown", code: "ArrowDown" });
    fireEvent.keyDown(getAllByTestId("comboBoxSearchInput")[0], { key: "Enter", code: "Enter" });
    await waitFor(() => {});

    await userEvent.type(getAllByTestId("comboBoxSearchInput")[1], "index-dest");
    await waitFor(() => {});
    fireEvent.keyDown(getAllByTestId("comboBoxSearchInput")[1], { key: "ArrowDown", code: "ArrowDown" });
    fireEvent.keyDown(getAllByTestId("comboBoxSearchInput")[1], { key: "Enter", code: "Enter" });
    await waitFor(() => {});

    // click advances settings
    userEvent.click(getByTestId("advanceOptionToggle"));

    // select pipeline
    await userEvent.type(getAllByTestId("comboBoxSearchInput")[2], "bumpOrderId");
    await waitFor(() => {});
    fireEvent.keyDown(getAllByTestId("comboBoxSearchInput")[2], { key: "ArrowDown", code: "ArrowDown" });
    fireEvent.keyDown(getAllByTestId("comboBoxSearchInput")[2], { key: "Enter", code: "Enter" });
    await waitFor(() => {});

    userEvent.click(getByText("Execute"));

    await waitFor(() => {
      expect(getByText(`location is: ${ROUTES.INDICES}`)).toBeInTheDocument();
    });
  });

  it("call api failed", async () => {
    mockApi();
    browserServicesMock.indexService.getIndices = jest.fn().mockResolvedValue({
      ok: false,
      error: "service not available",
    });
    const { getByText } = renderWithRouter();

    await waitFor(() => {
      getByText("Configure source index");
    });

    userEvent.click(getByText("Execute"));

    expect(coreServicesMock.notifications.toasts.addDanger).toBeCalled();
  });

  it("show subset query editor", async () => {
    mockApi();
    const { getByText, getByTestId } = renderWithRouter();

    await waitFor(() => {
      getByText("Configure source index");
    });

    // click subset radio
    userEvent.click(getByText("Reindex a subset of documents (advanced)"));

    expect(getByTestId("queryJsonEditor")).toBeVisible();
  });

  it("advance settings toggle", async () => {
    mockApi();
    const { getByText, getByTestId } = renderWithRouter();

    await waitFor(() => {
      getByText("Configure source index");
    });

    // click advances settings
    userEvent.click(getByTestId("advanceOptionToggle"));
    // setting is open
    expect(getByText("Pipeline")).toBeInTheDocument();

    expect(browserServicesMock.commonService.apiCaller).toBeCalledWith({
      endpoint: "ingest.getPipeline",
    });
  });
});
