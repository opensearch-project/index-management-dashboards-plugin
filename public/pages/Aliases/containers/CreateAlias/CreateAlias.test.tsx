/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { render, waitFor } from "@testing-library/react";
import CreateAlias from "./index";
import { browserServicesMock } from "../../../../../test/mocks";
import { ServicesContext } from "../../../../services";

describe("<CreateAlias /> spec", () => {
  // the main unit test case is in Aliases.test.tsx
  it("renders the component", async () => {
    browserServicesMock.commonService.apiCaller = jest.fn(async () => ({
      ok: true,
      response: [],
    })) as typeof browserServicesMock.commonService.apiCaller;
    render(
      <ServicesContext.Provider value={browserServicesMock}>
        <CreateAlias visible onClose={() => {}} onSuccess={() => {}} />
      </ServicesContext.Provider>
    );
    await waitFor(() => {
      expect(document.body.children).toMatchSnapshot();
    });
  });
});
