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

import { render, waitFor } from "@testing-library/react";
import React from "react";
import CreateIndexFlyout from "./CreateIndexFlyout";
import { coreServicesMock, browserServicesMock, apiCallerMock } from "../../../../../test/mocks";
import { CoreServicesContext } from "../../../../components/core_services";
import { ServicesContext } from "../../../../services";

describe("<CreateIndexFlyout /> spec", () => {
  beforeEach(() => {
    apiCallerMock(browserServicesMock);
  });
  it("renders the component", async () => {
    const component = render(
      <CoreServicesContext.Provider value={coreServicesMock}>
        <ServicesContext.Provider value={browserServicesMock}>
          <CreateIndexFlyout sourceIndices={[]} onCloseFlyout={() => {}} />,
        </ServicesContext.Provider>
      </CoreServicesContext.Provider>
    );
    await waitFor(
      () => expect((document.querySelector("#accordionForCreateIndexSettings") as HTMLDivElement).style.height).toEqual("0px"),
      {
        timeout: 3000,
      }
    );
    expect(component).toMatchSnapshot();
  }, 20000);
});
