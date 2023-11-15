/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { render, waitFor } from "@testing-library/react";
import ChangeManagedIndices from "./ChangeManagedIndices";
import { browserServicesMock } from "../../../../../test/mocks";
import coreServicesMock from "../../../../../test/mocks/coreServicesMock";
import { CoreServicesContext } from "../../../../components/core_services";

describe("<ChangeManagedIndices /> spec", () => {
  it("renders the component", async () => {
    browserServicesMock.managedIndexService.getManagedIndices = jest.fn().mockResolvedValue({ ok: true, response: { hits: { hits: [] } } });
    const { container } = render(
      <CoreServicesContext.Provider value={coreServicesMock}>
        <ChangeManagedIndices
          managedIndexService={browserServicesMock.managedIndexService}
          selectedManagedIndices={[]}
          selectedStateFilters={[]}
          onChangeManagedIndices={() => {}}
          onChangeStateFilters={() => {}}
          managedIndicesError=""
        />
      </CoreServicesContext.Provider>
    );

    await waitFor(() => {});

    expect(container.firstChild).toMatchSnapshot();
  });

  it("shows danger toaster when search fails", async () => {
    browserServicesMock.managedIndexService.getManagedIndices = jest.fn().mockRejectedValue(new Error("this is an error"));
    render(
      <CoreServicesContext.Provider value={coreServicesMock}>
        <ChangeManagedIndices
          managedIndexService={browserServicesMock.managedIndexService}
          selectedManagedIndices={[]}
          selectedStateFilters={[]}
          onChangeManagedIndices={() => {}}
          onChangeStateFilters={() => {}}
          managedIndicesError=""
        />
      </CoreServicesContext.Provider>
    );

    await waitFor(() => {});

    expect(coreServicesMock.notifications.toasts.addDanger).toHaveBeenCalledTimes(1);
    expect(coreServicesMock.notifications.toasts.addDanger).toHaveBeenCalledWith("this is an error");
  });

  it("shows danger toaster when search gracefully fails", async () => {
    browserServicesMock.managedIndexService.getManagedIndices = jest.fn().mockResolvedValue({ ok: false, error: "some error" });
    render(
      <CoreServicesContext.Provider value={coreServicesMock}>
        <ChangeManagedIndices
          managedIndexService={browserServicesMock.managedIndexService}
          selectedManagedIndices={[]}
          selectedStateFilters={[]}
          onChangeManagedIndices={() => {}}
          onChangeStateFilters={() => {}}
          managedIndicesError=""
        />
      </CoreServicesContext.Provider>
    );

    await waitFor(() => {});

    expect(coreServicesMock.notifications.toasts.addDanger).toHaveBeenCalledTimes(1);
    expect(coreServicesMock.notifications.toasts.addDanger).toHaveBeenCalledWith("some error");
  });

  it("shows danger toaster when search fails because of no config index", async () => {
    browserServicesMock.managedIndexService.getManagedIndices = jest
      .fn()
      .mockResolvedValue({ ok: false, error: "[index_not_found_exception]and other stuff" });
    render(
      <CoreServicesContext.Provider value={coreServicesMock}>
        <ChangeManagedIndices
          managedIndexService={browserServicesMock.managedIndexService}
          selectedManagedIndices={[]}
          selectedStateFilters={[]}
          onChangeManagedIndices={() => {}}
          onChangeStateFilters={() => {}}
          managedIndicesError=""
        />
      </CoreServicesContext.Provider>
    );

    await waitFor(() => {});

    expect(coreServicesMock.notifications.toasts.addDanger).toHaveBeenCalledTimes(1);
    expect(coreServicesMock.notifications.toasts.addDanger).toHaveBeenCalledWith("You have not created a managed index yet");
  });
});
