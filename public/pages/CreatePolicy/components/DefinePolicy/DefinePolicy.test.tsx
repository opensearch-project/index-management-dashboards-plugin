/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { render } from "@testing-library/react";
import DefinePolicy from "./DefinePolicy";
import { DEFAULT_POLICY } from "../../utils/constants";

describe("<DefinePolicy /> spec", () => {
  it("renders the component", () => {
    const { container } = render(
      <DefinePolicy jsonString={DEFAULT_POLICY} hasJSONError={false} onChange={() => {}} onAutoIndent={() => {}} />
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
