/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { render } from "@testing-library/react";
import DeleteTemplateModal from "./DeleteComposableTemplatesModal";

describe("<DeleteTemplateModal /> spec", () => {
  it("renders the component", async () => {
    // the main unit test case is in TemplateActions.test.tsx
    render(<DeleteTemplateModal selectedItems={[]} visible onDelete={() => {}} onClose={() => {}} />);
    expect(document.body.children).toMatchSnapshot();
  });
});
