import RollupService from "./RollupService";

describe("RollupService.getRollups", () => {
  let rollupService: RollupService;
  let mockContext: any;
  let mockRequest: any;
  let mockResponse: any;
  let mockCallWithRequest: jest.Mock;

  beforeEach(() => {
    // Create a new instance of RollupService for each test
    rollupService = new RollupService({} as any);

    // Mock the context, request, and response objects
    mockContext = {};
    mockRequest = {
      query: {
        from: "0",
        size: "10",
        search: "",
        sortDirection: "asc",
        sortField: "_id",
      },
    };

    mockResponse = {
      custom: jest.fn((args) => args),
    };

    // Mock the getClientBasedOnDataSource method
    mockCallWithRequest = jest.fn();
    rollupService.getClientBasedOnDataSource = jest.fn(() => mockCallWithRequest);
  });

  it("should process rollup job named 'error' correctly", async () => {
    // Mock the getRollups API response
    mockCallWithRequest.mockResolvedValueOnce({
      total_rollups: 1,
      rollups: [
        {
          _id: "error",
          _seqNo: 1,
          _primaryTerm: 1,
          rollup: {
            rollup_id: "error",
            source_index: "source",
            target_index: "target",
            enabled: true,
          },
        },
      ],
    });

    // Mock the explainRollup API response with "error" as a rollup ID
    mockCallWithRequest.mockResolvedValueOnce({
      error: {
        metadata_id: "error",
        rollup_metadata: {
          rollup_id: "error",
          status: "finished",
          stats: {},
        },
      },
    });

    const result = await rollupService.getRollups(mockContext, mockRequest, mockResponse);

    expect(result.statusCode).toBe(200);
    expect(result.body.ok).toBe(true);
    expect(result.body.response.rollups).toHaveLength(1);
    expect(result.body.response.rollups[0]._id).toBe("error");
    expect(result.body.response.rollups[0].metadata).toBeDefined();
    expect(result.body.response.rollups[0].metadata.metadata_id).toBe("error");
  });

  it("should process multiple rollup jobs including one named 'error'", async () => {
    // Mock the getRollups API response with multiple rollups
    mockCallWithRequest.mockResolvedValueOnce({
      total_rollups: 3,
      rollups: [
        {
          _id: "error",
          _seqNo: 1,
          _primaryTerm: 1,
          rollup: {
            rollup_id: "error",
            source_index: "source1",
            target_index: "target1",
            enabled: true,
          },
        },
        {
          _id: "my-rollup",
          _seqNo: 2,
          _primaryTerm: 1,
          rollup: {
            rollup_id: "my-rollup",
            source_index: "source2",
            target_index: "target2",
            enabled: true,
          },
        },
        {
          _id: "another-rollup",
          _seqNo: 3,
          _primaryTerm: 1,
          rollup: {
            rollup_id: "another-rollup",
            source_index: "source3",
            target_index: "target3",
            enabled: false,
          },
        },
      ],
    });

    // Mock the explainRollup API response with multiple rollup IDs
    mockCallWithRequest.mockResolvedValueOnce({
      error: {
        metadata_id: "error",
        rollup_metadata: {
          rollup_id: "error",
          status: "finished",
          stats: {},
        },
      },
      "my-rollup": {
        metadata_id: "my-rollup",
        rollup_metadata: {
          rollup_id: "my-rollup",
          status: "running",
          stats: {},
        },
      },
      "another-rollup": {
        metadata_id: "another-rollup",
        rollup_metadata: {
          rollup_id: "another-rollup",
          status: "stopped",
          stats: {},
        },
      },
    });

    const result = await rollupService.getRollups(mockContext, mockRequest, mockResponse);

    expect(result.statusCode).toBe(200);
    expect(result.body.ok).toBe(true);
    expect(result.body.response.rollups).toHaveLength(3);

    // Verify all rollups are present with correct metadata
    const errorRollup = result.body.response.rollups.find((r: any) => r._id === "error");
    expect(errorRollup).toBeDefined();
    expect(errorRollup.metadata.metadata_id).toBe("error");

    const myRollup = result.body.response.rollups.find((r: any) => r._id === "my-rollup");
    expect(myRollup).toBeDefined();
    expect(myRollup.metadata.metadata_id).toBe("my-rollup");

    const anotherRollup = result.body.response.rollups.find((r: any) => r._id === "another-rollup");
    expect(anotherRollup).toBeDefined();
    expect(anotherRollup.metadata.metadata_id).toBe("another-rollup");
  });

  it("should process rollup job named 'ok' correctly", async () => {
    // Mock the getRollups API response
    mockCallWithRequest.mockResolvedValueOnce({
      total_rollups: 1,
      rollups: [
        {
          _id: "ok",
          _seqNo: 1,
          _primaryTerm: 1,
          rollup: {
            rollup_id: "ok",
            source_index: "source",
            target_index: "target",
            enabled: true,
          },
        },
      ],
    });

    // Mock the explainRollup API response with "ok" as a rollup ID
    mockCallWithRequest.mockResolvedValueOnce({
      ok: {
        metadata_id: "ok",
        rollup_metadata: {
          rollup_id: "ok",
          status: "finished",
          stats: {},
        },
      },
    });

    const result = await rollupService.getRollups(mockContext, mockRequest, mockResponse);

    expect(result.statusCode).toBe(200);
    expect(result.body.ok).toBe(true);
    expect(result.body.response.rollups).toHaveLength(1);
    expect(result.body.response.rollups[0]._id).toBe("ok");
    expect(result.body.response.rollups[0].metadata).toBeDefined();
    expect(result.body.response.rollups[0].metadata.metadata_id).toBe("ok");
  });

  it("should catch actual API errors in try-catch block", async () => {
    // Mock the getRollups API to throw an error
    const apiError = new Error("Connection timeout");
    (apiError as any).statusCode = 500;
    mockCallWithRequest.mockRejectedValueOnce(apiError);

    const result = await rollupService.getRollups(mockContext, mockRequest, mockResponse);

    expect(result.statusCode).toBe(200);
    expect(result.body.ok).toBe(false);
    expect(result.body.error).toContain("Error in getRollups");
    expect(result.body.error).toContain("Connection timeout");
  });

  it("should handle 404 index_not_found_exception gracefully", async () => {
    // Mock the getRollups API to throw a 404 error
    const notFoundError = new Error("Index not found");
    (notFoundError as any).statusCode = 404;
    (notFoundError as any).body = {
      error: {
        type: "index_not_found_exception",
      },
    };
    mockCallWithRequest.mockRejectedValueOnce(notFoundError);

    const result = await rollupService.getRollups(mockContext, mockRequest, mockResponse);

    expect(result.statusCode).toBe(200);
    expect(result.body.ok).toBe(true);
    expect(result.body.response.rollups).toEqual([]);
    expect(result.body.response.totalRollups).toBe(0);
  });

  it("should handle rollup jobs with various reserved property names", async () => {
    // Mock the getRollups API response with rollups having reserved names
    mockCallWithRequest.mockResolvedValueOnce({
      total_rollups: 4,
      rollups: [
        { _id: "error", _seqNo: 1, _primaryTerm: 1, rollup: { rollup_id: "error" } },
        { _id: "ok", _seqNo: 2, _primaryTerm: 1, rollup: { rollup_id: "ok" } },
        { _id: "response", _seqNo: 3, _primaryTerm: 1, rollup: { rollup_id: "response" } },
        { _id: "metadata", _seqNo: 4, _primaryTerm: 1, rollup: { rollup_id: "metadata" } },
      ],
    });

    // Mock the explainRollup API response
    mockCallWithRequest.mockResolvedValueOnce({
      error: { metadata_id: "error", rollup_metadata: {} },
      ok: { metadata_id: "ok", rollup_metadata: {} },
      response: { metadata_id: "response", rollup_metadata: {} },
      metadata: { metadata_id: "metadata", rollup_metadata: {} },
    });

    const result = await rollupService.getRollups(mockContext, mockRequest, mockResponse);

    expect(result.statusCode).toBe(200);
    expect(result.body.ok).toBe(true);
    expect(result.body.response.rollups).toHaveLength(4);

    // Verify all reserved names are processed correctly
    ["error", "ok", "response", "metadata"].forEach((name) => {
      const rollup = result.body.response.rollups.find((r: any) => r._id === name);
      expect(rollup).toBeDefined();
      expect(rollup.metadata.metadata_id).toBe(name);
    });
  });

  it("should set metadata to null for rollups without explainResponse entry", async () => {
    // Mock the getRollups API response
    mockCallWithRequest.mockResolvedValueOnce({
      total_rollups: 2,
      rollups: [
        { _id: "rollup-1", _seqNo: 1, _primaryTerm: 1, rollup: { rollup_id: "rollup-1" } },
        { _id: "rollup-2", _seqNo: 2, _primaryTerm: 1, rollup: { rollup_id: "rollup-2" } },
      ],
    });

    // Mock the explainRollup API response with only one rollup
    mockCallWithRequest.mockResolvedValueOnce({
      "rollup-1": { metadata_id: "rollup-1", rollup_metadata: {} },
      // rollup-2 is missing from explainResponse
    });

    const result = await rollupService.getRollups(mockContext, mockRequest, mockResponse);

    expect(result.statusCode).toBe(200);
    expect(result.body.ok).toBe(true);
    expect(result.body.response.rollups).toHaveLength(2);

    const rollup1 = result.body.response.rollups.find((r: any) => r._id === "rollup-1");
    expect(rollup1.metadata).toBeDefined();
    expect(rollup1.metadata.metadata_id).toBe("rollup-1");

    const rollup2 = result.body.response.rollups.find((r: any) => r._id === "rollup-2");
    expect(rollup2.metadata).toBeNull();
  });

  it("should handle 500 internal server errors", async () => {
    // Mock the getRollups API to throw a 500 error
    const internalError = new Error("Internal Server Error");
    (internalError as any).statusCode = 500;
    (internalError as any).body = {
      error: {
        type: "internal_server_error",
        reason: "OpenSearch internal error",
      },
    };
    mockCallWithRequest.mockRejectedValueOnce(internalError);

    const result = await rollupService.getRollups(mockContext, mockRequest, mockResponse);

    expect(result.statusCode).toBe(200);
    expect(result.body.ok).toBe(false);
    expect(result.body.error).toContain("Error in getRollups");
    expect(result.body.error).toContain("Internal Server Error");
  });

  it("should handle network timeout errors", async () => {
    // Mock the getRollups API to throw a network timeout error
    const timeoutError = new Error("Request timeout");
    (timeoutError as any).statusCode = 408;
    (timeoutError as any).name = "RequestTimeout";
    mockCallWithRequest.mockRejectedValueOnce(timeoutError);

    const result = await rollupService.getRollups(mockContext, mockRequest, mockResponse);

    expect(result.statusCode).toBe(200);
    expect(result.body.ok).toBe(false);
    expect(result.body.error).toContain("Error in getRollups");
    expect(result.body.error).toContain("Request timeout");
  });

  it("should handle connection refused errors", async () => {
    // Mock the getRollups API to throw a connection error
    const connectionError = new Error("ECONNREFUSED");
    (connectionError as any).code = "ECONNREFUSED";
    mockCallWithRequest.mockRejectedValueOnce(connectionError);

    const result = await rollupService.getRollups(mockContext, mockRequest, mockResponse);

    expect(result.statusCode).toBe(200);
    expect(result.body.ok).toBe(false);
    expect(result.body.error).toContain("Error in getRollups");
    expect(result.body.error).toContain("ECONNREFUSED");
  });

  it("should handle authentication errors", async () => {
    // Mock the getRollups API to throw an authentication error
    const authError = new Error("Authentication failed");
    (authError as any).statusCode = 401;
    (authError as any).body = {
      error: {
        type: "security_exception",
        reason: "Invalid credentials",
      },
    };
    mockCallWithRequest.mockRejectedValueOnce(authError);

    const result = await rollupService.getRollups(mockContext, mockRequest, mockResponse);

    expect(result.statusCode).toBe(200);
    expect(result.body.ok).toBe(false);
    expect(result.body.error).toContain("Error in getRollups");
    expect(result.body.error).toContain("Authentication failed");
  });

  it("should handle authorization errors", async () => {
    // Mock the getRollups API to throw an authorization error
    const forbiddenError = new Error("Forbidden");
    (forbiddenError as any).statusCode = 403;
    (forbiddenError as any).body = {
      error: {
        type: "security_exception",
        reason: "Insufficient permissions",
      },
    };
    mockCallWithRequest.mockRejectedValueOnce(forbiddenError);

    const result = await rollupService.getRollups(mockContext, mockRequest, mockResponse);

    expect(result.statusCode).toBe(200);
    expect(result.body.ok).toBe(false);
    expect(result.body.error).toContain("Error in getRollups");
    expect(result.body.error).toContain("Forbidden");
  });

  it("should handle errors during explainRollup call", async () => {
    // Mock successful getRollups but failed explainRollup
    mockCallWithRequest.mockResolvedValueOnce({
      total_rollups: 1,
      rollups: [
        {
          _id: "test-rollup",
          _seqNo: 1,
          _primaryTerm: 1,
          rollup: {
            rollup_id: "test-rollup",
            source_index: "source",
            target_index: "target",
            enabled: true,
          },
        },
      ],
    });

    // Mock explainRollup to throw an error
    const explainError = new Error("Explain API failed");
    (explainError as any).statusCode = 500;
    mockCallWithRequest.mockRejectedValueOnce(explainError);

    const result = await rollupService.getRollups(mockContext, mockRequest, mockResponse);

    expect(result.statusCode).toBe(200);
    expect(result.body.ok).toBe(false);
    expect(result.body.error).toContain("Error in getRollups");
    expect(result.body.error).toContain("Explain API failed");
  });

  it("should handle malformed explainResponse gracefully", async () => {
    // Mock the getRollups API response
    mockCallWithRequest.mockResolvedValueOnce({
      total_rollups: 1,
      rollups: [
        {
          _id: "test-rollup",
          _seqNo: 1,
          _primaryTerm: 1,
          rollup: {
            rollup_id: "test-rollup",
            source_index: "source",
            target_index: "target",
            enabled: true,
          },
        },
      ],
    });

    // Mock explainRollup to return null (malformed response)
    mockCallWithRequest.mockResolvedValueOnce(null);

    const result = await rollupService.getRollups(mockContext, mockRequest, mockResponse);

    expect(result.statusCode).toBe(200);
    expect(result.body.ok).toBe(false);
    expect(result.body.error).toContain("Unexpected response format from Explain API");
  });

  it("should handle empty explainResponse object", async () => {
    // Mock the getRollups API response
    mockCallWithRequest.mockResolvedValueOnce({
      total_rollups: 2,
      rollups: [
        { _id: "rollup-1", _seqNo: 1, _primaryTerm: 1, rollup: { rollup_id: "rollup-1" } },
        { _id: "rollup-2", _seqNo: 2, _primaryTerm: 1, rollup: { rollup_id: "rollup-2" } },
      ],
    });

    // Mock explainRollup to return empty object
    mockCallWithRequest.mockResolvedValueOnce({});

    const result = await rollupService.getRollups(mockContext, mockRequest, mockResponse);

    expect(result.statusCode).toBe(200);
    expect(result.body.ok).toBe(true);
    expect(result.body.response.rollups).toHaveLength(2);

    // Both rollups should have null metadata
    result.body.response.rollups.forEach((rollup: any) => {
      expect(rollup.metadata).toBeNull();
    });
  });
});
