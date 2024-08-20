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
import Aliases from "./Aliases";
import { ServicesContext } from "../../../../services";
import { ROUTES } from "../../../../utils/constants";
import { CoreServicesContext } from "../../../../components/core_services";
import userEvent from "@testing-library/user-event";
import { IAlias } from "../../interface";
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

function renderWithRouter() {
  return {
    ...render(
      <Router>
        <Switch>
          <Route
            path={ROUTES.ALIASES}
            render={(props) => (
              <CoreServicesContext.Provider value={coreServicesMock}>
                <ServicesContext.Provider value={browserServicesMock}>
                  <Aliases {...props} />
                </ServicesContext.Provider>
              </CoreServicesContext.Provider>
            )}
          />
          <Redirect from="/" to={ROUTES.ALIASES} />
        </Switch>
      </Router>
    ),
  };
}

const testAliasId = "test";
const multiIndexAliasId = "test2";

describe("<Aliases /> spec", () => {
  beforeEach(() => {
    browserServicesMock.commonService.apiCaller = jest.fn(async (payload) => {
      if (payload.endpoint === "cat.aliases") {
        return {
          ok: true,
          response: [
            {
              alias: testAliasId,
              index: "1",
            },
            {
              alias: multiIndexAliasId,
              index: "1",
            },
            {
              alias: multiIndexAliasId,
              index: "2",
            },
            {
              alias: multiIndexAliasId,
              index: "3",
            },
            {
              alias: multiIndexAliasId,
              index: "4",
            },
          ] as IAlias[],
        };
      } else if (payload.endpoint === "cat.indices") {
        return {
          ok: true,
          response: [
            {
              health: "green",
              status: "open",
              index: "1",
              pri: "1",
              rep: "0",
              "docs.count": "1",
              "docs.deleted": "0",
              "store.size": "5.2kb",
              "pri.store.size": "5.2kb",
            },
          ],
        };
      } else if (payload?.data?.name === multiIndexAliasId) {
        return {
          ok: false,
          error: "alias exist",
        };
      } else if (payload.endpoint === "transport.request" && payload.data?.path === "/_data_stream") {
        return {
          ok: true,
          response: {
            data_streams: [
              {
                name: "test_data_stream",
                indices: [],
              },
            ],
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
    const { container, getByTestId, queryByText } = renderWithRouter();

    expect(container.firstChild).toMatchSnapshot();
    await waitFor(() => {
      expect(browserServicesMock.commonService.apiCaller).toBeCalledTimes(1);
    });
    userEvent.click(getByTestId("tableHeaderCell_alias_0").querySelector("button") as Element);
    await waitFor(() => {
      expect(queryByText("1 more")).not.toBeNull();
      expect(browserServicesMock.commonService.apiCaller).toBeCalledTimes(2);
      expect(browserServicesMock.commonService.apiCaller).toBeCalledWith({
        data: { format: "json", name: `**`, s: "alias:asc" },
        endpoint: "cat.aliases",
      });
    });
  });

  it("with some actions", async () => {
    const {
      findByTitle,
      findByTestId,
      getByTestId,
      getByPlaceholderText,
      getByTitle,
      findByPlaceholderText,
      getByText,
    } = renderWithRouter();
    expect(browserServicesMock.commonService.apiCaller).toBeCalledTimes(1);
    userEvent.type(getByPlaceholderText("Search..."), `${testAliasId}{enter}`);
    await waitFor(() => {
      expect(browserServicesMock.commonService.apiCaller).toBeCalledTimes(2);
      expect(browserServicesMock.commonService.apiCaller).toBeCalledWith({
        data: { format: "json", name: `*${testAliasId}*`, s: "alias:desc" },
        endpoint: "cat.aliases",
      });
    });
    userEvent.click(document.getElementById(`_selection_column_${testAliasId}-checkbox`) as Element);
    await waitFor(() => {});
    userEvent.click(document.querySelector('[data-test-subj="moreAction"] button') as Element);
    userEvent.click(document.querySelector('[data-test-subj="editAction"]') as Element);
    userEvent.click(getByTestId("cancelCreateAliasButton"));
    userEvent.click(document.querySelector('[data-test-subj="moreAction"] button') as Element);
    userEvent.click(document.querySelector('[data-test-subj="editAction"]') as Element);
    await findByPlaceholderText("Specify alias name");
    expect(getByPlaceholderText("Specify alias name")).toBeDisabled();
    expect((getByPlaceholderText("Specify alias name") as HTMLInputElement).value).toEqual(testAliasId);
    expect(getByTitle("1")).toBeInTheDocument();
    expect(browserServicesMock.commonService.apiCaller).toBeCalledTimes(6);
    userEvent.type(getByTestId("form-name-indexArray").querySelector('[data-test-subj="comboBoxSearchInput"]') as Element, "2{enter}");
    userEvent.click(document.querySelector('[title="1"] button') as Element);
    userEvent.click(getByText("Save changes"));
    await waitFor(() => {
      expect(browserServicesMock.commonService.apiCaller).toBeCalledTimes(8);
      expect(browserServicesMock.commonService.apiCaller).toBeCalledWith({
        data: {
          body: {
            actions: [
              {
                remove: {
                  alias: testAliasId,
                  index: "1",
                },
              },
              {
                add: {
                  alias: testAliasId,
                  index: "2",
                },
              },
            ],
          },
        },
        endpoint: "indices.updateAliases",
      });
    });

    userEvent.click(getByTestId("Create aliasButton"));
    await findByTestId("createAliasButton");
    userEvent.click(getByTestId("cancelCreateAliasButton"));
    userEvent.click(getByTestId("Create aliasButton"));
    await findByTestId("createAliasButton");
    userEvent.click(getByTestId("createAliasButton"));
    await waitFor(() => {
      expect(getByText("Invalid alias name.")).not.toBeNull();
    });
    userEvent.type(getByPlaceholderText("Specify alias name"), multiIndexAliasId);
    userEvent.type(getByTestId("form-name-indexArray").querySelector('[data-test-subj="comboBoxSearchInput"]') as Element, "1{enter}");
    await waitFor(() => {});
    userEvent.click(getByTestId("createAliasButton"));
    await waitFor(() => {
      expect(coreServicesMock.notifications.toasts.addDanger).toBeCalledTimes(1);
      expect(coreServicesMock.notifications.toasts.addDanger).toBeCalledWith("alias exist");
    });
    userEvent.clear(getByPlaceholderText("Specify alias name"));
    userEvent.type(getByPlaceholderText("Specify alias name"), testAliasId);
    userEvent.click(getByTestId("createAliasButton"));
    await waitFor(() => {
      expect(browserServicesMock.commonService.apiCaller).toBeCalledTimes(17);
      expect(browserServicesMock.commonService.apiCaller).toBeCalledWith({
        data: {
          index: ["1"],
          name: testAliasId,
        },
        endpoint: "indices.putAlias",
      });
    });

    userEvent.click(getByText("1 more"));
    await findByTitle(`Indices in ${multiIndexAliasId} (4)`);
    userEvent.click(getByText("Rows per page: 10"));
    userEvent.click(getByTestId("tablePagination-25-rows"));
    userEvent.click(getByTestId("euiFlyoutCloseButton"));
  }, 70000);

  it("shows detail", async () => {
    const { getByTestId, findByTestId, getByText } = renderWithRouter();
    await findByTestId(`aliasDetail-${testAliasId}`);
    userEvent.click(getByTestId(`aliasDetail-${testAliasId}`));
    await waitFor(() => expect(getByText("Save changes")).toBeInTheDocument(), {
      timeout: 3000,
    });
  });
});
