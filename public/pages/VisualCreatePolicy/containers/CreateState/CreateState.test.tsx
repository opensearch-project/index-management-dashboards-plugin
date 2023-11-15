/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { render } from "@testing-library/react";
import CreateState from "./CreateState";
import { DEFAULT_POLICY } from "../../utils/constants";

describe("<CreateState /> spec", () => {
  it("renders the component", () => {
    render(<CreateState policy={DEFAULT_POLICY} onSaveState={() => {}} onCloseFlyout={() => {}} state={null} />);
    expect(document.body.children[1]).toMatchSnapshot();
  });
});
