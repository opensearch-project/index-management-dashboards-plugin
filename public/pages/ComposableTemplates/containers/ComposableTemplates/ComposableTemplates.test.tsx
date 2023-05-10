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
import ComposableTemplates from "./index";
import { ServicesContext } from "../../../../services";
import { ROUTES } from "../../../../utils/constants";
import { CoreServicesContext } from "../../../../components/core_services";
import userEvent from "@testing-library/user-event";
import { ICatComposableTemplate } from "../../interface";

function renderWithRouter() {
  return {
    ...render(
      <Router>
        <Switch>
          <Route
            path={ROUTES.COMPOSABLE_TEMPLATES}
            render={(props) => (
              <CoreServicesContext.Provider value={coreServicesMock}>
                <ServicesContext.Provider value={browserServicesMock}>
                  <ComposableTemplates {...props} />
                </ServicesContext.Provider>
              </CoreServicesContext.Provider>
            )}
          />
          <Redirect from="/" to={ROUTES.COMPOSABLE_TEMPLATES} />
        </Switch>
      </Router>
    ),
  };
}

const testTemplateId = "test";

describe("<ComposableTemplates /> spec", () => {
  beforeEach(() => {
    browserServicesMock.commonService.apiCaller = jest.fn(async (payload) => {
      if (payload.endpoint === "transport.request") {
        return {
          ok: true,
          response: {
            component_templates: [
              {
                name: testTemplateId,
                component_template: {
                  template: {},
                },
              },
            ] as ICatComposableTemplate[],
          },
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
      expect(browserServicesMock.commonService.apiCaller).toBeCalledTimes(2);
    });
    userEvent.click(getByTestId("tableHeaderCell_name_0").querySelector("button") as Element);
    await waitFor(() => {
      expect(browserServicesMock.commonService.apiCaller).toBeCalledTimes(3);
    });
  });

  it("with some actions", async () => {
    const { getByPlaceholderText } = renderWithRouter();
    expect(browserServicesMock.commonService.apiCaller).toBeCalledTimes(2);
    userEvent.type(getByPlaceholderText("Search..."), `${testTemplateId}{enter}`);
    await waitFor(() => {
      expect(browserServicesMock.commonService.apiCaller).toBeCalledTimes(3);
    });
  });

  it("render without component templates", async () => {
    browserServicesMock.commonService.apiCaller = jest.fn(async (payload) => {
      if (payload.endpoint === "transport.request") {
        return {
          ok: true,
          response: {
            component_templates: [] as ICatComposableTemplate[],
          },
        };
      }

      return {
        ok: true,
        response: {},
      };
    }) as any;
    const { getByPlaceholderText, findByText, getByText } = renderWithRouter();
    await findByText("You have no templates.");
    await userEvent.type(getByPlaceholderText("Search..."), `${testTemplateId}{enter}`);
    await findByText("There are no templates matching your applied filters. Reset your filters to view your templates.");
    await userEvent.click(getByText("Reset filters"));
    await findByText("You have no templates.");
  });
});
