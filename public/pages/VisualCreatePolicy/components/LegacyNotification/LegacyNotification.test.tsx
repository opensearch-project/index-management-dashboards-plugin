/*
 * SPDX-License-Identifier: Apache-2.0
 *
 * The OpenSearch Contributors require contributions made to
 * this file be licensed under the Apache-2.0 license or a
 * compatible open source license.
 *
 * Modifications Copyright OpenSearch Contributors. See
 * GitHub history for details.
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
        notificationJsonString={JSON.stringify(DEFAULT_LEGACY_ERROR_NOTIFICATION)}
        onChangeNotificationJsonString={() => {}}
        onSwitchToChannels={() => {}}
      />
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
