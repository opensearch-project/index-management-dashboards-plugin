/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { render } from "@testing-library/react";
import PolicySettings from "./PolicySettings";

describe("<PolicySettings /> spec", () => {
  beforeAll(() => {
    jest.useFakeTimers("modern");
    jest.setSystemTime(new Date(2021, 7, 1));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it("renders the component", () => {
    const { container } = render(
      <PolicySettings
        policyId={"some_id"}
        errorNotification={null}
        primaryTerm={1}
        lastUpdated={new Date().valueOf()}
        description={"some description"}
        sequenceNumber={2}
        ismTemplates={[]}
        onEdit={() => {}}
      />
    );

    expect(container.firstChild).toMatchSnapshot();
  });
});
