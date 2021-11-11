/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { render } from "@testing-library/react";
import ConfigurePolicy from "./ConfigurePolicy";

describe("<ConfigurePolicy /> spec", () => {
  it("renders the component", () => {
    const { container } = render(<ConfigurePolicy policyId="some_id" policyIdError="" isEdit={false} onChange={() => {}} />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
