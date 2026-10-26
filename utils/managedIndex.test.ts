/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { getManagedIndexJobStatus } from "./managedIndex";
import { ManagedIndexMetaData } from "../models/interfaces";

const metaData = (overrides: Partial<ManagedIndexMetaData>): ManagedIndexMetaData => ({
  index: "index",
  indexUuid: "uuid",
  policyId: "policy",
  ...overrides,
});

describe("getManagedIndexJobStatus", () => {
  it("returns Initializing when there is no metadata yet", () => {
    expect(getManagedIndexJobStatus(null)).toBe("Initializing");
  });

  it("returns Completed when the policy has completed", () => {
    expect(getManagedIndexJobStatus(metaData({ policyCompleted: true }))).toBe("Completed");
  });

  it("returns Failed when retries or the current action failed", () => {
    expect(getManagedIndexJobStatus(metaData({ retryInfo: { failed: true, consumedRetries: 1 } }))).toBe("Failed");
    expect(
      getManagedIndexJobStatus(metaData({ action: { name: "rollover", startTime: 0, index: 0, failed: true, consumedRetries: 0 } }))
    ).toBe("Failed");
  });

  it("returns Running otherwise", () => {
    expect(getManagedIndexJobStatus(metaData({ retryInfo: { failed: false, consumedRetries: 0 } }))).toBe("Running");
  });
});
