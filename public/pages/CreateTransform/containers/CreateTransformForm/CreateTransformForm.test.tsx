/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { Redirect, Route, RouteComponentProps, Switch } from "react-router-dom";
import { MemoryRouter as Router } from "react-router";
import userEvent from "@testing-library/user-event";
import { ServicesConsumer, ServicesContext } from "../../../../services";
import { browserServicesMock, coreServicesMock } from "../../../../../test/mocks";
import { BrowserServices } from "../../../../models/interfaces";
import { ModalProvider, ModalRoot } from "../../../../components/Modal";
import { BREADCRUMBS, ROUTES } from "../../../../utils/constants";
import CreateTransformForm from "./CreateTransformForm";
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

const sampleMapping = {
  index_1: {
    mappings: {
      properties: {
        category: {
          type: "text",
        },
        customer_gender: {
          type: "keyword",
        },
        day_of_week: {
          type: "keyword",
        },
        day_of_week_i: {
          type: "integer",
        },
        geoip: {
          properties: {
            city_name: {
              type: "keyword",
            },
            region_name: {
              type: "keyword",
            },
          },
        },
        order_date: {
          type: "date",
        },
        products: {
          properties: {
            _id: {
              type: "text",
              fields: {
                keyword: {
                  type: "keyword",
                  ignore_above: 256,
                },
              },
            },
            category: {
              type: "text",
              fields: {
                keyword: {
                  type: "keyword",
                },
              },
            },
            price: {
              type: "half_float",
            },
            quantity: {
              type: "integer",
            },
            tax_amount: {
              type: "half_float",
            },
            taxful_price: {
              type: "half_float",
            },
            taxless_price: {
              type: "half_float",
            },
          },
        },
        taxful_total_price: {
          type: "half_float",
        },
        taxless_total_price: {
          type: "half_float",
        },
        total_quantity: {
          type: "integer",
        },
        type: {
          type: "keyword",
        },
        user: {
          type: "keyword",
        },
      },
    },
  },
};

const indexData = [
  {
    _id: "H1tNZHoBkfvfBoG1npgz",
    _index: "index_1",
    _score: 1,
    _source: {
      category: "Women's Clothing",
      customer_gender: "FEMALE",
      day_of_week: "Monday",
      day_of_week_i: 0,
      geoip: {
        city_name: "New York",
        region_name: "New York",
      },
      order_date: "2021-07-15T13:32:10+00:00",
      products: [
        {
          _id: "sold_product_588880_18574",
          category: "Women's Clothing",
          price: 28.99,
          quantity: 1,
          tax_amount: 0,
          taxful_price: 28.99,
          taxless_price: 28.99,
        },
      ],
      taxful_total_price: 61.98,
      taxless_total_price: 61.98,
      total_quantity: 2,
      type: "order",
      user: "elyssa",
    },
    _type: "_doc",
  },
];

function renderCreateTransformFormWithRouter() {
  return {
    ...render(
      <Router>
        <CoreServicesContext.Provider value={coreServicesMock}>
          <ServicesContext.Provider value={browserServicesMock}>
            <ServicesConsumer>
              {(services: BrowserServices | null) =>
                services && (
                  <ModalProvider>
                    <ModalRoot services={services} />
                    <Switch>
                      <Route
                        path={ROUTES.CREATE_TRANSFORM}
                        render={(props: RouteComponentProps) => (
                          <div style={{ padding: "25px 25px" }}>
                            <CreateTransformForm
                              {...props}
                              transformService={services.transformService}
                              rollupService={services.rollupService}
                              indexService={services.indexService}
                              core={coreServicesMock}
                            />
                          </div>
                        )}
                      />
                      <Route path={ROUTES.TRANSFORMS} render={(props) => <div>Testing transform landing page</div>} />
                      <Redirect from="/" to={ROUTES.CREATE_TRANSFORM} />
                    </Switch>
                  </ModalProvider>
                )
              }
            </ServicesConsumer>
          </ServicesContext.Provider>
        </CoreServicesContext.Provider>
      </Router>
    ),
  };
}

describe("<CreateTransformForm /> spec", () => {
  browserServicesMock.transformService.getMappings = jest.fn().mockResolvedValue({
    ok: true,
    response: sampleMapping,
  });

  browserServicesMock.rollupService.getMappings = jest.fn().mockResolvedValue({
    ok: true,
    response: sampleMapping,
  });

  browserServicesMock.transformService.searchSampleData = jest.fn().mockResolvedValue({
    ok: true,
    response: {
      data: indexData,
      total: { value: 1 },
    },
  });

  it("renders the component", async () => {
    const { container } = renderCreateTransformFormWithRouter();

    expect(container.firstChild).toMatchSnapshot();
  });

  it("set breadcrumbs when mounting", async () => {
    renderCreateTransformFormWithRouter();

    expect(coreServicesMock.chrome.setBreadcrumbs).toHaveBeenCalledTimes(4);
    expect(coreServicesMock.chrome.setBreadcrumbs).toHaveBeenCalledWith([
      BREADCRUMBS.INDEX_MANAGEMENT,
      BREADCRUMBS.TRANSFORMS,
      BREADCRUMBS.CREATE_TRANSFORM,
    ]);
  });

  it("routes back to transform landing page if cancelled", async () => {
    const { getByTestId, getByText } = renderCreateTransformFormWithRouter();

    expect(getByTestId("createTransformCancelButton")).toBeEnabled();

    userEvent.click(getByTestId("createTransformCancelButton"));

    await waitFor(() => getByText("Testing transform landing page"));
  });

  it("does not move to step 2 without info", async () => {
    const { getByTestId, getByText, getByLabelText, queryByText } = renderCreateTransformFormWithRouter();
    browserServicesMock.transformService.getTransform = jest.fn().mockResolvedValue({
      ok: false,
      response: {},
    });

    expect(getByTestId("createTransformNextButton")).toBeEnabled();

    userEvent.click(getByTestId("createTransformNextButton"));
    await waitFor(() => {}, { timeout: 2000 });

    // Currently no pop up warnings?
    // Check still on step 1
    expect(getByText("Job name and description"));
  });
});

describe("<CreateTransformForm /> creation", () => {
  browserServicesMock.indexService.getIndices = jest.fn().mockResolvedValue({
    ok: true,
    response: { indices, totalIndices: 1 },
  });

  browserServicesMock.transformService.searchSampleData = jest.fn().mockResolvedValue({
    ok: true,
    response: {
      data: indexData,
      total: { value: 1, relation: "gte" },
    },
  });

  browserServicesMock.transformService.getMappings = jest.fn().mockResolvedValue({
    ok: true,
    response: sampleMapping,
  });

  browserServicesMock.rollupService.getMappings = jest.fn().mockResolvedValue({
    ok: true,
    response: sampleMapping,
  });

  browserServicesMock.indexService.getDataStreamsAndIndicesNames = jest.fn().mockResolvedValue({
    ok: true,
    response: {
      indices: ["index_1"],
      dataStreams: ["data_stream_1"],
    },
  });

  it("routes from step 1 to step 2 and back", async () => {
    const { getByTestId, getByLabelText, queryByText, getAllByTestId, getByText } = renderCreateTransformFormWithRouter();

    browserServicesMock.transformService.getTransform = jest.fn().mockResolvedValue({
      ok: false,
      response: {},
    });

    fireEvent.focus(getByLabelText("Name"));
    await userEvent.type(getByLabelText("Name"), "some_transform_id");
    fireEvent.blur(getByLabelText("Name"));

    fireEvent.focus(getByTestId("description"));
    await userEvent.type(getByTestId("description"), "some description");
    fireEvent.blur(getByTestId("description"));

    await userEvent.type(getAllByTestId("comboBoxSearchInput")[0], "index_1");
    fireEvent.keyDown(getAllByTestId("comboBoxSearchInput")[0], { key: "Enter", code: "Enter" });

    await userEvent.type(getAllByTestId("comboBoxSearchInput")[1], "some_target_index");
    fireEvent.keyDown(getAllByTestId("comboBoxSearchInput")[1], { key: "Enter", code: "Enter" });

    userEvent.click(getByTestId("createTransformNextButton"));

    await waitFor(() => {}, { timeout: 4000 });

    //Check that it routes to step 2
    expect(queryByText("Job name and description")).toBeNull();
    expect(queryByText("Select fields to transform")).not.toBeNull();
  });

  it("routes from step 1 to step 4", async () => {
    const transform = {
      _id: "some_transform_id",
      _version: 3,
      _seq_no: 7,
      _primary_term: 1,
      transform: {
        transform_id: "some_transform_id",
        enabled: true,
        schedule: {
          interval: {
            period: 1,
            unit: "Minutes",
            start_time: 1602100553,
          },
        },
        last_updated_time: 1602100553,
        description: "some description",
        source_index: "index_1",
        target_index: "some_target_index",
        page_size: 1000,
        delay: 0,
        continuous: false,
        metadata_id: null,
        enabledTime: null,
        lastUpdatedTime: null,
        schemaVersion: 1,
        groups: [],
        aggregations: {},
      },
    };

    // Pretending like it passed even though we don't actually define groups or aggregations
    browserServicesMock.transformService.putTransform = jest.fn().mockResolvedValue({
      ok: true,
      response: transform,
    });

    const { getByTestId, getByLabelText, queryByText, getAllByTestId } = renderCreateTransformFormWithRouter();

    fireEvent.focus(getByLabelText("Name"));
    await userEvent.type(getByLabelText("Name"), "some_transform_id");
    fireEvent.blur(getByLabelText("Name"));

    fireEvent.focus(getByTestId("description"));
    await userEvent.type(getByTestId("description"), "some description");
    fireEvent.blur(getByTestId("description"));

    await userEvent.type(getAllByTestId("comboBoxSearchInput")[0], "index_1");
    fireEvent.keyDown(getAllByTestId("comboBoxSearchInput")[0], { key: "Enter", code: "Enter" });

    await userEvent.type(getAllByTestId("comboBoxSearchInput")[1], "some_target_index");
    fireEvent.keyDown(getAllByTestId("comboBoxSearchInput")[1], { key: "Enter", code: "Enter" });

    await waitFor(() => {}, { timeout: 2000 });
    userEvent.click(getByTestId("createTransformNextButton"));

    // Check that it routes to step 2
    await waitFor(() => {}, { timeout: 2000 });
    expect(queryByText("Select fields to transform")).not.toBeNull();

    // Does not test adding groups and aggregations, this fucntionality is
    // covered by Cypress tests and component Jest tests
    userEvent.click(getByTestId("createTransformNextButton"));

    // Check that it routes to step 3
    await waitFor(() => {}, { timeout: 2000 });
    expect(queryByText("Job enabled by default")).not.toBeNull();
    userEvent.click(getByTestId("createTransformNextButton"));

    // Check that it routes to step 4
    await waitFor(() => {}, { timeout: 2000 });
    expect(
      queryByText("You can only change the description and schedule after creating a job. Double-check your choices before proceeding.")
    ).not.toBeNull();

    //Test create
    userEvent.click(getByTestId("createTransformSubmitButton"));
    await waitFor(() => {});

    expect(browserServicesMock.transformService.putTransform).toHaveBeenCalledTimes(1);
    expect(coreServicesMock.notifications.toasts.addSuccess).toHaveBeenCalledTimes(1);
    expect(coreServicesMock.notifications.toasts.addSuccess).toHaveBeenCalledWith(
      `Transform job "some_transform_id" successfully created.`
    );
  });
});
