/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { render } from "@testing-library/react";
import AssociatedComponentsModal from "./AssociatedComponentsModal";

describe("<AssociatedComponentsModal /> spec", () => {
  it("renders the component", async () => {
    // the main unit test case is in TemplateActions.test.tsx
    render(
      <AssociatedComponentsModal
        template={{
          name: "",
          index_patterns: "",
          order: 0,
          composed_of: "",
        }}
        renderProps={() => 123}
      />
    );
    expect(document.body.children).toMatchSnapshot();
  });
});
