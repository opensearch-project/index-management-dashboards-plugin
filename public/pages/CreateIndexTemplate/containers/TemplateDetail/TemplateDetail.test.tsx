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

function renderCreateIndexTemplate(props: Omit<TemplateDetailProps, "history">) {
  return {
    ...render(
      <HashRouter>
        <CoreServicesContext.Provider value={coreServicesMock}>
          <ServicesContext.Provider value={browserServicesMock}>
            <Route path="/" render={(routeProps) => <TemplateDetail {...props} history={routeProps.history} />} />
            <Route path={ROUTES.TEMPLATES} render={(routeProps) => <>This is {ROUTES.TEMPLATES}</>} />
          </ServicesContext.Provider>
        </CoreServicesContext.Provider>
      </HashRouter>
    ),
  };
}

describe("<TemplateDetail /> spec", () => {
  // main unit test case is in CreateIndexTemplate.test.tsx
  it("render component", async () => {
    const { container } = renderCreateIndexTemplate({});
    await waitFor(
      () => expect((document.querySelector("#accordion_for_create_index_template_settings") as HTMLDivElement).style.height).toEqual("0px"),
      {
        timeout: 3000,
      }
    );
    expect(container).toMatchSnapshot();
  });

  it("show the json", async () => {
    browserServicesMock.commonService.apiCaller = jest.fn(async () => {
      return {
        ok: true,
        response: {
          index_templates: [
            {
              name: "good_template",
              template: {},
            },
          ],
        },
      };
    });
    const { getByText, getByTestId, findByTitle } = renderCreateIndexTemplate({
      readonly: true,
      templateName: "good_template",
    });
    await findByTitle("good_template");
    userEvent.click(getByText("View JSON"));
    await waitFor(() =>
      expect(
        JSON.parse(getByTestId("templateJSONDetailModal").querySelector('[data-test-subj="json-editor-value-display"]')?.innerHTML || "{}")
      ).toEqual({
        name: "good_template",
        template: {
          mappings: {
            properties: {},
          },
          settings: {},
        },
      })
    );
  });
});
