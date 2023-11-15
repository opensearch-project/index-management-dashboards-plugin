/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { render } from "@testing-library/react";
import CustomFormRow from "./index";

describe("<FormGenerator /> spec", () => {
  it("render the component", () => {
    render(
      <CustomFormRow helpText="test">
        <h1>test custom form row</h1>
      </CustomFormRow>
    );
    expect(document.body.children).toMatchSnapshot();
  });
});
