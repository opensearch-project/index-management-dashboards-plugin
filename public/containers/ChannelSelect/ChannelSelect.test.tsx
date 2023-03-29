/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { render } from "@testing-library/react";
import ChannelNotification from "./ChannelSelect";

describe("<ChannelNotification /> spec", () => {
  it("renders the component", () => {
    const { container } = render(<ChannelNotification value={["test"]} onChange={() => {}} />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
