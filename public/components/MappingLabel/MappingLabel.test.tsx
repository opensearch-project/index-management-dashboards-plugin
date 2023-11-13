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
import { render } from "@testing-library/react";
import MappingLabel from "./MappingLabel";

describe("<TemplateDetail /> spec", () => {
  // main unit test case is in IndexMapping.test.tsx
  it("render component", async () => {
    const { container } = render(
      <MappingLabel
        onChange={() => {
          return "";
        }}
        onFieldNameCheck={function (val: string): string {
          throw new Error("Function not implemented.");
        }}
        onAddSubField={function (): void {
          throw new Error("Function not implemented.");
        }}
        onAddSubObject={function (): void {
          throw new Error("Function not implemented.");
        }}
        onDeleteField={function (): void {
          throw new Error("Function not implemented.");
        }}
        id={""}
        value={{
          fieldName: "text",
          type: "text",
        }}
      />
    );
    expect(container).toMatchSnapshot();
  });
});
