/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { MemoryRouter as Router, Route, RouteComponentProps, Switch } from "react-router-dom";
import { render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CreateIndexTemplate from "./CreateIndexTemplate";
import { ServicesContext } from "../../../../services";
import { browserServicesMock, coreServicesMock, apiCallerMock } from "../../../../../test/mocks";
import { ROUTES } from "../../../../utils/constants";
import { CoreServicesContext } from "../../../../components/core_services";

apiCallerMock(browserServicesMock);

function renderCreateIndexTemplateWithRouter(initialEntries = [ROUTES.CREATE_TEMPLATE] as string[]) {
  return {
    ...render(
      <Router initialEntries={initialEntries}>
        <CoreServicesContext.Provider value={coreServicesMock}>
          <ServicesContext.Provider value={browserServicesMock}>
            <Switch>
              <Route
                path={`${ROUTES.CREATE_TEMPLATE}/:template`}
                render={(props: RouteComponentProps) => <CreateIndexTemplate {...props} />}
              />
              <Route path={ROUTES.CREATE_TEMPLATE} render={(props: RouteComponentProps) => <CreateIndexTemplate {...props} />} />
              <Route path={ROUTES.TEMPLATES} render={(props: RouteComponentProps) => <h1>location is: {ROUTES.TEMPLATES}</h1>} />
            </Switch>
          </ServicesContext.Provider>
        </CoreServicesContext.Provider>
      </Router>
    ),
  };
}

describe("<CreateIndexTemplate /> spec", () => {
  it("it goes to templates page when click cancel", async () => {
    const { getByTestId, getByText } = renderCreateIndexTemplateWithRouter([`${ROUTES.CREATE_TEMPLATE}/good_template`]);
    await waitFor(() => {});
    userEvent.click(getByTestId("CreateIndexTemplateCancelButton"));
    await waitFor(() => {
      expect(getByText(`location is: ${ROUTES.TEMPLATES}`)).toBeInTheDocument();
    });
  });

  it("it goes to indices page when click create successfully in happy path", async () => {
    const { getByText, getByTestId } = renderCreateIndexTemplateWithRouter([`${ROUTES.CREATE_TEMPLATE}`]);

    const templateNameInput = getByTestId("form-row-name").querySelector("input") as HTMLInputElement;
    userEvent.type(templateNameInput, `good_template`);

    const submitButton = getByText("Create");
    userEvent.click(submitButton);
    await waitFor(() => expect(getByText("Index patterns must be defined")).not.toBeNull(), {
      timeout: 3000,
    });

    const patternInput = getByTestId("form-row-index_patterns").querySelector('[data-test-subj="comboBoxSearchInput"]') as HTMLInputElement;
    userEvent.type(patternInput, `test_patterns{enter}`);

    userEvent.click(submitButton);
    await waitFor(
      () => {
        expect(browserServicesMock.commonService.apiCaller).toBeCalledWith({
          endpoint: "transport.request",
          data: {
            method: "PUT",
            path: "_index_template/good_template",
            body: {
              priority: 0,
              template: {
                settings: {
                  "index.number_of_replicas": 1,
                  "index.number_of_shards": 1,
                  "index.refresh_interval": "1s",
                },
                mappings: { properties: {} },
              },
              index_patterns: ["test_patterns"],
            },
          },
        });
        expect(getByText(`location is: ${ROUTES.TEMPLATES}`)).toBeInTheDocument();
      },
      {
        timeout: 3000,
      }
    );
  });
});
