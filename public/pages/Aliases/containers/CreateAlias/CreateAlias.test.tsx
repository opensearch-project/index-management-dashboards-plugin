/*
 *   Copyright OpenSearch Contributors
 *
 *   Licensed under the Apache License, Version 2.0 (the "License").
 *   You may not use this file except in compliance with the License.
 *   A copy of the License is located at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   or in the "license" file accompanying this file. This file is distributed
 *   on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 *   express or implied. See the License for the specific language governing
 *   permissions and limitations under the License.
 */

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
