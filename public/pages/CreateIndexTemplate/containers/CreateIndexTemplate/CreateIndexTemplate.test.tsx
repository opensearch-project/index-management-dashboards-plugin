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

function renderCreateIndexTemplateWithRouter(initialEntries = [ROUTES.CREATE_TEMPLATE] as string[]) {
  return {
    ...render(
      <Router initialEntries={initialEntries}>
        <CoreServicesContext.Provider value={coreServicesMock}>
          <ServicesContext.Provider value={browserServicesMock}>
            <Switch>
              <Route
                path={`${ROUTES.CREATE_TEMPLATE}/:template/:mode`}
                render={(props: RouteComponentProps) => <CreateIndexTemplate {...props} />}
              />
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
  beforeEach(() => {
    apiCallerMock(browserServicesMock);
  });
  it("render template pages", async () => {
    const { findByTitle, container } = renderCreateIndexTemplateWithRouter([`${ROUTES.CREATE_TEMPLATE}/good_template`]);
    await findByTitle("good_template");
    expect(container).toMatchSnapshot();
  });

  it("it goes to indices page when click create successfully in happy path", async () => {
    const { getByText, getByTestId } = renderCreateIndexTemplateWithRouter([`${ROUTES.CREATE_TEMPLATE}`]);

    const templateNameInput = getByTestId("form-row-name").querySelector("input") as HTMLInputElement;
    const submitButton = getByTestId("CreateIndexTemplateCreateButton");
    const shardsInput = getByTestId("form-row-template.settings.index.number_of_shards").querySelector("input") as HTMLInputElement;
    const replicaInput = getByTestId("form-row-template.settings.index.number_of_replicas").querySelector("input") as HTMLInputElement;
    userEvent.type(templateNameInput, `bad_template`);

    userEvent.click(submitButton);
    await waitFor(() => expect(getByText("Index patterns must be defined")).not.toBeNull(), {
      timeout: 3000,
    });

    const patternInput = getByTestId("form-row-index_patterns").querySelector('[data-test-subj="comboBoxSearchInput"]') as HTMLInputElement;
    userEvent.type(patternInput, `test_patterns{enter}`);

    userEvent.click(submitButton);
    await waitFor(() => expect(coreServicesMock.notifications.toasts.addDanger).toBeCalledWith("bad template"));
    userEvent.clear(templateNameInput);
    userEvent.type(templateNameInput, "good_template");

    userEvent.clear(shardsInput);
    userEvent.type(shardsInput, "1.5");
    await waitFor(() => expect(getByText("Number of primary shards must be an integer.")).toBeInTheDocument(), { timeout: 3000 });
    userEvent.clear(shardsInput);
    userEvent.type(shardsInput, "1");

    userEvent.clear(replicaInput);
    userEvent.type(replicaInput, "1.5");
    await waitFor(() => expect(getByText("Number of replicas must be an integer")).toBeInTheDocument(), { timeout: 3000 });
    userEvent.clear(replicaInput);
    userEvent.type(replicaInput, "1");

    userEvent.click(getByTestId("createIndexAddFieldButton"));
    userEvent.click(submitButton);
    await waitFor(() => expect(getByText("Field name is required, please input")).not.toBeNull());
    userEvent.click(getByTestId("mapping-visual-editor-0-delete-field"));

    userEvent.click(submitButton);
    await waitFor(
      () => {
        expect(browserServicesMock.commonService.apiCaller).toBeCalledWith({
          endpoint: "transport.request",
          data: {
            method: "PUT",
            path: "/_index_template/good_template",
            body: {
              _meta: {
                flow: "simple",
              },
              composed_of: [],
              priority: 0,
              template: {
                settings: {
                  "index.number_of_replicas": "1",
                  "index.number_of_shards": "1",
                },
                mappings: {
                  properties: {},
                },
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
  }, 20000);
});
