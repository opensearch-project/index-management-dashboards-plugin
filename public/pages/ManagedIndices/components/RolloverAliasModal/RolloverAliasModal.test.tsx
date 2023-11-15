/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { render, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RolloverAliasModal from "./RolloverAliasModal";
import { browserServicesMock, coreServicesMock } from "../../../../../test/mocks";
import { CoreServicesContext } from "../../../../components/core_services";

describe("<RolloverAliasModal /> spec", () => {
  it("renders the component", () => {
    render(
      <CoreServicesContext.Provider value={coreServicesMock}>
        <RolloverAliasModal services={browserServicesMock} index="some_index" onClose={() => {}} />
      </CoreServicesContext.Provider>
    );
    // EuiOverlayMask appends an element to the body so we should have three (used to be two, after upgrading appears to have 3 now), an empty div from react-test-library
    // and our EuiOverlayMask element
    expect(document.body.children).toHaveLength(3);
    expect(document.body.children[2]).toMatchSnapshot();
  });

  it("calls close when close button clicked", () => {
    const onClose = jest.fn();
    const { getByTestId } = render(
      <CoreServicesContext.Provider value={coreServicesMock}>
        <RolloverAliasModal services={browserServicesMock} index="some_index" onClose={onClose} />
      </CoreServicesContext.Provider>
    );

    fireEvent.click(getByTestId("editRolloverAliasModalCloseButton"));
    expect(onClose).toHaveBeenCalled();
  });

  it("disables add button when no alias", async () => {
    const { getByTestId, getByPlaceholderText } = render(
      <CoreServicesContext.Provider value={coreServicesMock}>
        <RolloverAliasModal services={browserServicesMock} index="some_index" onClose={() => {}} />
      </CoreServicesContext.Provider>
    );

    expect(getByTestId("editRolloverAliasModalAddButton")).toBeDisabled();

    await userEvent.type(getByPlaceholderText("Rollover alias"), "some_alias");

    expect(getByTestId("editRolloverAliasModalAddButton")).not.toBeDisabled();
  });

  it("shows success toaster when successful", async () => {
    browserServicesMock.indexService.editRolloverAlias = jest.fn().mockResolvedValue({ ok: true, response: { acknowledged: true } });
    const { getByTestId, getByPlaceholderText } = render(
      <CoreServicesContext.Provider value={coreServicesMock}>
        <RolloverAliasModal services={browserServicesMock} index="some_index" onClose={() => {}} />
      </CoreServicesContext.Provider>
    );

    await userEvent.type(getByPlaceholderText("Rollover alias"), "some_alias");

    fireEvent.click(getByTestId("editRolloverAliasModalAddButton"));

    await waitFor(() => {});

    expect(coreServicesMock.notifications.toasts.addSuccess).toHaveBeenCalledTimes(1);
    expect(coreServicesMock.notifications.toasts.addSuccess).toHaveBeenCalledWith("Edited rollover alias on some_index");
  });

  it("shows error toaster when error is thrown", async () => {
    browserServicesMock.indexService.editRolloverAlias = jest.fn().mockRejectedValue(new Error("this is an error"));
    const { getByTestId, getByPlaceholderText } = render(
      <CoreServicesContext.Provider value={coreServicesMock}>
        <RolloverAliasModal services={browserServicesMock} index="some_index" onClose={() => {}} />
      </CoreServicesContext.Provider>
    );

    await userEvent.type(getByPlaceholderText("Rollover alias"), "some_alias");

    fireEvent.click(getByTestId("editRolloverAliasModalAddButton"));

    await waitFor(() => {});

    expect(coreServicesMock.notifications.toasts.addDanger).toHaveBeenCalledTimes(1);
    expect(coreServicesMock.notifications.toasts.addDanger).toHaveBeenCalledWith("this is an error");
  });

  it("shows error toaster when error is returned", async () => {
    browserServicesMock.indexService.editRolloverAlias = jest.fn().mockResolvedValue({ ok: false, error: "some error" });
    const { getByTestId, getByPlaceholderText } = render(
      <CoreServicesContext.Provider value={coreServicesMock}>
        <RolloverAliasModal services={browserServicesMock} index="some_index" onClose={() => {}} />
      </CoreServicesContext.Provider>
    );

    await userEvent.type(getByPlaceholderText("Rollover alias"), "some_alias");

    fireEvent.click(getByTestId("editRolloverAliasModalAddButton"));

    await waitFor(() => {});

    expect(coreServicesMock.notifications.toasts.addDanger).toHaveBeenCalledTimes(1);
    expect(coreServicesMock.notifications.toasts.addDanger).toHaveBeenCalledWith("some error");
  });

  it("shows error toaster when call is not acknowledged", async () => {
    browserServicesMock.indexService.editRolloverAlias = jest.fn().mockResolvedValue({
      ok: true,
      response: { acknowledged: false },
    });
    const { getByTestId, getByPlaceholderText } = render(
      <CoreServicesContext.Provider value={coreServicesMock}>
        <RolloverAliasModal services={browserServicesMock} index="some_index" onClose={() => {}} />
      </CoreServicesContext.Provider>
    );

    await userEvent.type(getByPlaceholderText("Rollover alias"), "some_alias");

    fireEvent.click(getByTestId("editRolloverAliasModalAddButton"));

    await waitFor(() => {});

    expect(coreServicesMock.notifications.toasts.addDanger).toHaveBeenCalledTimes(1);
    expect(coreServicesMock.notifications.toasts.addDanger).toHaveBeenCalledWith("Failed to edit rollover alias on some_index");
  });
});
