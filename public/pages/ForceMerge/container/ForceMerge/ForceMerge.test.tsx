/*
 *   Copyright OpenSearch Contributors
 *
 *   Licensed under the Apache License, Version 2.0 (the "License").
 *   You may not use this file except in compliance with the License.
 *   A copy of the License is located at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   or in the "license" file accompanying this file. This file is distributed
 *   on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 *   express or implied. See the License for the specific language governing
 *   permissions and limitations under the License.
 */

/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { render, fireEvent, waitFor, findByText } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, RouteComponentProps, Switch } from "react-router-dom";
import { MemoryRouter as Router } from "react-router-dom";
import { CoreStart } from "opensearch-dashboards/public";
import { browserServicesMock, coreServicesMock } from "../../../../../test/mocks";
import { ServicesConsumer, ServicesContext } from "../../../../services";
import { BREADCRUMBS, ROUTES } from "../../../../utils/constants";
import { CoreServicesConsumer, CoreServicesContext } from "../../../../components/core_services";
import ForceMerge from "./ForceMerge";
import { ModalProvider, ModalRoot } from "../../../../components/Modal";
import { BrowserServices } from "../../../../models/interfaces";

function renderWithRouter(initialEntries = [ROUTES.FORCE_MERGE] as string[]) {
  return {
    ...render(
      <Router initialEntries={initialEntries}>
        <CoreServicesContext.Provider value={coreServicesMock}>
          <ServicesContext.Provider value={browserServicesMock}>
            <ServicesConsumer>
              {(services: BrowserServices | null) =>
                services && (
                  <CoreServicesConsumer>
                    {(core: CoreStart | null) =>
                      core && (
                        <ModalProvider>
                          <ModalRoot services={services} />
                          <Switch>
                            <Route path={ROUTES.FORCE_MERGE} render={(props: RouteComponentProps) => <ForceMerge {...props} />} />
                            <Route path={ROUTES.INDICES} render={(props: RouteComponentProps) => <h1>location is: {ROUTES.INDICES}</h1>} />
                          </Switch>
                        </ModalProvider>
                      )
                    }
                  </CoreServicesConsumer>
                )
              }
            </ServicesConsumer>
          </ServicesContext.Provider>
        </CoreServicesContext.Provider>
      </Router>
    ),
  };
}

const indices = [
  {
    "docs.count": 5,
    "docs.deleted": 2,
    health: "green",
    index: "index-source",
    pri: "1",
    "pri.store.size": "100KB",
    rep: "0",
    status: "open",
    "store.size": "100KB",
    uuid: "some_uuid",
  },
  {
    "docs.count": 5,
    "docs.deleted": 2,
    health: "green",
    index: "index-dest",
    pri: "1",
    "pri.store.size": "100KB",
    rep: "0",
    status: "open",
    "store.size": "100KB",
    uuid: "some_uuid",
  },
  {
    "docs.count": 5,
    "docs.deleted": 2,
    health: "green",
    index: "index-source-2",
    pri: "1",
    "pri.store.size": "100KB",
    rep: "0",
    status: "open",
    "store.size": "100KB",
    uuid: "some_uuid",
  },
];

const dataStreams = [
  {
    name: "log-redis-daily",
    timestamp_field: "@timestamp",
    indices: [".ds-log-redis-daily-000001", ".ds-log-redis-daily-000002"],
    writingIndex: ".ds-log-redis-daily-000002",
    generation: 2,
    status: "GREEN",
    template: "",
  },
];

const aliases = [
  {
    alias: "alias-1",
    index: "index-source",
    filter: "-",
    is_write_index: "false",
    "routing.index": "-",
    "routing.search": "-",
  },
  {
    alias: "alias-1",
    index: "index-source-2",
    filter: "-",
    is_write_index: "true",
    "routing.index": "-",
    "routing.search": "-",
  },
  {
    alias: "alias-2",
    index: "index-test-1",
    filter: "-",
    is_write_index: "-",
    "routing.index": "-",
    "routing.search": "-",
  },
  {
    alias: "alias-2",
    index: "index-test-2",
    filter: "-",
    is_write_index: "-",
    "routing.index": "-",
    "routing.search": "-",
  },
];

const mockApi = (validateQueryFail?: boolean) => {
  browserServicesMock.indexService.getIndices = jest.fn().mockImplementation((args) => ({
    ok: true,
    response: { indices: args.search.length > 0 ? indices.filter((index) => index.index.startsWith(args.search)) : indices },
  }));

  browserServicesMock.indexService.getDataStreams = jest.fn().mockImplementation((args) => ({
    ok: true,
    response: {
      dataStreams: args.search.length > 0 ? dataStreams.filter((ds) => ds.name.startsWith(args.search)) : dataStreams,
    },
  }));
  browserServicesMock.indexService.getAliases = jest.fn().mockImplementation((args) => ({
    ok: true,
    response: {
      aliases: args.search.length > 0 ? aliases.filter((alias) => alias.alias.startsWith(args.search)) : aliases,
    },
  }));

  browserServicesMock.commonService.apiCaller = jest.fn().mockImplementation((args) => {
    return Promise.resolve({ ok: true });
  });
};

describe("<ForceMerge /> spec", () => {
  beforeEach(() => {
    mockApi();
  });

  it("renders the component", async () => {
    const { container } = renderWithRouter();
    // wait for one tick
    await waitFor(() => {});
    expect(container.firstChild).toMatchSnapshot();
  });

  it("set breadcrumbs when mounting", async () => {
    renderWithRouter();

    // wait for one tick
    await waitFor(() => {});

    expect(coreServicesMock.chrome.setBreadcrumbs).toHaveBeenCalledTimes(1);
    expect(coreServicesMock.chrome.setBreadcrumbs).toHaveBeenCalledWith([
      BREADCRUMBS.INDEX_MANAGEMENT,
      BREADCRUMBS.INDICES,
      BREADCRUMBS.FORCE_MERGE,
    ]);
  });

  it("cancel back to indices page", async () => {
    const { getByText } = renderWithRouter();
    await waitFor(() => {});
    userEvent.click(getByText("Cancel"));

    expect(getByText(`location is: ${ROUTES.INDICES}`)).toBeInTheDocument();
  });

  it("source is required", async () => {
    // eslint-disable-next-line no-shadow
    const { getByText, getByTestId, findByText } = renderWithRouter();

    await waitFor(() => {
      getByText("Configure source index");
    });

    userEvent.click(getByTestId("forceMergeConfirmButton"));
    await findByText("Index or data stream is required.");
  });

  it("it goes to indices page when submit force merge successfully", async () => {
    const { getByText, getAllByTestId, getByTestId } = renderWithRouter();

    userEvent.type(getAllByTestId("comboBoxSearchInput")[0], "index-source");
    await waitFor(() => {});
    fireEvent.keyDown(getAllByTestId("comboBoxSearchInput")[0], { key: "ArrowDown", code: "ArrowDown" });
    fireEvent.keyDown(getAllByTestId("comboBoxSearchInput")[0], { key: "Enter", code: "Enter" });

    userEvent.click(getByTestId("forceMergeConfirmButton"));

    await waitFor(() => {});
    expect(getByText(`location is: ${ROUTES.INDICES}`)).toBeInTheDocument();
  });
});
