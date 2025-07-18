/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { render, waitFor } from "@testing-library/react";
import AssociatedComponentsModal, { AssociatedComponentsModalProps } from "./AssociatedComponentsModal";
import { ServicesContext } from "../../../../services";
import { CoreServicesContext } from "../../../../components/core_services";
import { browserServicesMock, coreServicesMock } from "../../../../../test/mocks";
import userEventModule from "@testing-library/user-event";

function renderWithServices(props: AssociatedComponentsModalProps) {
  return {
    ...render(
      <CoreServicesContext.Provider value={coreServicesMock}>
        <ServicesContext.Provider value={browserServicesMock}>
          <AssociatedComponentsModal {...props} />
        </ServicesContext.Provider>
      </CoreServicesContext.Provider>
    ),
  };
}

describe("<AssociatedComponentsModal /> spec", () => {
  const userEvent = userEventModule.setup();

  it("renders with empty", async () => {
    renderWithServices({
      template: {
        name: "test_template",
        index_patterns: "['*']",
        order: 0,
        composed_of: "",
      },
      renderProps() {
        return <></>;
      },
    });
    expect(document.body.children).toMatchSnapshot();
  });

  it("renders the component", async () => {
    let time = 0;
    browserServicesMock.commonService.apiCaller = jest.fn(
      async (payload): Promise<any> => {
        if (payload.data?.path?.startsWith("/_component_template/")) {
          return {
            ok: true,
            response: {},
          };
        } else if (payload.data?.path?.startsWith("/_index_template")) {
          if (payload.data?.method === "POST") {
            time++;
            return {
              ok: time !== 1,
              error: "error",
            };
          }
          return {
            ok: true,
            response: {
              index_templates: [
                {
                  name: "test_template",
                  index_template: {
                    composed_of: ["test_component_template"],
                  },
                },
              ],
            },
          };
        }
        return { ok: true, response: {} };
      }
    );
    const unlinkHandlerMock = jest.fn();
    const { findByText, findByTestId, getByTestId, queryByText } = renderWithServices({
      template: {
        name: "test_template",
        index_patterns: "['*']",
        order: 0,
        composed_of: "",
        templateDetail: {
          composed_of: ["test_component_template"],
          template: {},
          name: "test_template",
          version: 0,
          priority: 0,
          index_patterns: ["*"],
        },
      },
      renderProps: ({ setVisible }) => (
        <button data-test-subj="TestBtn" onClick={() => setVisible(true)}>
          123
        </button>
      ),
      onUnlink: unlinkHandlerMock,
    });
    await findByTestId("TestBtn");
    await userEvent.click(getByTestId("TestBtn"));
    await findByText("Associated component templates");
    await findByText("This table contains 1 rows out of 1 rows; Page 1 of 1.");
    expect(document.body.children).toMatchSnapshot();
    await userEvent.click(document.querySelector(`[aria-label="Unlink test_component_template?"]`) as Element);
    await findByText("Unlink from test_template?");
    await userEvent.click(getByTestId("Unlink from test_template?-confirm"));
    await waitFor(() => {
      expect(browserServicesMock.commonService.apiCaller).toBeCalledTimes(2);
      expect(coreServicesMock.notifications.toasts.addDanger).toBeCalledWith("error");
      expect(unlinkHandlerMock).toBeCalledTimes(0);
    });
    await userEvent.click(getByTestId("Unlink from test_template?-confirm"));
    await waitFor(() => {
      expect(browserServicesMock.commonService.apiCaller).toBeCalledTimes(4);
      expect(coreServicesMock.notifications.toasts.addSuccess).toBeCalledWith(
        "test_component_template has been successfully unlinked from test_template."
      );
      expect(unlinkHandlerMock).toBeCalledWith("test_component_template");
    });
    await userEvent.click(getByTestId("euiFlyoutCloseButton"));
    await waitFor(() => {
      expect(queryByText("Associated component templates")).toBeNull();
    });
  });
});
