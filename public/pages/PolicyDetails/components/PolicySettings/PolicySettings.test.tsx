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
import { render } from "@testing-library/react";
import PolicySettings from "./PolicySettings";

describe("<PolicySettings /> spec", () => {
  beforeAll(() => {
    jest.useFakeTimers("modern");
    jest.setSystemTime(new Date(2021, 7, 1));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it("renders the component", () => {
    const { container } = render(
      <PolicySettings
        policyId={"some_id"}
        errorNotification={null}
        primaryTerm={1}
        lastUpdated={new Date().valueOf()}
        description={"some description"}
        sequenceNumber={2}
        ismTemplates={[]}
        onEdit={() => {}}
      />
    );

    expect(container.firstChild).toMatchSnapshot();
  });
});
