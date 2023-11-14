/*
 *   Copyright OpenSearch Contributors
 *
 *   Licensed under the Apache License, Version 2.0 (the "License").
 *   You may not use this file except in compliance with the License.
 *   A copy of the License is located at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   or in the "license" file accompanying this file. This file is distributed
 *   on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 *   express or implied. See the License for the specific language governing
 *   permissions and limitations under the License.
 */

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
