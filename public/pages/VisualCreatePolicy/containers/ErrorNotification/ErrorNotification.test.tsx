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
import ErrorNotification from "./ErrorNotification";

describe("<ErrorNotification /> spec", () => {
  it("renders the component", () => {
    const errorNotification = { destination: { slack: { url: "https://slack.com" } }, message_template: { source: "some source message" } };
    const { container } = render(
      <ErrorNotification
        errorNotificationJsonString={JSON.stringify(errorNotification, null, 4)}
        onChangeErrorNotificationJsonString={() => {}}
      />
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
