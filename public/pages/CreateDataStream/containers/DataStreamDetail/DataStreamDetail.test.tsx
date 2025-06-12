/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { render, waitFor } from "@testing-library/react";
import DataStreamDetail, { DataStreamDetailProps } from "./DataStreamDetail";
import { ServicesContext } from "../../../../services";
import { browserServicesMock, coreServicesMock } from "../../../../../test/mocks";
import { CoreServicesContext } from "../../../../components/core_services";
import { HashRouter, Route } from "react-router-dom";
import { ROUTES } from "../../../../utils/constants";
import userEventModule from "@testing-library/user-event";
import { getApplication, getNavigationUI, getUISettings } from "../../../../services/Services";

jest.mock("../../../../services/Services", () => ({
  ...jest.requireActual("../../../../services/Services"),
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

function renderCreateDataStream(props: Omit<DataStreamDetailProps, "history">) {
  return {
    ...render(
      <HashRouter>
        <CoreServicesContext.Provider value={coreServicesMock}>
          <ServicesContext.Provider value={browserServicesMock}>
            <Route path="/" render={(routeProps) => <DataStreamDetail {...props} history={routeProps.history} />} />
            <Route path={ROUTES.DATA_STREAMS} render={(routeProps) => <>This is {ROUTES.DATA_STREAMS}</>} />
          </ServicesContext.Provider>
        </CoreServicesContext.Provider>
      </HashRouter>
    ),
  };
}

describe("<DataStreamDetail /> spec", () => {
  const userEvent = userEventModule.setup();

  // main unit test case is in CreateDataStream.test.tsx
  it("render component", async () => {
    const { container } = renderCreateDataStream({});
    await waitFor(() => {}, {
      timeout: 3000,
    });
    expect(container).toMatchSnapshot();
  });

  it("show the json", async () => {
    browserServicesMock.commonService.apiCaller = jest.fn(async () => {
      return {
        ok: true,
        response: {
          data_streams: [
            {
              name: "good_data_stream",
              indices: [],
            },
          ],
        },
      };
    }) as any;
    const { getByText, getByTestId, findAllByText } = renderCreateDataStream({
      dataStream: "good_data_stream",
    });
    await findAllByText("good_data_stream");
    userEvent.click(getByText("View JSON"));
    await waitFor(() =>
      expect(
        JSON.parse(getByTestId("dataStreamJSONDetailModal").querySelector('[data-test-subj="jsonEditor-valueDisplay"]')?.innerHTML || "{}")
      ).toEqual({
        name: "good_data_stream",
        indices: [],
      })
    );
  });
});
