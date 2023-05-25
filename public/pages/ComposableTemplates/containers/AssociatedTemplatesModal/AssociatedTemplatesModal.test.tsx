/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { render, waitFor } from "@testing-library/react";
import AssociatedTemplatesModal from "./AssociatedTemplatesModal";
import userEvent from "@testing-library/user-event";
import { browserServicesMock, coreServicesMock } from "../../../../../test/mocks";
import { ServicesContext } from "../../../../services";
import { CoreServicesContext } from "../../../../components/core_services";

describe("<AssociatedTemplatesModal /> spec", () => {
  it("renders the component", async () => {
    const templateName = "test_template";
    const componentTemplateName = "test_component_template";
    const unlinkHandlerMock = jest.fn();
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
                  name: templateName,
                  index_template: {
                    composed_of: [componentTemplateName],
                  },
                },
              ],
            },
          };
        }
        return { ok: true, response: {} };
      }
    );
    const { findByText, getByTestId, queryByText } = render(
      <CoreServicesContext.Provider value={coreServicesMock}>
        <ServicesContext.Provider value={browserServicesMock}>
          <AssociatedTemplatesModal
            componentTemplate="test_component_template"
            renderProps={({ setVisible }) => (
              <div data-test-subj="test" onClick={() => setVisible(true)}>
                123
              </div>
            )}
            onUnlink={unlinkHandlerMock}
          />
        </ServicesContext.Provider>
      </CoreServicesContext.Provider>
    );
    await findByText("123");
    await userEvent.click(getByTestId("test"));
    await findByText("Associated index templates");
    await findByText(templateName);
    await findByText(/This table contains 1 rows out of 1 rows;/);
    expect(document.body.children).toMatchSnapshot();
    await userEvent.click(document.querySelector(`[aria-label='Unlink from ${templateName}?']`) as Element);
    await findByText(`Unlink from ${templateName}?`);
    await findByText(
      `The component ${componentTemplateName} will be removed from the template ${templateName}. This will affect any new indexes created with the template.`
    );
    await userEvent.click(getByTestId(`Unlink from ${templateName}?-confirm`));
    await waitFor(() => {
      expect(browserServicesMock.commonService.apiCaller).toBeCalledTimes(3);
      expect(coreServicesMock.notifications.toasts.addDanger).toBeCalledWith("error");
      expect(unlinkHandlerMock).toBeCalledTimes(0);
    });
    await userEvent.click(getByTestId(`Unlink from ${templateName}?-confirm`));
    await waitFor(() => {
      expect(browserServicesMock.commonService.apiCaller).toBeCalledTimes(6);
      expect(coreServicesMock.notifications.toasts.addSuccess).toBeCalledWith(
        `${componentTemplateName} has been successfully unlinked from ${templateName}.`
      );
      expect(unlinkHandlerMock).toBeCalledWith(templateName);
    });
    await userEvent.click(getByTestId("euiFlyoutCloseButton"));
    await waitFor(() => {
      expect(queryByText("Associated index templates")).toBeNull();
    });
  });
});
