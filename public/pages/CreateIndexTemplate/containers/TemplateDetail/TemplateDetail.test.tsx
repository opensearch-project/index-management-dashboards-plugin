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
import { HashRouter, Route } from "react-router-dom";

function renderCreateIndexTemplate(props: Omit<TemplateDetailProps, "history">) {
  return {
    ...render(
      <HashRouter>
        <CoreServicesContext.Provider value={coreServicesMock}>
          <ServicesContext.Provider value={browserServicesMock}>
            <Route path="/" render={(routeProps) => <TemplateDetail {...props} history={routeProps.history} />} />
          </ServicesContext.Provider>
        </CoreServicesContext.Provider>
      </HashRouter>
    ),
  };
}

describe("<TemplateDetail /> spec", () => {
  // main unit test case is in CreateIndexTemplate.test.tsx
  it("render component", async () => {
    const { container } = renderCreateIndexTemplate({});
    await waitFor(
      () => expect((document.querySelector("#accordion_for_create_index_template_settings") as HTMLDivElement).style.height).toEqual("0px"),
      {
        timeout: 3000,
      }
    );
    expect(container).toMatchSnapshot();
  });
});
