/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { render } from "@testing-library/react";
import LegacyNotification from "./LegacyNotification";
import { DEFAULT_LEGACY_ERROR_NOTIFICATION } from "../../utils/constants";

describe("<LegacyNotification /> spec", () => {
  it("renders the component", () => {
    const { container } = render(
      <LegacyNotification
        value={DEFAULT_LEGACY_ERROR_NOTIFICATION}
        onChange={() => {}}
        onSwitchToChannels={() => {}}
      />
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
