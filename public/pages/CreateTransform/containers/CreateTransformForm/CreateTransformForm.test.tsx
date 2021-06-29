/*
 * SPDX-License-Identifier: Apache-2.0
 *
 * The OpenSearch Contributors require contributions made to
 * this file be licensed under the Apache-2.0 license or a
 * compatible open source license.
 *
 * Modifications Copyright OpenSearch Contributors. See
 * GitHub history for details.
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
          fields: {
            keyword: {
              type: "keyword",
            },
          },
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
  })

  it("will show error on step 1", async () => {
    const { getByTestId, queryByText } = renderCreateTransformFormWithRouter();

    expect(getByTestId("createTransformNextButton")).toBeEnabled();

    userEvent.click(getByTestId("createTransformNextButton"));

    expect(queryByText("Job name is required.")).not.toBeNull();

    expect(queryByText("Source index is required.")).not.toBeNull();

    expect(queryByText("Target index is required.")).not.toBeNull();
  });
});

describe("<CreateTransformForm /> creation", () => {
  browserServicesMock.indexService.getIndices = jest.fn().mockResolvedValue({
    ok: true,
    response: { indices, totalIndices: 1 },
  });

  browserServicesMock.transformService.getMappings = jest.fn().mockResolvedValue({
    ok: true,
    response: sampleMapping,
  });

  it("routes from step 1 to step 2 and back", async () => {
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

    userEvent.click(getByTestId("createTransformNextButton"));

    expect(queryByText("Job name is required.")).toBeNull();

    expect(queryByText("Source index is required.")).toBeNull();

    expect(queryByText("Target index is required.")).toBeNull();

    //Check that it routes to step 2
    expect(queryByText("Timestamp field")).not.toBeNull();
  })
})
