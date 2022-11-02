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

describe("<ReindexFlyout /> spec", () => {
  it("renders the component", async () => {
    browserServicesMock.indexService.getDataStreamsAndIndicesNames = jest.fn().mockResolvedValue({
      ok: true,
      response: {
        dataStreams: ["test-ds-01"],
        indices: ["test-index-01", "test-index-02"],
      },
    });
    browserServicesMock.commonService.apiCaller = jest.fn().mockResolvedValue({
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
    });

    let component = render(
      <ReindexFlyout
        onCloseFlyout={() => {}}
        onReindexConfirm={() => {}}
        services={browserServicesMock}
        sourceIndices={["test-index-01"]}
      />
    );

    expect(component).toMatchSnapshot();
  });

  it("successfully calls search indices on mount", async () => {
    browserServicesMock.indexService.getDataStreamsAndIndicesNames = jest.fn().mockResolvedValue({
      ok: true,
      response: {
        dataStreams: ["test-ds-01"],
        indices: ["test-index-01", "test-index-02"],
      },
    });
    browserServicesMock.commonService.apiCaller = jest.fn().mockResolvedValue({
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
    });
    const spy = jest.spyOn(browserServicesMock.indexService, "getDataStreamsAndIndicesNames");
    render(
      <CoreServicesContext.Provider value={coreServicesMock}>
        render(
        <ReindexFlyout
          onCloseFlyout={() => {}}
          onReindexConfirm={() => {}}
          services={browserServicesMock}
          sourceIndices={["test-index-01"]}
        />
        );
      </CoreServicesContext.Provider>
    );

    // wait 1 tick for the searchPolicies promise to resolve
    await waitFor(() => {});

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith("");
    expect(coreServicesMock.notifications.toasts.addDanger).not.toHaveBeenCalled();
  });

  it("query expression is default values", async () => {
    browserServicesMock.indexService.getDataStreamsAndIndicesNames = jest.fn().mockResolvedValue({
      ok: true,
      response: {
        dataStreams: ["test-ds-01"],
        indices: ["test-index-01", "test-index-02"],
      },
    });
    browserServicesMock.commonService.apiCaller = jest.fn().mockResolvedValue({
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
    });
    const spy = jest.spyOn(browserServicesMock.indexService, "getDataStreamsAndIndicesNames");
    render(
      <CoreServicesContext.Provider value={coreServicesMock}>
        render(
        <ReindexFlyout
          onCloseFlyout={() => {}}
          onReindexConfirm={() => {}}
          services={browserServicesMock}
          sourceIndices={["test-index-01"]}
        />
        );
      </CoreServicesContext.Provider>
    );

    // wait 1 tick for the searchPolicies promise to resolve
    await waitFor(() => {});

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith("");

    // expect(data).toEqual(DEFAULT_QUERY);
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
        <ReindexFlyout
          onCloseFlyout={() => {}}
          onReindexConfirm={() => {}}
          services={browserServicesMock}
          sourceIndices={["test-index-01"]}
        />
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
        <ReindexFlyout
          onCloseFlyout={() => {}}
          onReindexConfirm={() => {}}
          services={browserServicesMock}
          sourceIndices={["test-index-01"]}
        />
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
    browserServicesMock.indexService.getDataStreamsAndIndicesNames = jest.fn().mockResolvedValue({
      ok: true,
      response: {
        dataStreams: ["test-ds-01"],
        indices: ["test-index-01", "test-index-02"],
      },
    });
    browserServicesMock.commonService.apiCaller = jest.fn().mockResolvedValue({
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
        <ReindexFlyout
          onCloseFlyout={() => {}}
          onReindexConfirm={() => {}}
          services={browserServicesMock}
          sourceIndices={["test-index-01"]}
        />
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
    browserServicesMock.indexService.getDataStreamsAndIndicesNames = jest.fn().mockResolvedValue({
      ok: true,
      response: {
        dataStreams: ["test-ds-01"],
        indices: ["test-index-01", "test-index-02"],
      },
    });
    browserServicesMock.commonService.apiCaller = jest.fn().mockResolvedValue({
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
    });
    const spy = jest.spyOn(browserServicesMock.indexService, "getDataStreamsAndIndicesNames");
    render(
      <CoreServicesContext.Provider value={coreServicesMock}>
        render(
        <ReindexFlyout
          onCloseFlyout={() => {}}
          onReindexConfirm={() => {}}
          services={browserServicesMock}
          sourceIndices={["test-index-01"]}
        />
        );
      </CoreServicesContext.Provider>
    );

    // wait 1 tick for the searchPolicies promise to resolve
    await waitFor(() => {});

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith("");

    userEvent.click(screen.getByText("Execute"));
    expect(screen.getByText("Destination must be provided.")).toBeInTheDocument();
  });
});
