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
import IndexDetail, { IndexDetailModalProps } from "./index";
import { ModalProvider } from "../../../../components/Modal";
import { ServicesContext } from "../../../../services";
import { CoreServicesContext } from "../../../../components/core_services";

function renderWithRouter(props: IndexDetailModalProps) {
  return {
    ...render(
      <CoreServicesContext.Provider value={coreServicesMock}>
        <ServicesContext.Provider value={browserServicesMock}>
          <ModalProvider>
            <IndexDetail {...props} />
          </ModalProvider>
        </ServicesContext.Provider>
      </CoreServicesContext.Provider>
    ),
  };
}

describe("container <IndexDetail /> spec", () => {
  it("render the component", async () => {
    browserServicesMock.commonService.apiCaller = jest.fn().mockResolvedValue({
      ok: true,
      response: {
        test_index: {
          aliases: {},
          mappings: {},
          settings: {
            index: {
              number_of_shards: "1",
              number_of_replicas: "1",
              provided_name: "test_index",
            },
          },
        },
      },
    });
    const { container, getByTestId } = renderWithRouter({
      index: "test_index",
      record: {
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
      onDelete: () => null,
    });

    await waitFor(() => {
      expect(container.firstChild).toMatchSnapshot();
    });

    userEvent.click(getByTestId("view-index-detail-button-test_index"));

    await waitFor(() => {
      expect(document.querySelector("#index-detail-modal-overview")).not.toBeNull();
      expect(browserServicesMock.commonService.apiCaller).toBeCalledTimes(1);
      expect(browserServicesMock.commonService.apiCaller).toBeCalledWith({
        endpoint: "indices.get",
        data: {
          index: "test_index",
        },
      });
    });
  });
});
