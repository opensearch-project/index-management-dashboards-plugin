/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { render, waitFor } from "@testing-library/react";
import TemplateDetail, { TemplateDetailProps } from "./TemplateDetail";
import { ServicesContext } from "../../../../services";
import { browserServicesMock, coreServicesMock } from "../../../../../test/mocks";
import { CoreServicesContext } from "../../../../components/core_services";
import { HashRouter, Route } from "react-router-dom";
import { ROUTES } from "../../../../utils/constants";
import userEvent from "@testing-library/user-event";

function renderCreateComposableTemplate(props: Omit<TemplateDetailProps, "history">) {
  return {
    ...render(
      <HashRouter>
        <CoreServicesContext.Provider value={coreServicesMock}>
          <ServicesContext.Provider value={browserServicesMock}>
            <Route path="/" render={(routeProps) => <TemplateDetail {...props} history={routeProps.history} />} />
            <Route path={ROUTES.COMPOSABLE_TEMPLATES} render={(routeProps) => <>This is {ROUTES.COMPOSABLE_TEMPLATES}</>} />
          </ServicesContext.Provider>
        </CoreServicesContext.Provider>
      </HashRouter>
    ),
  };
}

describe("<TemplateDetail /> spec", () => {
  // main unit test case is in CreateComposableTemplate.test.tsx
  it("render component", async () => {
    const { container } = renderCreateComposableTemplate({});
    expect(container).toMatchSnapshot();
  });

  it("show the json", async () => {
    browserServicesMock.commonService.apiCaller = jest.fn(async () => {
      return {
        ok: true,
        response: {
          component_templates: [
            {
              name: "good_template",
              component_template: {
                template: {},
              },
            },
          ],
        },
      };
    }) as any;
    const { getByText, getByTestId, findByTitle } = renderCreateComposableTemplate({
      readonly: true,
      templateName: "good_template",
    });
    await findByTitle("good_template");
    userEvent.click(getByText("View JSON"));
    await waitFor(() =>
      expect(
        JSON.parse(getByTestId("templateJSONDetailModal").querySelector('[data-test-subj="jsonEditor-valueDisplay"]')?.innerHTML || "{}")
      ).toEqual({
        name: "good_template",
        template: {},
      })
    );
  });

  it("shows the delete modal", async () => {
    browserServicesMock.commonService.apiCaller = jest.fn(async () => {
      return {
        ok: true,
        response: {
          component_templates: [
            {
              name: "good_template",
              component_template: {
                template: {},
              },
            },
          ],
        },
      };
    }) as any;
    const { queryByText, getByText, getByTestId, findByTitle, findByText } = renderCreateComposableTemplate({
      readonly: true,
      templateName: "good_template",
    });
    await findByTitle("good_template");
    userEvent.click(getByText("Delete"));
    await findByText("Delete component templates");
    userEvent.click(getByTestId("deletaCancelButton"));
    await waitFor(() => expect(queryByText("Delete component templates")).toBeNull());
    userEvent.click(getByText("Delete"));
    await findByText("Delete component templates");
    userEvent.click(getByTestId("deleteConfirmButton"));
    await findByText(`This is ${ROUTES.COMPOSABLE_TEMPLATES}`);
    expect(coreServicesMock.notifications.toasts.addSuccess).toBeCalled();
  });
});
