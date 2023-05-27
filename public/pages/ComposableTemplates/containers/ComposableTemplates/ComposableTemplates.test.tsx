/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { act, render, waitFor } from "@testing-library/react";
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
          <Route path={ROUTES.CREATE_COMPOSABLE_TEMPLATE} render={() => <>create template</>} />
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
      if (payload.endpoint === "transport.request" && (payload?.data?.method === "GET" || "")) {
        if (payload?.data?.path.includes("_component_template") && payload?.data?.path.includes(testTemplateId)) {
          return {
            ok: false,
            error: "Not Found1",
          };
        } else if (payload.data?.path?.startsWith("/_index_template")) {
          return {
            ok: true,
            response: {
              index_templates: [
                {
                  name: "test_template",
                  index_template: {
                    composed_of: [`${testTemplateId}-1`],
                  },
                },
              ],
            },
          };
        }

        return {
          ok: true,
          response: {
            component_templates: [
              {
                name: `${testTemplateId}-2`,
                component_template: {
                  template: {
                    aliases: {
                      a: {},
                    },
                  },
                },
              },
              {
                name: testTemplateId,
                component_template: {
                  template: {
                    aliases: {
                      a: {},
                    },
                  },
                },
              },
              {
                name: `${testTemplateId}-1`,
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
    const { getByPlaceholderText, getByTestId, findByTestId, findByText, queryByTestId } = renderWithRouter();

    expect(browserServicesMock.commonService.apiCaller).toBeCalledTimes(2);
    await userEvent.click(getByTestId("tableHeaderCell_name_0").querySelector('[data-test-subj="tableHeaderSortButton"]') as Element);
    await waitFor(() => {
      expect(browserServicesMock.commonService.apiCaller).toBeCalledTimes(3);
    });
    /**
     * search
     */
    await userEvent.type(getByPlaceholderText("Search..."), `${testTemplateId}{enter}`);
    await waitFor(() => {
      expect(queryByTestId(`templateDetail-${testTemplateId}`)).toBeNull();
    });
    await waitFor(() => {
      expect(browserServicesMock.commonService.apiCaller).toBeCalledTimes(5);
      expect(coreServicesMock.notifications.toasts.addDanger).toBeCalledTimes(1);
    });
    await userEvent.clear(getByPlaceholderText("Search..."));
    await findByTestId(`templateDetail-${testTemplateId}`);
    await userEvent.click(document.querySelector(".euiFilterButton-hasNotification") as Element);
    await userEvent.click(getByTestId(`FilterGroupSelectItem-aliases`));
    await waitFor(() => {
      expect(queryByTestId(`checkboxSelectRow-${testTemplateId}-1`)).toBeNull();
    });
    await act(async () => {
      await userEvent.click(document.body);
    });
    await waitFor(() => {
      expect(queryByTestId(`FilterGroupSelectItem-aliases`)).toBeNull();
    });

    /**
     * sort
     */
    await userEvent.click(getByTestId(`checkboxSelectRow-${testTemplateId}`));
    await waitFor(() => {
      expect(getByTestId("deleteAction")).toBeEnabled();
    });

    /**
     * view associated
     */
    await userEvent.click(getByTestId(`ViewAssociatedIndexTemplates-${testTemplateId}`));
    await findByTestId("euiFlyoutCloseButton");
    await userEvent.click(getByTestId("euiFlyoutCloseButton"));

    /**
     * delete
     */
    await userEvent.click(getByTestId(`DeleteComponentTemplate-${testTemplateId}`));
    await findByTestId("deleteConfirmButton");
    await act(async () => {
      await userEvent.click(getByTestId("deleteConfirmButton"));
    });
    await waitFor(() => {
      expect(coreServicesMock.notifications.toasts.addSuccess).toBeCalledWith(`Delete [${testTemplateId}] successfully`);
    });

    /**
     * create
     */
    await userEvent.click(getByTestId("Create component templateButton"));
    await findByText("create template");
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
    const { getByPlaceholderText, findByText, getByText, getByTestId } = renderWithRouter();
    await findByText("You have no templates.");
    await userEvent.type(getByPlaceholderText("Search..."), `${testTemplateId}{enter}`);
    await findByText("There are no templates matching your applied filters. Reset your filters to view your templates.");
    await userEvent.click(getByText("Reset filters"));
    await findByText("You have no templates.");
    await userEvent.click(getByTestId("CreateComponentTemplateWhenNoTemplateFound"));
    await findByText("create template");
  });
});
