/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { render } from "@testing-library/react";
import AssociatedTemplatesModal from "./AssociatedTemplatesModal";
import userEvent from "@testing-library/user-event";
import { browserServicesMock, coreServicesMock } from "../../../../../test/mocks";
import { ServicesContext } from "../../../../services";
import { CoreServicesContext } from "../../../../components/core_services";

describe("<AssociatedTemplatesModal /> spec", () => {
  it("renders the component", async () => {
    browserServicesMock.commonService.apiCaller = jest.fn(
      async (payload): Promise<any> => {
        if (payload.endpoint === "transport.request" && payload.data.path === "_index_template/*") {
          return {
            ok: true,
            response: {
              index_templates: [],
            },
          };
        }

        return {
          ok: true,
        };
      }
    );
    const { findByText, getByTestId } = render(
      <CoreServicesContext.Provider value={coreServicesMock}>
        <ServicesContext.Provider value={browserServicesMock}>
          <AssociatedTemplatesModal
            componentTemplate="test"
            renderProps={({ setVisible }) => (
              <div data-test-subj="test" onClick={() => setVisible(true)}>
                123
              </div>
            )}
          />
        </ServicesContext.Provider>
      </CoreServicesContext.Provider>
    );
    await findByText("123");
    await userEvent.click(getByTestId("test"));
    await findByText("Associated index templates");
    await findByText(/This table contains 0 rows;/);
    expect(document.body.children).toMatchSnapshot();
  });
});
