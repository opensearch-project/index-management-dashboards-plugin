/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { render } from "@testing-library/react";
import UnsavedChangesBottomBar from "./index";

describe("<FormGenerator /> spec", () => {
  it("render the component", () => {
    render(<UnsavedChangesBottomBar unsavedCount={0} onClickCancel={async () => {}} onClickSubmit={async () => {}} />);
    expect(document.body.children).toMatchSnapshot();
  });
});
