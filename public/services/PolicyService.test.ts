/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { httpClientMock } from "../../test/mocks";
import PolicyService from "./PolicyService";
import { NODE_API } from "../../utils/constants";

const policyService = new PolicyService(httpClientMock);

describe("PolicyService spec", () => {
  it("calls get policy nodejs route when calling getPolicy", async () => {
    httpClientMock.get = jest.fn().mockResolvedValue({ data: {} });
    const policyId = "test";
    await policyService.getPolicy(policyId);

    expect(httpClientMock.get).toHaveBeenCalledTimes(1);
    expect(httpClientMock.get).toHaveBeenCalledWith(`..${NODE_API.POLICIES}/${policyId}`, expect.anything());
  });

  it("calls get policies nodejs route when calling getPolicies", async () => {
    httpClientMock.get = jest.fn().mockResolvedValue({ data: {} });
    const queryObject = {};
    await policyService.getPolicies(queryObject);

    expect(httpClientMock.get).toHaveBeenCalledTimes(1);
    expect(httpClientMock.get).toHaveBeenCalledWith(`..${NODE_API.POLICIES}`, { query: queryObject });
  });

  it("calls put policy nodejs route when calling putPolicy", async () => {
    httpClientMock.put = jest.fn().mockResolvedValue({ data: {} });
    const policy = { description: "description", default_state: "one", states: [] };
    const policyId = "policy_id";
    await policyService.putPolicy(policy, policyId);

    expect(httpClientMock.put).toHaveBeenCalledTimes(1);
    expect(httpClientMock.put).toHaveBeenCalledWith(`..${NODE_API.POLICIES}/${policyId}`, { query: {}, body: JSON.stringify(policy) });
  });

  it("calls delete policy nodejs route when calling deletePolicy", async () => {
    httpClientMock.delete = jest.fn().mockResolvedValue({ data: {} });
    const policyId = "policy_id";
    await policyService.deletePolicy(policyId);

    expect(httpClientMock.delete).toHaveBeenCalledTimes(1);
    expect(httpClientMock.delete).toHaveBeenCalledWith(`..${NODE_API.POLICIES}/${policyId}`, expect.anything());
  });
});
