/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import ManagedIndexService from "./ManagedIndexService";
import { getIndexToDataStreamMapping } from "./DataStreamService";

jest.mock("./DataStreamService", () => ({
  getIndexToDataStreamMapping: jest.fn().mockResolvedValue({}),
}));

const explainAllResponse = {
  "index-a": { index: "index-a", index_uuid: "a", policy_id: "policy", policy_completed: true },
  "index-b": { index: "index-b", index_uuid: "b", policy_id: "policy", action: { name: "rollover", failed: true } },
  "index-c": { index: "index-c", index_uuid: "c", policy_id: "policy" },
  "index-d": { index: "index-d", index_uuid: "d", policy_id: "policy", policy_completed: true },
  total_managed_indices: 4,
};

const getManagedIndices = async (query: object) => {
  const callAsCurrentUser = jest.fn((endpoint: string) =>
    Promise.resolve(endpoint === "ism.explainAll" ? explainAllResponse : { policy: {}, _seq_no: 1, _primary_term: 1 })
  );
  const osDriver = { asScoped: () => ({ callAsCurrentUser }) };
  const service = new ManagedIndexService(osDriver as any);
  const response = { custom: jest.fn((value) => value) };
  const result: any = await service.getManagedIndices({} as any, { query } as any, response as any);
  return { callAsCurrentUser, body: result.body };
};

describe("ManagedIndexService getManagedIndices", () => {
  it("passes index sort and pagination through to the explain API", async () => {
    const { callAsCurrentUser } = await getManagedIndices({ from: 20, size: 10, sortField: "index", sortDirection: "asc" });
    expect(callAsCurrentUser).toHaveBeenCalledWith(
      "ism.explainAll",
      expect.objectContaining({ sortField: "managed_index.index", sortOrder: "asc", from: 20, size: 10 })
    );
  });

  it("sorts by job status and paginates on the server", async () => {
    const { callAsCurrentUser, body } = await getManagedIndices({ from: 1, size: 2, sortField: "jobStatus", sortDirection: "asc" });
    expect(callAsCurrentUser).toHaveBeenCalledWith(
      "ism.explainAll",
      expect.objectContaining({ sortField: "managed_index.index", sortOrder: "asc", from: 0, size: 10000 })
    );
    // Completed (a, d), Failed (b), Running (c) -> page starting at 1 with size 2
    expect(body.response.managedIndices.map((item: { index: string }) => item.index)).toEqual(["index-d", "index-b"]);
    expect(body.response.totalManagedIndices).toBe(4);
    // Policies are only fetched for the returned page
    expect(callAsCurrentUser.mock.calls.filter(([endpoint]) => endpoint === "ism.getPolicy")).toHaveLength(2);
  });

  it("sorts by job status descending", async () => {
    const { body } = await getManagedIndices({ from: 0, size: 10, sortField: "jobStatus", sortDirection: "desc" });
    expect(body.response.managedIndices.map((item: { index: string }) => item.index)).toEqual(["index-c", "index-b", "index-a", "index-d"]);
  });

  it("reports the number of fetched indices as the total when sorting on the server", async () => {
    // Indices that belong to a data stream are dropped when data streams aren't shown, even though explain counts them.
    (getIndexToDataStreamMapping as jest.Mock).mockResolvedValueOnce({ "index-a": "stream" });
    const { body } = await getManagedIndices({ from: 0, size: 10, sortField: "jobStatus", sortDirection: "asc", showDataStreams: false });
    expect(body.response.managedIndices.map((item: { index: string }) => item.index)).toEqual(["index-d", "index-b", "index-c"]);
    expect(body.response.totalManagedIndices).toBe(3);
  });

  it("returns an empty page when from is past the end of a server side sort", async () => {
    const { body } = await getManagedIndices({ from: 20, size: 10, sortField: "jobStatus", sortDirection: "asc" });
    expect(body.response.managedIndices).toEqual([]);
    expect(body.response.totalManagedIndices).toBe(4);
  });

  it("ignores sort fields inherited from Object.prototype", async () => {
    const { callAsCurrentUser, body } = await getManagedIndices({ from: 0, size: 10, sortField: "constructor", sortDirection: "asc" });
    expect(body.ok).toBe(true);
    expect(callAsCurrentUser).toHaveBeenCalledWith("ism.explainAll", expect.objectContaining({ sortField: null, from: 0, size: 10 }));
  });

  it("doesn't sort by data stream on the server when data streams aren't shown", async () => {
    const { callAsCurrentUser } = await getManagedIndices({
      from: 0,
      size: 10,
      sortField: "dataStream",
      sortDirection: "asc",
      showDataStreams: false,
    });
    expect(callAsCurrentUser).toHaveBeenCalledWith("ism.explainAll", expect.objectContaining({ sortField: null, from: 0, size: 10 }));
  });

  it("sorts by data stream when data streams are shown", async () => {
    (getIndexToDataStreamMapping as jest.Mock).mockResolvedValueOnce({ "index-a": "stream-z", "index-c": "stream-m" });
    const { body } = await getManagedIndices({ from: 0, size: 10, sortField: "dataStream", sortDirection: "desc", showDataStreams: true });
    // Indices without a data stream sort last when descending, ties stay in index name order
    expect(body.response.managedIndices.map((item: { index: string }) => item.index)).toEqual(["index-a", "index-c", "index-b", "index-d"]);
  });
});
