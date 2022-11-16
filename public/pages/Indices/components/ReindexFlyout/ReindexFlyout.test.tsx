/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { screen, render, waitFor, act } from "@testing-library/react";
import { browserServicesMock, coreServicesMock } from "../../../../../test/mocks";
import ReindexFlyout from "./ReindexFlyout";
import { CoreServicesContext } from "../../../../components/core_services";
import { ServicesContext } from "../../../../services";
import userEvent from "@testing-library/user-event";
import { ManagedCatIndex } from "../../../../../server/models/interfaces";

const indexResNormal = {
  ok: true,
  response: {
    dataStreams: ["test-ds-01"],
    indices: ["test-index-01", "test-index-02"],
  },
};

const fileMappingResNormal = {
  ok: true,
  response: {
    "test-index-01": {
      mappings: {
        _source: {
          full_name: "_source",
          mapping: {},
        },
      },
    },
  },
};

const allPipelines = {
  "bump-orderId": {
    description: "Bump orderId",
    processors: [{ set: { field: "order_id", value: "200{{order_id}}" } }],
  },
};

const selectedItem: ManagedCatIndex[] = [
  {
    "docs.count": "5",
    "docs.deleted": "2",
    health: "green",
    index: "test-index-01",
    pri: "1",
    "pri.store.size": "100KB",
    rep: "0",
    status: "open",
    "store.size": "100KB",
    uuid: "some_uuid",
    managed: "false",
    managedPolicy: "",
    data_stream: "",
  },
];

const closedItem: ManagedCatIndex[] = [
  {
    "docs.count": "5",
    "docs.deleted": "2",
    health: "green",
    index: "test-index-01",
    pri: "1",
    "pri.store.size": "100KB",
    rep: "0",
    status: "close",
    "store.size": "100KB",
    uuid: "some_uuid",
    managed: "false",
    managedPolicy: "",
    data_stream: "",
  },
];

function mockIndexService(indexRes: Object) {
  browserServicesMock.indexService.getDataStreamsAndIndicesNames = jest.fn().mockResolvedValue(indexRes);
}

function mockCommonService(filedMapping?: Object, pipelines?: Object) {
  browserServicesMock.commonService.apiCaller = jest.fn().mockImplementation((args) => {
    if (args.endpoint === "ingest.getPipeline") {
      return Promise.resolve(pipelines ? pipelines : allPipelines);
    } else if (args.endpoint === "indices.getFieldMapping") {
      return Promise.resolve(filedMapping ? filedMapping : fileMappingResNormal);
    } else if (args.endpoint === "indices.create") {
      return Promise.resolve({ ok: true });
    } else if (args.endpoint === "indices.get") {
      return Promise.resolve({
        ok: true,
        response: {
          "test-index-01": {
            settings: {
              index: {
                creation_date: "1667810388377",
                number_of_shards: "2",
                number_of_replicas: "0",
                uuid: "T4go6tUERSW6-DSBml_wsw",
                version: { created: "136257827" },
                provided_name: "test-index-01",
              },
            },
          },
        },
      });
    } else if (args.endpoint === "cat.indices") {
      return Promise.resolve({ ok: true, response: selectedItem });
    }
    return Promise.resolve({ ok: true });
  });
}

describe("<ReindexFlyout /> spec", () => {
  it("renders the component", async () => {
    mockIndexService(indexResNormal);
    mockCommonService(fileMappingResNormal);

    let component = await act(async () => {
      render(
        <CoreServicesContext.Provider value={coreServicesMock}>
          <ServicesContext.Provider value={browserServicesMock}>
            <ReindexFlyout
              onCloseFlyout={() => {}}
              onReindexConfirm={() => {}}
              services={browserServicesMock}
              sourceIndices={selectedItem}
              getIndices={() => Promise.resolve()}
              openIndex={() => Promise.resolve()}
            />
          </ServicesContext.Provider>
        </CoreServicesContext.Provider>
      );
    });

    expect(component).toMatchSnapshot();
  });

  it("successfully calls search indices on mount", async () => {
    mockIndexService(indexResNormal);
    mockCommonService(fileMappingResNormal);

    const spy = jest.spyOn(browserServicesMock.indexService, "getDataStreamsAndIndicesNames");

    await act(async () => {
      render(
        <CoreServicesContext.Provider value={coreServicesMock}>
          <ServicesContext.Provider value={browserServicesMock}>
            <ReindexFlyout
              onCloseFlyout={() => {}}
              onReindexConfirm={() => {}}
              services={browserServicesMock}
              sourceIndices={selectedItem}
              getIndices={() => Promise.resolve()}
              openIndex={() => Promise.resolve()}
            />
          </ServicesContext.Provider>
        </CoreServicesContext.Provider>
      );
    });

    // wait 1 tick for the searchPolicies promise to resolve
    await waitFor(() => {});

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith("");

    expect(coreServicesMock.notifications.toasts.addDanger).not.toHaveBeenCalled();
  });

  it("successfully call source validation & get pipelines on mount", async () => {
    mockIndexService(indexResNormal);
    mockCommonService(fileMappingResNormal);

    const spy = jest.spyOn(browserServicesMock.commonService, "apiCaller");
    await act(async () => {
      render(
        <CoreServicesContext.Provider value={coreServicesMock}>
          <ServicesContext.Provider value={browserServicesMock}>
            <ReindexFlyout
              onCloseFlyout={() => {}}
              onReindexConfirm={() => {}}
              services={browserServicesMock}
              sourceIndices={selectedItem}
              getIndices={() => Promise.resolve()}
              openIndex={() => Promise.resolve()}
            />
          </ServicesContext.Provider>
        </CoreServicesContext.Provider>
      );
    });

    // wait 1 tick for the searchPolicies promise to resolve
    await waitFor(() => {});

    expect(spy).toHaveBeenCalledTimes(3);
    expect(spy).toHaveBeenCalledWith({
      endpoint: "cat.indices",
      data: {
        index: ["test-index-01"],
        format: "json",
      },
    });
    expect(spy).toHaveBeenCalledWith({
      endpoint: "indices.getFieldMapping",
      data: {
        fields: "_source",
        index: "test-index-01",
      },
    });

    expect(spy).toHaveBeenCalledWith({
      endpoint: "ingest.getPipeline",
    });
  });

  it("call _source enabled check fail on mount", async () => {
    mockIndexService(indexResNormal);
    // call validation failed
    mockCommonService({ ok: false, response: null });

    const spy = jest.spyOn(browserServicesMock.commonService, "apiCaller");
    const spyIndexService = jest.spyOn(browserServicesMock.indexService, "getDataStreamsAndIndicesNames");
    await act(async () => {
      render(
        <CoreServicesContext.Provider value={coreServicesMock}>
          <ServicesContext.Provider value={browserServicesMock}>
            <ReindexFlyout
              onCloseFlyout={() => {}}
              onReindexConfirm={() => {}}
              services={browserServicesMock}
              sourceIndices={selectedItem}
              getIndices={() => Promise.resolve()}
              openIndex={() => Promise.resolve()}
            />
          </ServicesContext.Provider>
        </CoreServicesContext.Provider>
      );
    });

    // wait 1 tick for the searchPolicies promise to resolve
    await waitFor(() => {});

    expect(spy).toHaveBeenCalledTimes(3);
    expect(spy).toHaveBeenCalledWith({
      endpoint: "cat.indices",
      data: {
        index: ["test-index-01"],
        format: "json",
      },
    });
    expect(spy).toHaveBeenCalledWith({
      endpoint: "indices.getFieldMapping",
      data: {
        fields: "_source",
        index: "test-index-01",
      },
    });
    expect(spy).toHaveBeenCalledWith({
      endpoint: "ingest.getPipeline",
    });

    expect(spyIndexService).toHaveBeenCalledTimes(1);
    expect(spyIndexService).toHaveBeenCalledWith("");

    expect(coreServicesMock.notifications.toasts.addDanger).toHaveBeenCalled();
  });

  it("adds danger toaster on safe error", async () => {
    mockCommonService();
    browserServicesMock.indexService.getDataStreamsAndIndicesNames = jest.fn().mockResolvedValue({
      ok: false,
      error: "some error",
    });
    const spy = jest.spyOn(browserServicesMock.indexService, "getDataStreamsAndIndicesNames");
    await act(async () => {
      render(
        <CoreServicesContext.Provider value={coreServicesMock}>
          <ServicesContext.Provider value={browserServicesMock}>
            <ReindexFlyout
              onCloseFlyout={() => {}}
              onReindexConfirm={() => {}}
              services={browserServicesMock}
              sourceIndices={selectedItem}
              getIndices={() => Promise.resolve()}
              openIndex={() => Promise.resolve()}
            />
          </ServicesContext.Provider>
        </CoreServicesContext.Provider>
      );
    });

    // wait 1 tick for the searchPolicies promise to resolve
    await waitFor(() => {});

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith("");
    expect(coreServicesMock.notifications.toasts.addDanger).toHaveBeenCalledTimes(1);
    expect(coreServicesMock.notifications.toasts.addDanger).toHaveBeenCalledWith("some error");
  });

  it("execute button disabled when _source is not enabled", async () => {
    mockIndexService(indexResNormal);
    mockCommonService({
      ok: true,
      response: {
        "test-index-01": {
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
    const spy = jest.spyOn(browserServicesMock.indexService, "getDataStreamsAndIndicesNames");
    await act(async () => {
      render(
        <CoreServicesContext.Provider value={coreServicesMock}>
          <ServicesContext.Provider value={browserServicesMock}>
            <ReindexFlyout
              onCloseFlyout={() => {}}
              onReindexConfirm={() => {}}
              services={browserServicesMock}
              sourceIndices={selectedItem}
              getIndices={() => Promise.resolve()}
              openIndex={() => Promise.resolve()}
            />
          </ServicesContext.Provider>
        </CoreServicesContext.Provider>
      );
    });

    // wait 1 tick for the searchPolicies promise to resolve
    await waitFor(() => {});

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith("");

    expect(screen.getByTestId("flyout-footer-action-button")).toBeDisabled();
    expect(screen.queryByTestId("destIndicesComboInput")).toBeNull();
  });

  it("execute button disabled when status is closed", async () => {
    mockIndexService(indexResNormal);
    mockCommonService();
    browserServicesMock.commonService.apiCaller = jest.fn().mockImplementation((args) => {
      if (args.endpoint === "cat.indices") {
        return Promise.resolve({ ok: true, response: closedItem });
      }
    });
    render(
      <CoreServicesContext.Provider value={coreServicesMock}>
        <ServicesContext.Provider value={browserServicesMock}>
          <ReindexFlyout
            onCloseFlyout={() => {}}
            onReindexConfirm={() => {}}
            services={browserServicesMock}
            sourceIndices={closedItem}
            getIndices={() => Promise.resolve()}
            openIndex={() => Promise.resolve()}
          />
        </ServicesContext.Provider>
      </CoreServicesContext.Provider>
    );

    // wait 1 tick for the searchPolicies promise to resolve
    await waitFor(() => {});

    expect(screen.getByTestId("flyout-footer-action-button")).toBeDisabled();
    expect(screen.queryByTestId("destIndicesComboInput")).toBeNull();
  });

  it("Show open button for closed index", async () => {
    mockIndexService(indexResNormal);
    mockCommonService();
    browserServicesMock.commonService.apiCaller = jest.fn().mockImplementation((args) => {
      if (args.endpoint === "cat.indices") {
        return Promise.resolve({ ok: true, response: closedItem });
      }
    });

    let sourceIndices = closedItem;
    render(
      <CoreServicesContext.Provider value={coreServicesMock}>
        <ServicesContext.Provider value={browserServicesMock}>
          <ReindexFlyout
            onCloseFlyout={() => {}}
            onReindexConfirm={() => {}}
            services={browserServicesMock}
            sourceIndices={sourceIndices}
            getIndices={async () => {
              sourceIndices = selectedItem;
            }}
            openIndex={() => Promise.resolve()}
          />
        </ServicesContext.Provider>
      </CoreServicesContext.Provider>
    );

    // wait 1 tick for the searchPolicies promise to resolve
    await waitFor(() => {});

    expect(screen.getByTestId("flyout-footer-action-button")).toBeDisabled();
    expect(screen.queryByTestId("destIndicesComboInput")).toBeNull();
    expect(screen.queryByTestId("test-index-01-close")).not.toBeNull();

    userEvent.click(screen.getByTestId("test-index-01-close"));
  });

  it("dest index must provided", async () => {
    mockIndexService(indexResNormal);
    mockCommonService(fileMappingResNormal);
    const spy = jest.spyOn(browserServicesMock.indexService, "getDataStreamsAndIndicesNames");
    render(
      <CoreServicesContext.Provider value={coreServicesMock}>
        <ServicesContext.Provider value={browserServicesMock}>
          <ReindexFlyout
            onCloseFlyout={() => {}}
            onReindexConfirm={() => {}}
            services={browserServicesMock}
            sourceIndices={selectedItem}
            getIndices={() => Promise.resolve()}
            openIndex={() => Promise.resolve()}
          />
        </ServicesContext.Provider>
      </CoreServicesContext.Provider>
    );

    // wait 1 tick for the searchPolicies promise to resolve
    await waitFor(() => {});

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith("");

    userEvent.click(screen.getByTestId("flyout-footer-action-button"));
    expect(screen.getByText("Destination is required.")).toBeInTheDocument();
  });

  it("dest must be different with source", async () => {
    mockIndexService(indexResNormal);
    mockCommonService(fileMappingResNormal);
    const { getByTestId } = render(
      <CoreServicesContext.Provider value={coreServicesMock}>
        <ServicesContext.Provider value={browserServicesMock}>
          <ReindexFlyout
            onCloseFlyout={() => {}}
            onReindexConfirm={() => {}}
            services={browserServicesMock}
            sourceIndices={selectedItem}
            getIndices={() => Promise.resolve()}
            openIndex={() => Promise.resolve()}
          />
        </ServicesContext.Provider>
      </CoreServicesContext.Provider>
    );

    // wait 1 tick for the searchPolicies promise to resolve
    await waitFor(() => {});

    userEvent.type(getByTestId("destIndicesComboInput").querySelector("input") as Element, "test-index-01");

    userEvent.click(screen.getByTestId("flyout-footer-action-button"));
    expect(screen.getByText("Destination must be different with source")).toBeInTheDocument();
  });

  it("success perform reindex", async () => {
    mockIndexService(indexResNormal);
    mockCommonService(fileMappingResNormal);

    const actionContainer = {
      async onReindexConfirm() {},
    };
    actionContainer.onReindexConfirm = jest.fn().mockResolvedValue({ ok: true });
    const spy = jest.spyOn(actionContainer, "onReindexConfirm");
    const { getByTestId } = render(
      <CoreServicesContext.Provider value={coreServicesMock}>
        <ServicesContext.Provider value={browserServicesMock}>
          <ReindexFlyout
            onCloseFlyout={() => {}}
            onReindexConfirm={actionContainer.onReindexConfirm}
            services={browserServicesMock}
            sourceIndices={selectedItem}
            getIndices={() => Promise.resolve()}
            openIndex={() => Promise.resolve()}
          />
        </ServicesContext.Provider>
      </CoreServicesContext.Provider>
    );

    // wait 1 tick for the searchPolicies promise to resolve
    await waitFor(() => {});

    userEvent.type(getByTestId("destIndicesComboInput").querySelector("input") as Element, "test-index-02");

    userEvent.click(screen.getByTestId("flyout-footer-action-button"));
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("success perform reindex with creating new index", async () => {
    mockIndexService(indexResNormal);
    mockCommonService(fileMappingResNormal);

    const actionContainer = {
      async onReindexConfirm() {},
    };
    actionContainer.onReindexConfirm = jest.fn().mockResolvedValue({ ok: true });
    const spy = jest.spyOn(actionContainer, "onReindexConfirm");
    const apiCallerSpy = jest.spyOn(browserServicesMock.commonService, "apiCaller");
    const { getByTestId } = await render(
      <CoreServicesContext.Provider value={coreServicesMock}>
        <ServicesContext.Provider value={browserServicesMock}>
          <ReindexFlyout
            onCloseFlyout={() => {}}
            onReindexConfirm={actionContainer.onReindexConfirm}
            services={browserServicesMock}
            sourceIndices={selectedItem}
            getIndices={() => Promise.resolve()}
            openIndex={() => Promise.resolve()}
          />
        </ServicesContext.Provider>
      </CoreServicesContext.Provider>
    );

    // wait 1 tick for the searchPolicies promise to resolve
    userEvent.type(getByTestId("destIndicesComboInput").querySelector("input") as Element, "test-index-03{enter}");
    await waitFor(() => {});

    userEvent.click(screen.getByTestId("flyout-footer-action-button"));
    await waitFor(() => {
      expect(spy).toHaveBeenCalledTimes(1);
      expect(apiCallerSpy).toHaveBeenLastCalledWith({
        endpoint: "indices.create",
      });
    });
  });
});
