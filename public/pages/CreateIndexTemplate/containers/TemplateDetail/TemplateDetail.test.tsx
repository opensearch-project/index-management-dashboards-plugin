/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from "react";
import { act, render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HashRouter, Route } from "react-router-dom";
import { renderHook } from "@testing-library/react-hooks";
import TemplateDetail, { TemplateDetailProps } from "./TemplateDetail";
import { ServicesContext } from "../../../../services";
import { browserServicesMock, coreServicesMock } from "../../../../../test/mocks";
import { CoreServicesContext } from "../../../../components/core_services";
import { ROUTES } from "../../../../utils/constants";
import { FieldInstance } from "../../../../lib/field";
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

function renderCreateIndexTemplate(props: Omit<TemplateDetailProps, "history" | "location">) {
  return renderHook(() => {
    const ref = useRef<FieldInstance>({} as FieldInstance);
    const result = render(
      <HashRouter>
        <CoreServicesContext.Provider value={coreServicesMock}>
          <ServicesContext.Provider value={browserServicesMock}>
            <Route
              path="/"
              render={(routeProps) => <TemplateDetail {...props} ref={ref} history={routeProps.history} location={routeProps.location} />}
            />
            <Route path={ROUTES.TEMPLATES} render={(routeProps) => <>This is {ROUTES.TEMPLATES}</>} />
          </ServicesContext.Provider>
        </CoreServicesContext.Provider>
      </HashRouter>
    );
    return {
      ref,
      ...result,
    };
  }).result.current;
}

describe("<TemplateDetail /> spec", () => {
  // main unit test case is in CreateIndexTemplate.test.tsx
  it("render component in non-edit-mode", async () => {
    let times = 0;
    browserServicesMock.commonService.apiCaller = jest.fn(async (payload) => {
      if (payload?.data?.path?.includes("/_index_template")) {
        times++;
        return {
          ok: times !== 1,
          error: "error",
          response: [],
        };
      }
      return {
        ok: true,
        response: [],
      };
    }) as any;
    const { container, getByTestId, ref, findByText, queryByTestId } = renderCreateIndexTemplate({});
    await waitFor(
      () => expect((document.querySelector("#accordionForCreateIndexTemplateSettings") as HTMLDivElement).style.height).toEqual("0px"),
      {
        timeout: 3000,
      }
    );
    expect(container).toMatchSnapshot();

    /**
     * switch template type
     */
    await userEvent.click(getByTestId("form-row-data_stream").querySelector('[id="Data streams"]') as Element);
    await waitFor(() => {
      expect(ref.current.getValue("data_stream")).toEqual({
        timestamp_field: {
          name: "@timestamp",
        },
      });
    });
    await userEvent.click(getByTestId("form-row-data_stream").querySelector('[id="Indexes"]') as Element);
    await waitFor(() => {
      expect(ref.current.getValue("data_stream")).toEqual(undefined);
    });

    /**
     * preview
     */
    await userEvent.click(getByTestId("CreateIndexTemplatePreviewButton"));
    await waitFor(() => {
      expect(coreServicesMock.notifications.toasts.addDanger).toBeCalledWith("error");
    });
    await userEvent.click(getByTestId("CreateIndexTemplatePreviewButton"));
    await findByText("Preview template");
    await act(async () => {
      await userEvent.click(getByTestId("Preview template-ok"));
    });
    expect(queryByTestId("Preview template-ok")).toBeNull();
  });

  it("show the json", async () => {
    let times = 0;
    browserServicesMock.commonService.apiCaller = jest.fn(async (payload) => {
      if (payload.endpoint === "cat.aliases") {
        return {
          ok: true,
          response: [],
        };
      } else if (payload?.data?.path?.includes("/_index_template/good_template") && payload?.data?.method === "POST") {
        times++;
        return {
          ok: times !== 1,
          error: "error",
        };
      }
      return {
        ok: true,
        response: {
          index_templates: [
            {
              name: "good_template",
              index_template: {
                priority: 0,
                index_patterns: ["*"],
              },
            },
          ],
        },
      };
    }) as any;
    const { getByText, findByTitle, getByTestId, queryByTestId, findByTestId, ref } = renderCreateIndexTemplate({
      templateName: "good_template",
    });
    await findByTitle("good_template");
    await userEvent.click(getByText("View JSON"));
    await waitFor(() => expect(document.querySelector(".language-json")).toBeInTheDocument());

    await act(async () => {
      await userEvent.click(getByTestId("TemplateDetailTab-CONFIG"));
      ref.current.setValue("priority", "10");
    });
    await findByTestId("CancelUpdateTemplateButton");
    await userEvent.click(getByTestId("CancelUpdateTemplateButton"));
    await waitFor(() => {
      expect(queryByTestId("CancelUpdateTemplateButton")).toBeNull();
      expect(ref.current.getValue("priority")).toEqual("0");
    });

    await act(async () => {
      ref.current.setValue("priority", "10");
    });
    await act(async () => {
      await userEvent.click(getByTestId("updateTemplateButton"));
    });
    await waitFor(() => {
      expect(coreServicesMock.notifications.toasts.addDanger).toBeCalledWith(`error`);
    });

    await act(async () => {
      await userEvent.click(getByTestId("updateTemplateButton"));
    });
    await waitFor(() => {
      expect(coreServicesMock.notifications.toasts.addSuccess).toBeCalledWith(`good_template has been successfully updated.`);
    });
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

  it("simulate error", async () => {
    browserServicesMock.commonService.apiCaller = jest.fn(async (payload) => {
      if (payload?.data?.path?.includes("/_index_template/_simulate")) {
        return {
          ok: false,
          error: "error",
        };
      }
      return {
        ok: true,
        response: {
          index_templates: [
            {
              name: "good_template",
              index_template: {
                priority: 0,
                index_patterns: ["*"],
              },
            },
          ],
        },
      };
    }) as any;
    renderCreateIndexTemplate({
      templateName: "good_template",
    });
    await waitFor(() => {
      expect(coreServicesMock.notifications.toasts.addDanger).toBeCalledWith("error");
    });
  });

  it("get template error", async () => {
    browserServicesMock.commonService.apiCaller = jest.fn(async (payload) => {
      if (payload?.data?.path?.includes("/_index_template")) {
        return {
          ok: false,
          error: "error",
        };
      }
      return {
        ok: true,
        response: {
          index_templates: [
            {
              name: "good_template",
              index_template: {
                priority: 0,
                index_patterns: ["*"],
              },
            },
          ],
        },
      };
    }) as any;
    const { findByText } = renderCreateIndexTemplate({
      templateName: "good_template",
    });
    await findByText(`This is ${ROUTES.TEMPLATES}`);
  });
});
