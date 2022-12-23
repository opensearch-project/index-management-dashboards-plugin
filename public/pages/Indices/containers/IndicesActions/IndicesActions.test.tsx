/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { render, waitFor } from "@testing-library/react";
// @ts-ignore
import userEvent from "@testing-library/user-event";
import { browserServicesMock, coreServicesMock } from "../../../../../test/mocks";
import IndicesActions, { IndicesActionsProps } from "./index";
import { ModalProvider } from "../../../../components/Modal";
import { ServicesContext } from "../../../../services";
import { CoreServicesContext } from "../../../../components/core_services";
import { createMemoryHistory } from "history";
import { ROUTES } from "../../../../utils/constants";

function renderWithRouter(props: IndicesActionsProps) {
  return {
    ...render(
      <CoreServicesContext.Provider value={coreServicesMock}>
        <ServicesContext.Provider value={browserServicesMock}>
          <ModalProvider>
            <IndicesActions {...props} />
          </ModalProvider>
        </ServicesContext.Provider>
      </CoreServicesContext.Provider>
    ),
  };
}

describe("<IndicesActions /> spec", () => {
  it("renders the component and all the actions should be disabled when no items selected", async () => {
    const { container, getByTestId } = renderWithRouter({
      selectedItems: [],
      onDelete: () => null,
    });

    await waitFor(() => {
      expect(container.firstChild).toMatchSnapshot();
    });

    userEvent.click(document.querySelector('[data-test-subj="moreAction"] button') as Element);
    await waitFor(() => {
      expect(getByTestId("Apply policyButton")).toBeDisabled();
      expect(getByTestId("Reindex Action")).toBeEnabled();
    });
  });

  it("click reindex goes to new page with selected item ", async () => {
    const history = createMemoryHistory();

    const { getByTestId } = renderWithRouter({
      getIndices(): Promise<void> {
        return Promise.resolve(undefined);
      },
      history: history,
      location: history.location,
      match: { path: "/", url: "/", isExact: true, params: {} },
      onClose(): void {},
      onDelete(): void {},
      onOpen(): void {},
      onShrink(): void {},
      selectedItems: [
        {
          "docs.count": "5",
          "docs.deleted": "2",
          health: "green",
          index: "test_index",
          pri: "1",
          "pri.store.size": "100KB",
          rep: "0",
          status: "open",
          "store.size": "100KB",
          uuid: "some_uuid",
          managed: "",
          managedPolicy: "",
          data_stream: "",
        },
      ],
    });

    userEvent.click(document.querySelector('[data-test-subj="moreAction"] button') as Element);
    userEvent.click(getByTestId("Reindex Action"));

    expect(history.length).toBe(2);
    expect(history.location.pathname).toBe(ROUTES.REINDEX);
    expect(history.location.search).toBe("?source=test_index");
  });

  it("click reindex goes to new page without selected item", async () => {
    const history = createMemoryHistory();

    const { getByTestId } = renderWithRouter({
      getIndices(): Promise<void> {
        return Promise.resolve(undefined);
      },
      history: history,
      location: history.location,
      match: { path: "/", url: "/", isExact: true, params: {} },
      onClose(): void {},
      onDelete(): void {},
      onOpen(): void {},
      onShrink(): void {},
      selectedItems: [],
    });

    userEvent.click(document.querySelector('[data-test-subj="moreAction"] button') as Element);
    userEvent.click(getByTestId("Reindex Action"));

    expect(history.length).toBe(2);
    expect(history.location.pathname).toBe(ROUTES.REINDEX);
    expect(history.location.search).toBe("");
  });
});
