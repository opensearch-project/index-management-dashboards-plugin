/*
 *   Copyright OpenSearch Contributors
 *
 *   Licensed under the Apache License, Version 2.0 (the "License").
 *   You may not use this file except in compliance with the License.
 *   A copy of the License is located at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   or in the "license" file accompanying this file. This file is distributed
 *   on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 *   express or implied. See the License for the specific language governing
 *   permissions and limitations under the License.
 */

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
import Templates from "./index";
import { ServicesContext } from "../../../../services";
import { ROUTES } from "../../../../utils/constants";
import { CoreServicesContext } from "../../../../components/core_services";
import { ITemplate } from "../../interface";

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
                  <Templates {...props} />
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

describe("<Templates /> spec", () => {
  beforeEach(() => {
    browserServicesMock.commonService.apiCaller = jest.fn(async (payload) => {
      if (payload.endpoint === "cat.templates") {
        return {
          ok: true,
          response: [
            {
              name: testTemplateId,
              index_patterns: "[1]",
              version: "",
              order: 1,
            },
          ] as ITemplate[],
        };
      }

      return {
        ok: true,
        response: {},
      };
    }) as any;
    window.location.hash = "/";
  });
  it("renders the component", async () => {
    const { container, getByTestId } = renderWithRouter();

    expect(container.firstChild).toMatchSnapshot();
    await waitFor(() => {
      expect(browserServicesMock.commonService.apiCaller).toBeCalledTimes(1);
    });
    userEvent.click(getByTestId("tableHeaderCell_name_0").querySelector("button") as Element);
    await waitFor(() => {
      expect(browserServicesMock.commonService.apiCaller).toBeCalledTimes(4);
      expect(browserServicesMock.commonService.apiCaller).toBeCalledWith({
        data: { format: "json", name: `**`, s: "name:asc" },
        endpoint: "cat.templates",
      });
    });
  });

  it("with some actions", async () => {
    const { getByPlaceholderText } = renderWithRouter();
    expect(browserServicesMock.commonService.apiCaller).toBeCalledTimes(1);
    userEvent.type(getByPlaceholderText("Search..."), `${testTemplateId}{enter}`);
    await waitFor(() => {
      expect(browserServicesMock.commonService.apiCaller).toBeCalledTimes(4);
      expect(browserServicesMock.commonService.apiCaller).toBeCalledWith({
        data: { format: "json", name: `*${testTemplateId}*`, s: "name:desc" },
        endpoint: "cat.templates",
      });
    });
  });
});
