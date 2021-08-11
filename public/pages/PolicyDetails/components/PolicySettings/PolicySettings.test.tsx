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
import PolicySettings from "./PolicySettings";

describe("<PolicySettings /> spec", () => {
  it("renders the component", () => {
    const { container } = render(
      <PolicySettings
        policyId={"some_id"}
        channelId={"some_channel_id"}
        primaryTerm={1}
        lastUpdated={"2021-08-11T23:17:01.054Z"}
        description={"some description"}
        sequenceNumber={2}
        schemaVersion={3}
        ismTemplates={[]}
      />
    );

    expect(container.firstChild).toMatchSnapshot();
  });
});
