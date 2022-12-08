/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TemplateForm, { TemplateFormProps } from "./index";
import { ServicesConsumer, ServicesContext } from "../../../../services";
import { browserServicesMock, coreServicesMock, apiCallerMock } from "../../../../../test/mocks";
import { BrowserServices } from "../../../../models/interfaces";
import { IndicesUpdateMode } from "../../../../utils/constants";
import { CoreServicesContext } from "../../../../components/core_services";

apiCallerMock(browserServicesMock);

function renderCreateIndexWithRouter(props: Omit<TemplateFormProps, "commonService">) {
  return {
    ...render(
      <CoreServicesContext.Provider value={coreServicesMock}>
        <ServicesContext.Provider value={browserServicesMock}>
          <ServicesConsumer>
            {(services: BrowserServices | null) => services && <TemplateForm {...props} commonService={services.commonService} />}
          </ServicesConsumer>
        </ServicesContext.Provider>
      </CoreServicesContext.Provider>
    ),
  };
}

describe("<TemplateForm /> spec", () => {
  it("show a toast if getIndices gracefully fails", async () => {
    const { getByText } = renderCreateIndexWithRouter({
      index: "bad_index",
    });

    await waitFor(() => {
      getByText("Update");
    });
    expect(coreServicesMock.notifications.toasts.addDanger).toHaveBeenCalledTimes(1);
    expect(coreServicesMock.notifications.toasts.addDanger).toHaveBeenCalledWith("bad_error");
  });

  it("shows error for index name input when clicking create", async () => {
    const { queryByText, getByText } = renderCreateIndexWithRouter({});

    await waitFor(() => getByText("Define index"));

    expect(queryByText("Index name can not be null.")).toBeNull();

    userEvent.click(getByText("Create"));
    await waitFor(() => {
      expect(queryByText("Index name can not be null.")).not.toBeNull();
    });
  });

  it("routes you back to indices and shows a success toast when successfully creating a index", async () => {
    const { getByText, getByPlaceholderText, getByTestId } = renderCreateIndexWithRouter({});

    await waitFor(() => {
      getByText("Define index");
    });

    const indexNameInput = getByPlaceholderText("Please enter the name for your index");

    userEvent.type(indexNameInput, `bad_index`);
    userEvent.click(document.body);
    await waitFor(() => {});
    userEvent.clear(indexNameInput);
    userEvent.type(indexNameInput, `good_index`);
    userEvent.click(document.body);
    await waitFor(() => {
      expect(getByTestId("form-name-index.number_of_replicas").querySelector("input")).toHaveAttribute("value", "10");
    });
    userEvent.click(getByText("Create"));
    await waitFor(() => {
      expect(coreServicesMock.notifications.toasts.addSuccess).toHaveBeenCalledWith("[good_index] has been successfully created.");
    });
  });

  it("shows a danger toast when getting graceful error from create index", async () => {
    const { getByText, getByPlaceholderText } = renderCreateIndexWithRouter({});

    await waitFor(() => getByText("Define index"));

    userEvent.type(getByPlaceholderText("Please enter the name for your index"), `bad_index`);
    userEvent.click(getByText("Create"));

    await waitFor(() => {
      expect(coreServicesMock.notifications.toasts.addDanger).toHaveBeenCalledWith("bad_index");
    });
  });

  it("it shows detail and does not call any api when nothing modified", async () => {
    const { getByText } = renderCreateIndexWithRouter({
      index: "good_index",
    });
    await waitFor(() => getByText("Define index"));
    userEvent.click(getByText("Update"));

    await waitFor(() => {
      // it shows detail and does not call any api when nothing modified
      expect(browserServicesMock.commonService.apiCaller).toBeCalledTimes(2);
    });
  });

  it("shows detail info and update others", async () => {
    const { getByText, getByTestId, getByTitle } = renderCreateIndexWithRouter({
      index: "good_index",
    });

    await waitFor(() => getByText("Define index"));

    userEvent.click(getByTitle("update_test_1").querySelector("button") as Element);
    userEvent.type(getByTestId("comboBoxSearchInput"), "test_1{enter}");
    userEvent.type(getByTestId("form-name-index.number_of_replicas").querySelector("input") as Element, "2");
    userEvent.click(getByTestId("create index add field button"));
    await waitFor(() => {});
    await userEvent.clear(getByTestId("mapping-visual-editor-1-field-name"));
    await userEvent.type(getByTestId("mapping-visual-editor-1-field-name"), "test_mapping_2");
    await userEvent.click(document.body);
    userEvent.click(getByText("Update"));

    await waitFor(() => {
      expect(coreServicesMock.notifications.toasts.addSuccess).toBeCalledTimes(1);
      expect(browserServicesMock.commonService.apiCaller).toBeCalledWith({
        endpoint: "indices.updateAliases",
        method: "PUT",
        data: {
          body: {
            actions: [
              {
                remove: {
                  index: "good_index",
                  alias: "update_test_1",
                },
              },
              {
                add: {
                  index: "good_index",
                  alias: "test_1",
                },
              },
            ],
          },
        },
      });

      expect(browserServicesMock.commonService.apiCaller).toBeCalledWith({
        endpoint: "indices.putSettings",
        method: "PUT",
        data: {
          index: "good_index",
          flat_settings: true,
          body: {
            "index.number_of_replicas": "12",
          },
        },
      });

      expect(browserServicesMock.commonService.apiCaller).toBeCalledWith({
        endpoint: "indices.putMapping",
        method: "PUT",
        data: {
          index: "good_index",
          body: {
            properties: {
              test_mapping_2: {
                type: "text",
              },
            },
          },
        },
      });
    });
  });

  it("shows detail alias and update alias only", async () => {
    const { getByText, getByTestId, getByTitle } = renderCreateIndexWithRouter({
      index: "good_index",
      mode: IndicesUpdateMode.alias,
    });

    await waitFor(() => {});

    userEvent.click(getByTitle("update_test_1").querySelector("button") as Element);
    userEvent.type(getByTestId("comboBoxSearchInput"), "test_1{enter}");
    await waitFor(() => {});
    userEvent.click(getByText("Update"));

    await waitFor(() => {
      // shows detail alias and update alias only
      expect(coreServicesMock.notifications.toasts.addSuccess).toBeCalledTimes(1);
      expect(browserServicesMock.commonService.apiCaller).toBeCalledWith({
        endpoint: "indices.updateAliases",
        method: "PUT",
        data: {
          body: {
            actions: [
              {
                remove: {
                  index: "good_index",
                  alias: "update_test_1",
                },
              },
              {
                add: {
                  index: "good_index",
                  alias: "test_1",
                },
              },
            ],
          },
        },
      });
    });
  });

  it("shows detail mappings and update mappings only", async () => {
    const { getByText, getByTestId } = renderCreateIndexWithRouter({
      index: "good_index",
      mode: IndicesUpdateMode.mappings,
    });

    await waitFor(() => {});

    userEvent.click(getByTestId("create index add field button"));
    await waitFor(() => {});
    await userEvent.clear(getByTestId("mapping-visual-editor-1-field-name"));
    await userEvent.type(getByTestId("mapping-visual-editor-1-field-name"), "test_mapping_2");
    await userEvent.click(document.body);
    await waitFor(() => {});
    userEvent.click(getByText("Update"));

    await waitFor(() => {
      expect(coreServicesMock.notifications.toasts.addSuccess).toBeCalledTimes(1);

      expect(browserServicesMock.commonService.apiCaller).toBeCalledWith({
        endpoint: "indices.putMapping",
        method: "PUT",
        data: {
          index: "good_index",
          body: {
            properties: {
              test_mapping_2: {
                type: "text",
              },
            },
          },
        },
      });
    });
  });

  it("shows detail settings and update settings only", async () => {
    const { getByText, getByTestId } = renderCreateIndexWithRouter({
      index: "good_index",
      mode: IndicesUpdateMode.settings,
    });

    await waitFor(() => {});

    userEvent.type(getByTestId("form-name-index.number_of_replicas").querySelector("input") as Element, "2");
    userEvent.click(getByText("Update"));

    await waitFor(() => {
      expect(coreServicesMock.notifications.toasts.addSuccess).toBeCalledTimes(1);

      expect(browserServicesMock.commonService.apiCaller).toBeCalledWith({
        endpoint: "indices.putSettings",
        method: "PUT",
        data: {
          index: "good_index",
          flat_settings: true,
          body: {
            "index.number_of_replicas": "12",
          },
        },
      });
    });
  });

  it("it triggers onCancel when click cancel", async () => {
    const onCancelMock = jest.fn();
    const { getByText } = renderCreateIndexWithRouter({
      index: "good_index",
      onCancel: onCancelMock,
    });
    await waitFor(() => {});
    userEvent.click(getByText("Cancel"));
    await (() => {
      expect(onCancelMock).toBeCalledTimes(1);
      expect(onCancelMock).toBeCalledWith(undefined);
    });
  });
});
