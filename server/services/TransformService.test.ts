import { schema } from "@osd/config-schema";
import TransformService from "./TransformService";

describe("TransformService.getTransforms", () => {
  let transformService: TransformService;
  let mockContext: any;
  let mockRequest: any;
  let mockResponse: any;
  let mockCallWithRequest: jest.Mock;

  beforeEach(() => {
    // Create a new instance of TransformService for each test
    transformService = new TransformService({} as any);

    // Mock the context, request, and response objects
    mockContext = {};
    mockRequest = {
      query: {
        from: 0,
        size: 10,
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
    transformService.getClientBasedOnDataSource = jest.fn(() => mockCallWithRequest);
  });

  it("should process transform named 'error' correctly", async () => {
    // Mock the getTransforms API response
    mockCallWithRequest.mockResolvedValueOnce({
      total_transforms: 1,
      transforms: [
        {
          _id: "error",
          _seqNo: 1,
          _primaryTerm: 1,
          transform: {
            transform_id: "error",
            source_index: "source",
            target_index: "target",
            enabled: true,
          },
        },
      ],
    });

    // Mock the explainTransform API response with "error" as a transform ID
    mockCallWithRequest.mockResolvedValueOnce({
      error: {
        metadata_id: "error",
        transform_metadata: {
          transform_id: "error",
          status: "finished",
          stats: {},
        },
      },
    });

    const result = await transformService.getTransforms(mockContext, mockRequest, mockResponse);

    expect(result.statusCode).toBe(200);
    expect(result.body.ok).toBe(true);
    expect(result.body.response.transforms).toHaveLength(1);
    expect(result.body.response.transforms[0]._id).toBe("error");
    expect(result.body.response.transforms[0].metadata).toBeDefined();
    expect(result.body.response.transforms[0].metadata.metadata_id).toBe("error");
  });

  it("should process transform named 'ok' correctly", async () => {
    // Mock the getTransforms API response
    mockCallWithRequest.mockResolvedValueOnce({
      total_transforms: 1,
      transforms: [
        {
          _id: "ok",
          _seqNo: 1,
          _primaryTerm: 1,
          transform: {
            transform_id: "ok",
            source_index: "source",
            target_index: "target",
            enabled: true,
          },
        },
      ],
    });

    // Mock the explainTransform API response with "ok" as a transform ID
    mockCallWithRequest.mockResolvedValueOnce({
      ok: {
        metadata_id: "ok",
        transform_metadata: {
          transform_id: "ok",
          status: "finished",
          stats: {},
        },
      },
    });

    const result = await transformService.getTransforms(mockContext, mockRequest, mockResponse);

    expect(result.statusCode).toBe(200);
    expect(result.body.ok).toBe(true);
    expect(result.body.response.transforms).toHaveLength(1);
    expect(result.body.response.transforms[0]._id).toBe("ok");
    expect(result.body.response.transforms[0].metadata).toBeDefined();
    expect(result.body.response.transforms[0].metadata.metadata_id).toBe("ok");
  });

  it("should process multiple transforms including one named 'error'", async () => {
    // Mock the getTransforms API response with multiple transforms
    mockCallWithRequest.mockResolvedValueOnce({
      total_transforms: 3,
      transforms: [
        {
          _id: "error",
          _seqNo: 1,
          _primaryTerm: 1,
          transform: {
            transform_id: "error",
            source_index: "source1",
            target_index: "target1",
            enabled: true,
          },
        },
        {
          _id: "my-transform",
          _seqNo: 2,
          _primaryTerm: 1,
          transform: {
            transform_id: "my-transform",
            source_index: "source2",
            target_index: "target2",
            enabled: true,
          },
        },
        {
          _id: "another-transform",
          _seqNo: 3,
          _primaryTerm: 1,
          transform: {
            transform_id: "another-transform",
            source_index: "source3",
            target_index: "target3",
            enabled: false,
          },
        },
      ],
    });

    // Mock the explainTransform API response with multiple transform IDs
    mockCallWithRequest.mockResolvedValueOnce({
      error: {
        metadata_id: "error",
        transform_metadata: {
          transform_id: "error",
          status: "finished",
          stats: {},
        },
      },
      "my-transform": {
        metadata_id: "my-transform",
        transform_metadata: {
          transform_id: "my-transform",
          status: "running",
          stats: {},
        },
      },
      "another-transform": {
        metadata_id: "another-transform",
        transform_metadata: {
          transform_id: "another-transform",
          status: "stopped",
          stats: {},
        },
      },
    });

    const result = await transformService.getTransforms(mockContext, mockRequest, mockResponse);

    expect(result.statusCode).toBe(200);
    expect(result.body.ok).toBe(true);
    expect(result.body.response.transforms).toHaveLength(3);

    // Verify all transforms are present with correct metadata
    const errorTransform = result.body.response.transforms.find((t: any) => t._id === "error");
    expect(errorTransform).toBeDefined();
    expect(errorTransform.metadata.metadata_id).toBe("error");

    const myTransform = result.body.response.transforms.find((t: any) => t._id === "my-transform");
    expect(myTransform).toBeDefined();
    expect(myTransform.metadata.metadata_id).toBe("my-transform");

    const anotherTransform = result.body.response.transforms.find((t: any) => t._id === "another-transform");
    expect(anotherTransform).toBeDefined();
    expect(anotherTransform.metadata.metadata_id).toBe("another-transform");
  });

  it("should catch actual API errors in try-catch block", async () => {
    // Mock the getTransforms API to throw an error
    const apiError = new Error("Connection timeout");
    (apiError as any).statusCode = 500;
    mockCallWithRequest.mockRejectedValueOnce(apiError);

    const result = await transformService.getTransforms(mockContext, mockRequest, mockResponse);

    expect(result.statusCode).toBe(200);
    expect(result.body.ok).toBe(false);
    expect(result.body.error).toContain("Error in getTransforms");
    expect(result.body.error).toContain("Connection timeout");
  });

  it("should handle 404 index_not_found_exception gracefully", async () => {
    // Mock the getTransforms API to throw a 404 error
    const notFoundError = new Error("Index not found");
    (notFoundError as any).statusCode = 404;
    (notFoundError as any).body = {
      error: {
        type: "index_not_found_exception",
      },
    };
    mockCallWithRequest.mockRejectedValueOnce(notFoundError);

    const result = await transformService.getTransforms(mockContext, mockRequest, mockResponse);

    expect(result.statusCode).toBe(200);
    expect(result.body.ok).toBe(true);
    expect(result.body.response.transforms).toEqual([]);
    expect(result.body.response.totalTransforms).toBe(0);
  });

  it("should handle transforms with various reserved property names", async () => {
    // Mock the getTransforms API response with transforms having reserved names
    mockCallWithRequest.mockResolvedValueOnce({
      total_transforms: 4,
      transforms: [
        { _id: "error", _seqNo: 1, _primaryTerm: 1, transform: { transform_id: "error" } },
        { _id: "ok", _seqNo: 2, _primaryTerm: 1, transform: { transform_id: "ok" } },
        { _id: "response", _seqNo: 3, _primaryTerm: 1, transform: { transform_id: "response" } },
        { _id: "metadata", _seqNo: 4, _primaryTerm: 1, transform: { transform_id: "metadata" } },
      ],
    });

    // Mock the explainTransform API response
    mockCallWithRequest.mockResolvedValueOnce({
      error: { metadata_id: "error", transform_metadata: {} },
      ok: { metadata_id: "ok", transform_metadata: {} },
      response: { metadata_id: "response", transform_metadata: {} },
      metadata: { metadata_id: "metadata", transform_metadata: {} },
    });

    const result = await transformService.getTransforms(mockContext, mockRequest, mockResponse);

    expect(result.statusCode).toBe(200);
    expect(result.body.ok).toBe(true);
    expect(result.body.response.transforms).toHaveLength(4);

    // Verify all reserved names are processed correctly
    ["error", "ok", "response", "metadata"].forEach((name) => {
      const transform = result.body.response.transforms.find((t: any) => t._id === name);
      expect(transform).toBeDefined();
      expect(transform.metadata.metadata_id).toBe(name);
    });
  });

  it("should set metadata to null for transforms without explainResponse entry", async () => {
    // Mock the getTransforms API response
    mockCallWithRequest.mockResolvedValueOnce({
      total_transforms: 2,
      transforms: [
        { _id: "transform-1", _seqNo: 1, _primaryTerm: 1, transform: { transform_id: "transform-1" } },
        { _id: "transform-2", _seqNo: 2, _primaryTerm: 1, transform: { transform_id: "transform-2" } },
      ],
    });

    // Mock the explainTransform API response with only one transform
    mockCallWithRequest.mockResolvedValueOnce({
      "transform-1": { metadata_id: "transform-1", transform_metadata: {} },
      // transform-2 is missing from explainResponse
    });

    const result = await transformService.getTransforms(mockContext, mockRequest, mockResponse);

    expect(result.statusCode).toBe(200);
    expect(result.body.ok).toBe(true);
    expect(result.body.response.transforms).toHaveLength(2);

    const transform1 = result.body.response.transforms.find((t: any) => t._id === "transform-1");
    expect(transform1.metadata).toBeDefined();
    expect(transform1.metadata.metadata_id).toBe("transform-1");

    const transform2 = result.body.response.transforms.find((t: any) => t._id === "transform-2");
    expect(transform2.metadata).toBeNull();
  });

  it("should handle 500 internal server errors", async () => {
    // Mock the getTransforms API to throw a 500 error
    const internalError = new Error("Internal Server Error");
    (internalError as any).statusCode = 500;
    (internalError as any).body = {
      error: {
        type: "internal_server_error",
        reason: "OpenSearch internal error",
      },
    };
    mockCallWithRequest.mockRejectedValueOnce(internalError);

    const result = await transformService.getTransforms(mockContext, mockRequest, mockResponse);

    expect(result.statusCode).toBe(200);
    expect(result.body.ok).toBe(false);
    expect(result.body.error).toContain("Error in getTransforms");
    expect(result.body.error).toContain("Internal Server Error");
  });

  it("should handle network timeout errors", async () => {
    // Mock the getTransforms API to throw a network timeout error
    const timeoutError = new Error("Request timeout");
    (timeoutError as any).statusCode = 408;
    (timeoutError as any).name = "RequestTimeout";
    mockCallWithRequest.mockRejectedValueOnce(timeoutError);

    const result = await transformService.getTransforms(mockContext, mockRequest, mockResponse);

    expect(result.statusCode).toBe(200);
    expect(result.body.ok).toBe(false);
    expect(result.body.error).toContain("Error in getTransforms");
    expect(result.body.error).toContain("Request timeout");
  });

  it("should handle connection refused errors", async () => {
    // Mock the getTransforms API to throw a connection error
    const connectionError = new Error("ECONNREFUSED");
    (connectionError as any).code = "ECONNREFUSED";
    mockCallWithRequest.mockRejectedValueOnce(connectionError);

    const result = await transformService.getTransforms(mockContext, mockRequest, mockResponse);

    expect(result.statusCode).toBe(200);
    expect(result.body.ok).toBe(false);
    expect(result.body.error).toContain("Error in getTransforms");
    expect(result.body.error).toContain("ECONNREFUSED");
  });

  it("should handle authentication errors", async () => {
    // Mock the getTransforms API to throw an authentication error
    const authError = new Error("Authentication failed");
    (authError as any).statusCode = 401;
    (authError as any).body = {
      error: {
        type: "security_exception",
        reason: "Invalid credentials",
      },
    };
    mockCallWithRequest.mockRejectedValueOnce(authError);

    const result = await transformService.getTransforms(mockContext, mockRequest, mockResponse);

    expect(result.statusCode).toBe(200);
    expect(result.body.ok).toBe(false);
    expect(result.body.error).toContain("Error in getTransforms");
    expect(result.body.error).toContain("Authentication failed");
  });

  it("should handle authorization errors", async () => {
    // Mock the getTransforms API to throw an authorization error
    const forbiddenError = new Error("Forbidden");
    (forbiddenError as any).statusCode = 403;
    (forbiddenError as any).body = {
      error: {
        type: "security_exception",
        reason: "Insufficient permissions",
      },
    };
    mockCallWithRequest.mockRejectedValueOnce(forbiddenError);

    const result = await transformService.getTransforms(mockContext, mockRequest, mockResponse);

    expect(result.statusCode).toBe(200);
    expect(result.body.ok).toBe(false);
    expect(result.body.error).toContain("Error in getTransforms");
    expect(result.body.error).toContain("Forbidden");
  });

  it("should handle errors during explainTransform call", async () => {
    // Mock successful getTransforms but failed explainTransform
    mockCallWithRequest.mockResolvedValueOnce({
      total_transforms: 1,
      transforms: [
        {
          _id: "test-transform",
          _seqNo: 1,
          _primaryTerm: 1,
          transform: {
            transform_id: "test-transform",
            source_index: "source",
            target_index: "target",
            enabled: true,
          },
        },
      ],
    });

    // Mock explainTransform to throw an error
    const explainError = new Error("Explain API failed");
    (explainError as any).statusCode = 500;
    mockCallWithRequest.mockRejectedValueOnce(explainError);

    const result = await transformService.getTransforms(mockContext, mockRequest, mockResponse);

    expect(result.statusCode).toBe(200);
    expect(result.body.ok).toBe(false);
    expect(result.body.error).toContain("Error in getTransforms");
    expect(result.body.error).toContain("Explain API failed");
  });

  it("should handle malformed explainResponse gracefully", async () => {
    // Mock the getTransforms API response
    mockCallWithRequest.mockResolvedValueOnce({
      total_transforms: 1,
      transforms: [
        {
          _id: "test-transform",
          _seqNo: 1,
          _primaryTerm: 1,
          transform: {
            transform_id: "test-transform",
            source_index: "source",
            target_index: "target",
            enabled: true,
          },
        },
      ],
    });

    // Mock explainTransform to return null (malformed response)
    mockCallWithRequest.mockResolvedValueOnce(null);

    const result = await transformService.getTransforms(mockContext, mockRequest, mockResponse);

    expect(result.statusCode).toBe(200);
    expect(result.body.ok).toBe(false);
    expect(result.body.error).toContain("Unexpected response format from Explain API");
  });

  it("should handle empty explainResponse object", async () => {
    // Mock the getTransforms API response
    mockCallWithRequest.mockResolvedValueOnce({
      total_transforms: 2,
      transforms: [
        { _id: "transform-1", _seqNo: 1, _primaryTerm: 1, transform: { transform_id: "transform-1" } },
        { _id: "transform-2", _seqNo: 2, _primaryTerm: 1, transform: { transform_id: "transform-2" } },
      ],
    });

    // Mock explainTransform to return empty object
    mockCallWithRequest.mockResolvedValueOnce({});

    const result = await transformService.getTransforms(mockContext, mockRequest, mockResponse);

    expect(result.statusCode).toBe(200);
    expect(result.body.ok).toBe(true);
    expect(result.body.response.transforms).toHaveLength(2);

    // Both transforms should have null metadata
    result.body.response.transforms.forEach((transform: any) => {
      expect(transform.metadata).toBeNull();
    });
  });
});

describe("Index Name Validation", () => {
  const validateSchema = schema.object({
    indexName: schema.string({
      validate: (value) => {
        const invalidCharactersPattern = /[\s,:\"*+\/\\|?#><]/;
        if (value !== value.toLowerCase() || value.startsWith("_") || value.startsWith("-") || invalidCharactersPattern.test(value)) {
          return "Invalid index name.";
        }

        return undefined;
      },
    }),
    dataSourceId: schema.maybe(schema.string()),
  });

  const validateQuery = (indexName: string) => {
    try {
      validateSchema.validate({ indexName });
      return undefined;
    } catch (e) {
      return e.message;
    }
  };

  it("should fail validation for index names with uppercase letters", () => {
    const errorMessage = validateQuery("IndexNameWithUppercase");
    expect(errorMessage).toBe("[indexName]: Invalid index name.");
  });

  it("should fail validation for index names starting with an underscore", () => {
    const errorMessage = validateQuery("_indexname");
    expect(errorMessage).toBe("[indexName]: Invalid index name.");
  });

  it("should fail validation for index names starting with a hyphen", () => {
    const errorMessage = validateQuery("-indexname");
    expect(errorMessage).toBe("[indexName]: Invalid index name.");
  });

  it("should fail validation for index names containing invalid characters", () => {
    const errorMessage = validateQuery("********************************");
    expect(errorMessage).toBe("[indexName]: Invalid index name.");
  });

  it("should pass validation for valid index names", () => {
    const errorMessage = validateQuery("valid_index-name123");
    expect(errorMessage).toBeUndefined();
  });

  it("should fail validation for index names containing spaces", () => {
    const errorMessage = validateQuery("invalid index");
    expect(errorMessage).toBe("[indexName]: Invalid index name.");
  });
});
