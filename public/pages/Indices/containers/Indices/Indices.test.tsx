/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { fireEvent, render, waitFor } from "@testing-library/react";
// @ts-ignore
import userEvent from "@testing-library/user-event";
import { HashRouter as Router, Redirect, Route, Switch } from "react-router-dom";
import { CoreStart } from "opensearch-dashboards/public";
import { browserServicesMock, coreServicesMock } from "../../../../../test/mocks";
import Indices from "./Indices";
import { TEXT } from "../../components/IndexEmptyPrompt/IndexEmptyPrompt";
import { ModalProvider, ModalRoot } from "../../../../components/Modal";
import { ServicesConsumer, ServicesContext } from "../../../../services";
import { BREADCRUMBS, ROUTES } from "../../../../utils/constants";
import { CoreServicesConsumer, CoreServicesContext } from "../../../../components/core_services";
import { DataSourceMenuContext, DataSourceMenuProperties } from "../../../../services/DataSourceMenuContext";
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

function renderWithRouter(
  Component: React.ComponentType<any>,
  data: DataSourceMenuProperties = {
    dataSourceId: "",
    multiDataSourceEnabled: false,
  },
  renderFn = render
) {
  return {
    ...renderFn(
      <Router>
        <Switch>
          <Route
            path={ROUTES.INDICES}
            render={(props) => (
              <CoreServicesContext.Provider value={coreServicesMock}>
                <ServicesContext.Provider value={browserServicesMock}>
                  <ModalProvider>
                    <ServicesConsumer>{(services) => services && <ModalRoot services={services} />}</ServicesConsumer>
                    <CoreServicesConsumer>
                      {(core: CoreStart | null) => (
                        <ServicesConsumer>
                          {({ indexService, commonService }: any) => (
                            <DataSourceMenuContext.Provider value={data}>
                              <Component indexService={indexService} commonService={commonService} core={core} {...props} />
                            </DataSourceMenuContext.Provider>
                          )}
                        </ServicesConsumer>
                      )}
                    </CoreServicesConsumer>
                  </ModalProvider>
                </ServicesContext.Provider>
              </CoreServicesContext.Provider>
            )}
          />
          <Redirect from="/" to={ROUTES.INDICES} />
        </Switch>
      </Router>
    ),
  };
}

describe(`<Indices /> spec`, () => {
  it("renders the component", async () => {
    browserServicesMock.indexService.getIndices = jest.fn().mockResolvedValue({ ok: true, response: { indices: [], totalIndices: 0 } });
    const { container } = renderWithRouter(Indices);

    expect(container.firstChild).toMatchSnapshot();
  });

  it("shows LOADING on mount", async () => {
    browserServicesMock.indexService.getIndices = jest.fn().mockResolvedValue({ ok: true, response: { indices: [], totalIndices: 0 } });
    const { getByText } = renderWithRouter(Indices);

    getByText(TEXT.LOADING);
  });

  it("sets breadcrumbs when mounting", async () => {
    browserServicesMock.indexService.getIndices = jest.fn().mockResolvedValue({ ok: true, response: { indices: [], totalIndices: 0 } });
    renderWithRouter(Indices);

    expect(coreServicesMock.chrome.setBreadcrumbs).toHaveBeenCalledTimes(1);
    expect(coreServicesMock.chrome.setBreadcrumbs).toHaveBeenCalledWith([BREADCRUMBS.INDEX_MANAGEMENT, BREADCRUMBS.INDICES]);
  });

  it("loads indices", async () => {
    const indices = [
      {
        "docs.count": 5,
        "docs.deleted": 2,
        health: "green",
        index: "index_1",
        pri: "1",
        "pri.store.size": "100KB",
        rep: "0",
        status: "open",
        "store.size": "100KB",
        uuid: "some_uuid",
      },
    ];
    browserServicesMock.indexService.getIndices = jest.fn().mockResolvedValue({ ok: true, response: { indices, totalIndices: 1 } });
    const { getByText } = renderWithRouter(Indices);
    await waitFor(() => {});

    await waitFor(() => getByText("index_1"));
  });

  it("adds error toaster when get indices has error", async () => {
    browserServicesMock.indexService.getIndices = jest.fn().mockResolvedValue({ ok: false, error: "some error" });
    renderWithRouter(Indices);

    await waitFor(() => {});

    expect(coreServicesMock.notifications.toasts.addDanger).toHaveBeenCalledTimes(1);
    expect(coreServicesMock.notifications.toasts.addDanger).toHaveBeenCalledWith("some error");
  });

  it("adds error toaster when get indices throws error", async () => {
    browserServicesMock.indexService.getIndices = jest.fn().mockRejectedValue(new Error("rejected error"));
    renderWithRouter(Indices);

    await waitFor(() => {});

    expect(coreServicesMock.notifications.toasts.addDanger).toHaveBeenCalledTimes(1);
    expect(coreServicesMock.notifications.toasts.addDanger).toHaveBeenCalledWith("rejected error");
  });

  it("can add a policy to an index", async () => {
    const indices = [
      {
        "docs.count": 5,
        "docs.deleted": 2,
        health: "green",
        index: "index_1",
        pri: "1",
        "pri.store.size": "100KB",
        rep: "0",
        status: "open",
        "store.size": "100KB",
        uuid: "some_uuid",
      },
    ];
    browserServicesMock.indexService.getIndices = jest.fn().mockResolvedValue({ ok: true, response: { indices, totalIndices: 1 } });
    browserServicesMock.indexService.searchPolicies = jest
      .fn()
      .mockResolvedValue({ ok: true, response: { policies: [{ policy: "some_policy", id: "some_id" }] } });
    const { getByText, getByTestId } = renderWithRouter(Indices);

    await waitFor(() => getByText("index_1"));

    userEvent.click(document.querySelector('[data-test-subj="moreAction"] button') as Element);

    expect(getByTestId("Apply policyButton")).toBeDisabled();

    getByTestId("checkboxSelectRow-index_1").click();

    userEvent.click(document.querySelector('[data-test-subj="moreAction"] button') as Element);

    expect(getByTestId("Apply policyButton")).toBeEnabled();

    userEvent.click(getByTestId("Apply policyButton"));

    await waitFor(() => {});

    /*
     * TODO: Cannot proceed with this test, throws error
     *   Need to figure out why combo box is complaining
     *   TypeError: Cannot read property 'position' of null
     *   at Object.updatePosition (node_modules/@elastic/eui/lib/components/combo_box/combo_box.js:123:43)
     *   at node_modules/@elastic/eui/lib/components/combo_box/combo_box_options_list/combo_box_options_list.js:106:21
     *   at Timeout.callback [as _onTimeout] (../../node_modules/jsdom/lib/jsdom/browser/Window.js:592:19)
     * */

    // userEvent.click(getByTestId("comboBoxToggleListButton"));

    // await waitFor();

    // fireEvent.keyPress(getByTestId("comboBoxSearchInput"), { key: "Down Arrow", code: 40, charCode: 40 });

    // await waitFor();
  }, 10000);

  it("sorts/paginates the table", async () => {
    const indices = new Array(40).fill(null).map((_, index) => ({
      "docs.count": index,
      "docs.deleted": 2,
      health: "green",
      index: `index_${index}`,
      pri: "1",
      "pri.store.size": "100KB",
      rep: "0",
      status: "open",
      "store.size": "100KB",
      uuid: "some_uuid",
    }));
    browserServicesMock.indexService.getIndices = jest
      .fn()
      .mockResolvedValueOnce({ ok: true, response: { indices: indices.slice(0, 20), totalIndices: 40 } })
      .mockResolvedValueOnce({ ok: true, response: { indices: indices.slice(20), totalIndices: 40 } })
      .mockResolvedValueOnce({
        ok: true,
        response: {
          indices: indices.sort((a, b) => a["docs.count"] - b["docs.count"]).slice(0, 20),
          totalIndices: 40,
        },
      });

    browserServicesMock.indexService.searchPolicies = jest
      .fn()
      .mockResolvedValue({ ok: true, response: { policies: [{ policy: "some_policy", id: "some_id" }] } });
    const { getByText, getByTestId, getAllByTestId, queryByText } = renderWithRouter(Indices);

    // should load indices 0-19 on first load
    await waitFor(() => getByText("index_0"));
    expect(queryByText("index_39")).toBeNull();

    fireEvent.click(getAllByTestId("pagination-button-next")[0]);

    // should load indices 20-39 after clicking next
    await waitFor(() => getByText("index_39"));
    expect(queryByText("index_0")).toBeNull();

    // @ts-ignore
    fireEvent.click(getByTestId("tableHeaderCell_docs.count_6").firstChild);

    // should load indices 0-19 after clicking sort (defaults to asc) on docs.count
    await waitFor(() => getByText("index_0"));
    expect(queryByText("index_39")).toBeNull();
  });
});

describe("re-render on data-source-id prop change", () => {
  it("should re-render based on change in the data_source_id", async () => {
    const indices_data_source_id1 = new Array(10).fill(null).map((_, index) => ({
      "docs.count": index,
      "docs.deleted": 2,
      health: "green",
      index: `index_${index}`,
      pri: "1",
      "pri.store.size": "100KB",
      rep: "0",
      status: "open",
      "store.size": "100KB",
      uuid: "some_uuid",
    }));
    const indices_data_source_id2 = new Array(10).fill(null).map((_, index) => ({
      "docs.count": index,
      "docs.deleted": 2,
      health: "green",
      index: `index_ds2_${index}`,
      pri: "1",
      "pri.store.size": "100KB",
      rep: "0",
      status: "open",
      "store.size": "100KB",
      uuid: "some_uuid",
    }));
    browserServicesMock.indexService.getIndices = jest
      .fn()
      .mockResolvedValueOnce({ ok: true, response: { indices: indices_data_source_id1, totalIndices: 10 } })
      .mockResolvedValueOnce({ ok: true, response: { indices: indices_data_source_id2, totalIndices: 10 } });

    const { getByText, queryByText, rerender } = renderWithRouter(Indices, {
      dataSourceId: "test_data_source_id",
      multiDataSourceEnabled: true,
    });

    await waitFor(() => getByText("index_0"));
    expect(queryByText("index_11")).toBeNull();

    // prop change, should re-trigger
    renderWithRouter(
      Indices,
      {
        dataSourceId: "test_data_source_id_2",
        multiDataSourceEnabled: true,
      },
      rerender
    );
    await waitFor(() => getByText("index_ds2_0"));
    expect(queryByText("index_0")).toBeNull();
  });
});
