/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { screen, render, waitFor } from "@testing-library/react";
import { browserServicesMock, coreServicesMock } from "../../../../../test/mocks";
import ReindexFlyout from "./ReindexFlyout";
import { CoreServicesContext } from "../../../../components/core_services";
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

function mockIndexService(indexRes: Object) {
  browserServicesMock.indexService.getDataStreamsAndIndicesNames = jest.fn().mockResolvedValue(indexRes);
}
function mockCommonService(fileMappingRes: Object) {
  browserServicesMock.commonService.apiCaller = jest.fn().mockResolvedValue(fileMappingRes);
}

describe("<ReindexFlyout /> spec", () => {
  it("renders the component", async () => {
    mockIndexService(indexResNormal);
    mockCommonService(fileMappingResNormal);

    let component = render(
      <ReindexFlyout onCloseFlyout={() => {}} onReindexConfirm={() => {}} services={browserServicesMock} sourceIndices={selectedItem} />
    );

    expect(component).toMatchSnapshot();
  });

  it("successfully calls search indices on mount", async () => {
    mockIndexService(indexResNormal);
    mockCommonService(fileMappingResNormal);

    const spy = jest.spyOn(browserServicesMock.indexService, "getDataStreamsAndIndicesNames");

    render(
      <CoreServicesContext.Provider value={coreServicesMock}>
        render(
        <ReindexFlyout onCloseFlyout={() => {}} onReindexConfirm={() => {}} services={browserServicesMock} sourceIndices={selectedItem} />
        );
      </CoreServicesContext.Provider>
    );

    // wait 1 tick for the searchPolicies promise to resolve
    await waitFor(() => {});

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith("");

    expect(coreServicesMock.notifications.toasts.addDanger).not.toHaveBeenCalled();
  });

  it("successfully call _source enabled check on mount", async () => {
    mockIndexService(indexResNormal);
    mockCommonService(fileMappingResNormal);

    const spy = jest.spyOn(browserServicesMock.commonService, "apiCaller");
    render(
      <CoreServicesContext.Provider value={coreServicesMock}>
        render(
        <ReindexFlyout onCloseFlyout={() => {}} onReindexConfirm={() => {}} services={browserServicesMock} sourceIndices={selectedItem} />
        );
      </CoreServicesContext.Provider>
    );

    // wait 1 tick for the searchPolicies promise to resolve
    await waitFor(() => {});

    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy).toHaveBeenCalledWith({
      endpoint: "indices.getFieldMapping",
      data: {
        fields: "_source",
        index: "test-index-01",
      },
    });
  });

  it("call _source enabled check fail on mount", async () => {
    mockIndexService(indexResNormal);
    // call validation failed
    mockCommonService({ ok: false, response: null });

    const spy = jest.spyOn(browserServicesMock.commonService, "apiCaller");
    const spyIndexService = jest.spyOn(browserServicesMock.indexService, "getDataStreamsAndIndicesNames");
    render(
      <CoreServicesContext.Provider value={coreServicesMock}>
        render(
        <ReindexFlyout onCloseFlyout={() => {}} onReindexConfirm={() => {}} services={browserServicesMock} sourceIndices={selectedItem} />
        );
      </CoreServicesContext.Provider>
    );

    // wait 1 tick for the searchPolicies promise to resolve
    await waitFor(() => {});

    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy).toHaveBeenCalledWith({
      endpoint: "indices.getFieldMapping",
      data: {
        fields: "_source",
        index: "test-index-01",
      },
    });

    expect(spyIndexService).toHaveBeenCalledTimes(1);
    expect(spyIndexService).toHaveBeenCalledWith("");
  });

  it("adds danger toaster on safe error", async () => {
    browserServicesMock.indexService.getDataStreamsAndIndicesNames = jest.fn().mockResolvedValue({
      ok: false,
      error: "some error",
    });
    const spy = jest.spyOn(browserServicesMock.indexService, "getDataStreamsAndIndicesNames");
    render(
      <CoreServicesContext.Provider value={coreServicesMock}>
        render(
        <ReindexFlyout onCloseFlyout={() => {}} onReindexConfirm={() => {}} services={browserServicesMock} sourceIndices={selectedItem} />
        );
      </CoreServicesContext.Provider>
    );

    // wait 1 tick for the searchPolicies promise to resolve
    await waitFor(() => {});

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith("");
    expect(coreServicesMock.notifications.toasts.addDanger).toHaveBeenCalledTimes(1);
    expect(coreServicesMock.notifications.toasts.addDanger).toHaveBeenCalledWith("some error");
  });

  it("adds danger toaster on unsafe error", async () => {
    browserServicesMock.indexService.getDataStreamsAndIndicesNames = jest.fn().mockResolvedValue({
      ok: false,
      error: "some error",
    });
    const spy = jest.spyOn(browserServicesMock.indexService, "getDataStreamsAndIndicesNames");
    render(
      <CoreServicesContext.Provider value={coreServicesMock}>
        render(
        <ReindexFlyout onCloseFlyout={() => {}} onReindexConfirm={() => {}} services={browserServicesMock} sourceIndices={selectedItem} />
        );
      </CoreServicesContext.Provider>
    );

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
    render(
      <CoreServicesContext.Provider value={coreServicesMock}>
        render(
        <ReindexFlyout onCloseFlyout={() => {}} onReindexConfirm={() => {}} services={browserServicesMock} sourceIndices={selectedItem} />
        );
      </CoreServicesContext.Provider>
    );

    // wait 1 tick for the searchPolicies promise to resolve
    await waitFor(() => {});

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith("");

    expect(screen.getByTestId("flyout-footer-action-button")).toBeDisabled();
  });

  it("dest index must provided", async () => {
    mockIndexService(indexResNormal);
    mockCommonService(fileMappingResNormal);
    const spy = jest.spyOn(browserServicesMock.indexService, "getDataStreamsAndIndicesNames");
    render(
      <CoreServicesContext.Provider value={coreServicesMock}>
        render(
        <ReindexFlyout onCloseFlyout={() => {}} onReindexConfirm={() => {}} services={browserServicesMock} sourceIndices={selectedItem} />
        );
      </CoreServicesContext.Provider>
    );

    // wait 1 tick for the searchPolicies promise to resolve
    await waitFor(() => {});

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith("");

    userEvent.click(screen.getByTestId("flyout-footer-action-button"));
    expect(screen.getByText("Destination must be provided.")).toBeInTheDocument();
  });
});
