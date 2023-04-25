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

function renderCreateIndexTemplate(props: Omit<TemplateDetailProps, "history" | "location">) {
  return {
    ...render(
      <HashRouter>
        <CoreServicesContext.Provider value={coreServicesMock}>
          <ServicesContext.Provider value={browserServicesMock}>
            <Route
              path="/"
              render={(routeProps) => <TemplateDetail {...props} history={routeProps.history} location={routeProps.location} />}
            />
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
      () => expect((document.querySelector("#accordionForCreateIndexTemplateSettings") as HTMLDivElement).style.height).toEqual("0px"),
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
              index_template: {
                priority: 0,
              },
            },
          ],
        },
      };
    }) as any;
    const { getByText, getByTestId, findByTitle } = renderCreateIndexTemplate({
      templateName: "good_template",
    });
    await findByTitle("good_template");
    userEvent.click(getByText("View JSON"));
    await waitFor(() =>
      expect(
        JSON.parse(getByTestId("templateJSONDetailModal").querySelector('[data-test-subj="jsonEditor-valueDisplay"]')?.innerHTML || "{}")
      ).toEqual({
        name: "good_template",
        _meta: {
          flow: "simple",
        },
        priority: "0",
        template: {},
      })
    );
  });

  it("shows the delete modal", async () => {
    browserServicesMock.commonService.apiCaller = jest.fn(async () => {
      return {
        ok: true,
        response: {
          index_templates: [
            {
              name: "good_template",
              index_template: {
                priority: 0,
              },
            },
          ],
        },
      };
    }) as any;
    const { queryByText, getByText, getByTestId, findByTitle, findByText } = renderCreateIndexTemplate({
      templateName: "good_template",
    });
    await findByTitle("good_template");
    userEvent.click(getByText("Delete"));
    await findByText("Delete Templates");
    userEvent.click(getByTestId("deletaCancelButton"));
    await waitFor(() => expect(queryByText("Delete Templates")).toBeNull());
    userEvent.click(getByText("Delete"));
    await findByText("Delete Templates");
    userEvent.type(getByTestId("deleteInput"), "delete");
    userEvent.click(getByTestId("deleteConfirmButton"));
    await findByText(`This is ${ROUTES.TEMPLATES}`);
    expect(coreServicesMock.notifications.toasts.addSuccess).toBeCalled();
  });
});
