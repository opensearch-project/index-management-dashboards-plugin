/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { render, waitFor } from "@testing-library/react";
import { Redirect, Route, Switch } from "react-router-dom";
import { HashRouter as Router } from "react-router-dom";
import { browserServicesMock, coreServicesMock } from "../../../../../test/mocks";
import Templates from "./index";
import { ServicesContext } from "../../../../services";
import { ROUTES } from "../../../../utils/constants";
import { CoreServicesContext } from "../../../../components/core_services";
import userEvent from "@testing-library/user-event";
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
      expect(browserServicesMock.commonService.apiCaller).toBeCalledTimes(2);
      expect(browserServicesMock.commonService.apiCaller).toBeCalledWith({
        data: { format: "json", name: `*`, s: "name:asc" },
        endpoint: "cat.templates",
      });
    });
  });

  it("with some actions", async () => {
    const { getByTestId, getByPlaceholderText } = renderWithRouter();
    expect(browserServicesMock.commonService.apiCaller).toBeCalledTimes(1);
    userEvent.type(getByPlaceholderText("Search..."), `${testTemplateId}{enter}`);
    await waitFor(() => {
      expect(browserServicesMock.commonService.apiCaller).toBeCalledTimes(2);
      expect(browserServicesMock.commonService.apiCaller).toBeCalledWith({
        data: { format: "json", name: `${testTemplateId}*`, s: "name:desc" },
        endpoint: "cat.templates",
      });
    });
    userEvent.click(document.getElementById(`_selection_column_${testTemplateId}-checkbox`) as Element);
    await waitFor(() => {});
    userEvent.click(document.querySelector('[data-test-subj="moreAction"] button') as Element);
    userEvent.click(document.querySelector('[data-test-subj="editAction"]') as Element);
    userEvent.click(getByTestId("cancelCreateTemplateButton"));
    userEvent.click(document.querySelector('[data-test-subj="moreAction"] button') as Element);
    userEvent.click(document.querySelector('[data-test-subj="editAction"]') as Element);
  });
});
