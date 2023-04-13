/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import browserServicesMock from "./browserServicesMock";
import historyMock from "./historyMock";
import httpClientMock from "./httpClientMock";
import styleMock from "./styleMock";
import coreServicesMock from "./coreServicesMock";

const apiCallerMock = (browserServicesMockObject: typeof browserServicesMock) => {
  browserServicesMockObject.commonService.apiCaller = jest.fn(
    async (payload): Promise<any> => {
      switch (payload.endpoint) {
        case "transport.request": {
          if (payload.data?.path?.startsWith("/_index_template/_simulate_index/bad_index")) {
            return {
              ok: true,
              response: {},
            };
          } else if (payload.data?.path?.startsWith("_index_template/bad_template")) {
            return {
              ok: false,
              error: "bad template",
            };
          } else if (payload.data?.path?.startsWith("_index_template/good_template")) {
            return {
              ok: true,
              response: {
                index_templates: [
                  {
                    name: "good_template",
                    index_template: {},
                  },
                ],
              },
            };
          } else if (payload.data?.path?.startsWith("_component_template/good_template")) {
            return {
              ok: true,
              response: {
                component_templates: [
                  {
                    name: "good_template",
                    component_template: {
                      template: {},
                    },
                  },
                ],
              },
            };
          } else {
            return {
              ok: true,
              response: {
                template: {
                  settings: {
                    index: {
                      number_of_replicas: "10",
                      number_of_shards: "1",
                    },
                  },
                },
              },
            };
          }
        }
        case "indices.create":
          if (payload.data?.index === "bad_index") {
            return {
              ok: false,
              error: "bad_index",
            };
          }

          return {
            ok: true,
            response: {},
          };
          break;
        case "cat.aliases":
          return {
            ok: true,
            response: [
              {
                alias: ".kibana",
                index: ".kibana_1",
                filter: "-",
                is_write_index: "-",
              },
              {
                alias: "2",
                index: "1234",
                filter: "-",
                is_write_index: "-",
              },
            ],
          };
        case "indices.get":
          const payloadIndex = payload.data?.index;
          if (payloadIndex === "bad_index") {
            return {
              ok: false,
              error: "bad_error",
              response: {},
            };
          }

          return {
            ok: true,
            response: {
              [payload.data?.index]: {
                aliases: {
                  update_test_1: {},
                },
                mappings: {
                  properties: {
                    test_mapping_1: {
                      type: "text",
                    },
                  },
                },
                settings: {
                  "index.number_of_shards": "1",
                  "index.number_of_replicas": "1",
                },
              },
            },
          };
      }
      return {
        ok: true,
        response: {},
      };
    }
  );
};

export { browserServicesMock, historyMock, httpClientMock, styleMock, coreServicesMock, apiCallerMock };
