/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { render, waitFor } from "@testing-library/react";
import { Redirect, Route, Switch } from "react-router-dom";
import { HashRouter as Router } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import { browserServicesMock, coreServicesMock } from "../../../../../test/mocks";
import DataStreams from "./index";
import { ServicesContext } from "../../../../services";
import { ROUTES } from "../../../../utils/constants";
import { CoreServicesContext } from "../../../../components/core_services";
import { DataStreamStats, DataStreamWithStats } from "../../interface";
import { DataStream } from "../../../../../server/models/interfaces";

function renderWithRouter() {
  return {
    ...render(
      <Router>
        <Switch>
          <Route
            path={ROUTES.TEMPLATES}
            render={(props) => (
              <CoreServicesContext.Provider value={coreServicesMock}>
                <ServicesContext.Provider value={browserServicesMock}>
                  <DataStreams {...props} />
                </ServicesContext.Provider>
              </CoreServicesContext.Provider>
            )}
          />
          <Redirect from="/" to={ROUTES.TEMPLATES} />
        </Switch>
      </Router>
    ),
  };
}

const testTemplateId = "test";

describe("<DataStreams /> spec", () => {
  beforeEach(() => {
    browserServicesMock.commonService.apiCaller = jest.fn(async (payload) => {
      const path: string = payload?.data?.path || "";
      if (path.startsWith("_data_stream/*")) {
        if (path.includes("/_stats?human=true")) {
          return {
            ok: true,
            response: {
              data_streams: [
                {
                  data_stream: "1",
                },
              ] as DataStreamStats[],
            },
          };
        } else {
          return {
            ok: true,
            response: {
              data_streams: [
                {
                  name: "1",
                },
              ] as DataStream[],
            },
          };
        }
      }

      return {
        ok: true,
        response: {},
      };
    }) as any;
    window.location.hash = "/";
  });
  it("renders the component", async () => {
    const { container } = renderWithRouter();

    expect(container.firstChild).toMatchSnapshot();
    await waitFor(() => {
      expect(browserServicesMock.commonService.apiCaller).toBeCalledTimes(2);
    });
  });

  it("with some actions", async () => {
    const { getByPlaceholderText } = renderWithRouter();
    expect(browserServicesMock.commonService.apiCaller).toBeCalledTimes(2);
    userEvent.type(getByPlaceholderText("Search..."), `${testTemplateId}{enter}`);
    await waitFor(() => {
      expect(browserServicesMock.commonService.apiCaller).toBeCalledTimes(4);
      expect(browserServicesMock.commonService.apiCaller).toBeCalledWith({
        data: { method: "GET", path: "_data_stream/**" },
        endpoint: "transport.request",
      });
    });
  });
});
