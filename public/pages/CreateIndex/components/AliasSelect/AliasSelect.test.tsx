/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { render, waitFor } from "@testing-library/react";
import AliasSelect from "./index";

describe("<AliasSelect /> spec", () => {
  it("renders the component", async () => {
    const { container } = render(<AliasSelect refreshOptions={() => Promise.resolve({ ok: true, response: [] })} onChange={() => {}} />);
    await waitFor(() => {
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
