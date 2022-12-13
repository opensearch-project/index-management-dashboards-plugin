/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { render, waitFor } from "@testing-library/react";
import TemplateDetail, { TemplateDetailProps } from "./TemplateDetail";
import { ServicesContext } from "../../../../services";
import { browserServicesMock, coreServicesMock } from "../../../../../test/mocks";
import { CoreServicesContext } from "../../../../components/core_services";

function renderCreateIndexTemplate(props: TemplateDetailProps) {
  return {
    ...render(
      <CoreServicesContext.Provider value={coreServicesMock}>
        <ServicesContext.Provider value={browserServicesMock}>
          <TemplateDetail {...props} />
        </ServicesContext.Provider>
      </CoreServicesContext.Provider>
    ),
  };
}

describe("<TemplateDetail /> spec", () => {
  // main unit test case is in CreateIndexTemplate.test.tsx
  it("render component", async () => {
    const { container } = renderCreateIndexTemplate({});
    await waitFor(() => {}, {
      timeout: 3000,
    });
    expect(container).toMatchSnapshot();
  });
});
