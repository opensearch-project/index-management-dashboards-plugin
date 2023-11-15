/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { render } from "@testing-library/react";
import DeleteModal from "./DeleteModal";

describe("<DeleteIndexModal /> spec", () => {
  it("renders the component", async () => {
    // the main unit test case is in TemplateActions.test.tsx
    render(<DeleteModal title="test" tips="test" selectedItems={["test"]} visible onConfirm={() => {}} onClose={() => {}} />);
    expect(document.body.children).toMatchSnapshot();
  });
});
