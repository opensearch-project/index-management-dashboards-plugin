import {
  ILegacyCustomClusterClient,
  OpenSearchDashboardsRequest,
  OpenSearchDashboardsResponseFactory,
  RequestHandlerContext,
} from "opensearch-dashboards/server";
import CommonService from "./CommonService";

const contextMock = {
  core: {},
} as RequestHandlerContext;
const responseMock = ({
  custom: jest.fn((args) => args),
} as unknown) as OpenSearchDashboardsResponseFactory;

const mockedClient = {
  callAsCurrentUser: jest.fn(),
  callAsInternalUser: jest.fn(),
  close: jest.fn(),
  asScoped: jest.fn(() => ({
    callAsCurrentUser: jest.fn((...args) => args),
    callAsInternalUser: jest.fn(),
  })),
} as any;

describe("CommonService spec", () => {
  it("http method should valid when calling transport.request", async () => {
    const commonService = new CommonService(mockedClient);
    const result = await commonService.apiCaller(
      contextMock,
      {
        body: {
          endpoint: "transport.request",
          data: {
            method: "invalid method",
          },
        },
      } as OpenSearchDashboardsRequest,
      responseMock
    );
    expect(result).toEqual({
      statusCode: 200,
      body: {
        ok: false,
        error: `Method must be one of, case insensitive ['HEAD', 'GET', 'POST', 'PUT', 'DELETE']. Received 'invalid method'.`,
      },
    });
  });

  it("should return error when no endpoint is provided", async () => {
    const commonService = new CommonService(mockedClient);
    const result = await commonService.apiCaller(
      contextMock,
      {
        body: {
          endpoint: "",
        },
      } as OpenSearchDashboardsRequest,
      responseMock
    );
    expect(result).toEqual({
      statusCode: 200,
      body: {
        ok: false,
        error: `Expected non-empty string on endpoint`,
      },
    });
  });

  it("should patch path when data.path does not start with /", async () => {
    const commonService = new CommonService(mockedClient);
    const result = await commonService.apiCaller(
      contextMock,
      {
        body: {
          endpoint: "transport.request",
          data: {
            path: "",
          },
        },
      } as OpenSearchDashboardsRequest,
      responseMock
    );
    expect(result).toEqual({
      statusCode: 200,
      body: {
        ok: true,
        response: [
          "transport.request",
          {
            path: "/",
          },
        ],
      },
    });
  });
});
