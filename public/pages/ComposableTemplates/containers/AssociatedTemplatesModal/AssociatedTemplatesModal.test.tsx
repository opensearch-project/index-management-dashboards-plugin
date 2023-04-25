/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { render, waitFor } from "@testing-library/react";
import AssociatedTemplatesModal from "./AssociatedTemplatesModal";
import { browserServicesMock, coreServicesMock } from "../../../../../test/mocks";
import { ServicesContext } from "../../../../services";
import { CoreServicesContext } from "../../../../components/core_services";

describe("<AssociatedTemplatesModal /> spec", () => {
  it("renders the component", async () => {
    render(
      <CoreServicesContext.Provider value={coreServicesMock}>
        <ServicesContext.Provider value={browserServicesMock}>
          <AssociatedTemplatesModal componentTemplate="test" renderProps={() => <div>123</div>} />
        </ServicesContext.Provider>
      </CoreServicesContext.Provider>
    );
    await waitFor(() => {}, {
      timeout: 3000,
    });
    expect(document.body.children).toMatchSnapshot();
  });
});
