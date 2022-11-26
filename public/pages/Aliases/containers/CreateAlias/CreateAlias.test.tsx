/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { render } from "@testing-library/react";
import CreateAlias from "./index";
import { browserServicesMock } from "../../../../../test/mocks";
import { ServicesContext } from "../../../../services";

describe("<CreateAlias /> spec", () => {
  it("renders the component", async () => {
    // the main unit test case is in Aliases.test.tsx
    render(
      <ServicesContext.Provider value={browserServicesMock}>
        <CreateAlias visible onClose={() => {}} onSuccess={() => {}} />
      </ServicesContext.Provider>
    );
    expect(document.body.children).toMatchSnapshot();
  });
});
