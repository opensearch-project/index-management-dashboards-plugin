/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { render, waitFor } from "@testing-library/react";
import NewPolicy from "./NewPolicy";
import { browserServicesMock } from "../../../../../test/mocks";
import { Radio } from "../../containers/ChangePolicy/ChangePolicy";
import coreServicesMock from "../../../../../test/mocks/coreServicesMock";
import { CoreServicesContext } from "../../../../components/core_services";

describe("<NewPolicy /> spec", () => {
  it("renders the component", async () => {
    browserServicesMock.indexService.searchPolicies = jest.fn().mockResolvedValue({ ok: true, response: { policies: [] } });
    const { container } = render(
      <CoreServicesContext.Provider value={coreServicesMock}>
        <NewPolicy
          indexService={browserServicesMock.indexService}
          selectedPolicies={[]}
          stateRadioIdSelected={Radio.Current}
          stateSelected=""
          onChangePolicy={() => {}}
          onChangeStateRadio={() => {}}
          onStateSelectChange={() => {}}
          selectedPoliciesError=""
        />
      </CoreServicesContext.Provider>
    );

    await waitFor(() => {});

    expect(container.firstChild).toMatchSnapshot();
  });

  it("shows danger toaster when search fails", async () => {
    browserServicesMock.indexService.searchPolicies = jest.fn().mockRejectedValue(new Error("this is an error"));
    render(
      <CoreServicesContext.Provider value={coreServicesMock}>
        <NewPolicy
          indexService={browserServicesMock.indexService}
          selectedPolicies={[]}
          stateRadioIdSelected={Radio.Current}
          stateSelected=""
          onChangePolicy={() => {}}
          onChangeStateRadio={() => {}}
          onStateSelectChange={() => {}}
          selectedPoliciesError=""
        />
      </CoreServicesContext.Provider>
    );

    await waitFor(() => {});

    expect(coreServicesMock.notifications.toasts.addDanger).toHaveBeenCalledTimes(1);
    expect(coreServicesMock.notifications.toasts.addDanger).toHaveBeenCalledWith("this is an error");
  });

  it("shows danger toaster when search gracefully fails", async () => {
    browserServicesMock.indexService.searchPolicies = jest.fn().mockResolvedValue({ ok: false, error: "some error" });
    render(
      <CoreServicesContext.Provider value={coreServicesMock}>
        <NewPolicy
          indexService={browserServicesMock.indexService}
          selectedPolicies={[]}
          stateRadioIdSelected={Radio.Current}
          stateSelected=""
          onChangePolicy={() => {}}
          onChangeStateRadio={() => {}}
          onStateSelectChange={() => {}}
          selectedPoliciesError=""
        />
      </CoreServicesContext.Provider>
    );

    await waitFor(() => {});

    expect(coreServicesMock.notifications.toasts.addDanger).toHaveBeenCalledTimes(1);
    expect(coreServicesMock.notifications.toasts.addDanger).toHaveBeenCalledWith("some error");
  });

  it("shows danger toaster when search fails because of no config index", async () => {
    browserServicesMock.indexService.searchPolicies = jest
      .fn()
      .mockResolvedValue({ ok: false, error: "[index_not_found_exception]and other stuff" });
    render(
      <CoreServicesContext.Provider value={coreServicesMock}>
        <NewPolicy
          indexService={browserServicesMock.indexService}
          selectedPolicies={[]}
          stateRadioIdSelected={Radio.Current}
          stateSelected=""
          onChangePolicy={() => {}}
          onChangeStateRadio={() => {}}
          onStateSelectChange={() => {}}
          selectedPoliciesError=""
        />
      </CoreServicesContext.Provider>
    );

    await waitFor(() => {});

    expect(coreServicesMock.notifications.toasts.addDanger).toHaveBeenCalledTimes(1);
    expect(coreServicesMock.notifications.toasts.addDanger).toHaveBeenCalledWith("You have not created a policy yet");
  });
});
