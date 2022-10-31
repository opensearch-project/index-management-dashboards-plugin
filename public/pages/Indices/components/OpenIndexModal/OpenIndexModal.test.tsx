/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { render } from "@testing-library/react";
import OpenIndexModal from "./OpenIndexModal";

describe("<OpenIndexModal /> spec", () => {
  it("renders the component", async () => {
    render(<OpenIndexModal selectedItems={[]} visible onConfirm={() => {}} onClose={() => {}} />);

    expect(document.body.children).toMatchSnapshot();
  });
});
