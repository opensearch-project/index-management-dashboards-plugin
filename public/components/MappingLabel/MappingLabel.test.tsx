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
