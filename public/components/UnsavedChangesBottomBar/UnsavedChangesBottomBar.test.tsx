/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { render, cleanup } from "@testing-library/react";
import UnsavedChangesBottomBar from "./index";

describe("<FormGenerator /> spec", () => {
  let appWrapper: HTMLDivElement;

  beforeEach(() => {
    // Create a mock DOM element with the ID 'app-wrapper'
    appWrapper = document.createElement("div");
    appWrapper.setAttribute("id", "app-wrapper");
    document.body.appendChild(appWrapper);
  });

  afterEach(() => {
    // Clean up the mock DOM element after each test
    document.body.removeChild(appWrapper);
    cleanup();
  });

  it("render the component", () => {
    render(<UnsavedChangesBottomBar unsavedCount={0} onClickCancel={async () => {}} onClickSubmit={async () => {}} />);
    expect(document.body.children).toMatchSnapshot();
  });
});
