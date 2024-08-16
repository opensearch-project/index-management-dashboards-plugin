/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { render, waitFor } from "@testing-library/react";
import IndexDetail, { IIndexDetailProps } from "./index";
import { browserServicesMock, coreServicesMock } from "../../../test/mocks";
import { ServicesContext } from "../../services";
import { CoreServicesContext } from "../../components/core_services";
import { CatIndex } from "../../../server/models/interfaces";
import { getApplication, getNavigationUI, getUISettings } from "../../services/Services";

jest.mock("../../services/Services", () => ({
  ...jest.requireActual("../../services/Services"),
  getUISettings: jest.fn(),
  getApplication: jest.fn(),
  getNavigationUI: jest.fn(),
}));

beforeEach(() => {
  (getUISettings as jest.Mock).mockReturnValue({
    get: jest.fn().mockReturnValue(false), // or false, depending on your test case
  });
  (getApplication as jest.Mock).mockReturnValue({});

  (getNavigationUI as jest.Mock).mockReturnValue({});
});

browserServicesMock.commonService.apiCaller = jest.fn(
  async (payload): Promise<any> => {
    if (payload.data?.index?.includes("error_index")) {
      return {
        ok: false,
        error: "error index",
      };
    }

    return {
      ok: true,
      response: (payload.data.index || []).map(
        (index: string): CatIndex => {
          return {
            index,
            "docs.count": "0",
            "docs.deleted": "1",
            "pri.store.size": "1",
            data_stream: "no",
            "store.size": "1mb",
            rep: "2",
            uuid: "1",
            health: "green",
            pri: "4",
            status: "open",
          };
        }
      ),
    };
  }
);

function renderWithServiceAndCore(props: IIndexDetailProps) {
  return {
    ...render(
      <CoreServicesContext.Provider value={coreServicesMock}>
        <ServicesContext.Provider value={browserServicesMock}>
          <IndexDetail {...props} />
        </ServicesContext.Provider>
      </CoreServicesContext.Provider>
    ),
  };
}

describe("<IndexDetail /> spec", () => {
  it("render the component", async () => {
    const { container, queryByText } = renderWithServiceAndCore({
      indices: ["test"],
      children: <>content underneath the table</>,
    });

    expect(queryByText("children content here")).toBeNull();
    await waitFor(() => {
      expect(container).toMatchSnapshot();
      expect(browserServicesMock.commonService.apiCaller).toBeCalledTimes(1);
      expect(browserServicesMock.commonService.apiCaller).toBeCalledWith({
        endpoint: "cat.indices",
        data: {
          index: ["test"],
          format: "json",
        },
      });
    });
    expect(queryByText("content underneath the table")).not.toBeNull();
  });

  it("render with error", async () => {
    const onGetIndicesDetailMock = jest.fn();
    renderWithServiceAndCore({
      indices: ["error_index"],
      children: <>content underneath the table</>,
      onGetIndicesDetail: onGetIndicesDetailMock,
    });

    await waitFor(() => {
      expect(coreServicesMock.notifications.toasts.addDanger).toBeCalledTimes(1);
      expect(coreServicesMock.notifications.toasts.addDanger).toBeCalledWith("error index");
      expect(onGetIndicesDetailMock).toBeCalledTimes(1);
      expect(onGetIndicesDetailMock).toBeCalledWith([]);
    });
  });
});
