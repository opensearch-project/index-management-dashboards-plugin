/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import Ajv from "ajv";
import { noAdditionalPropertiesValidator } from "./helper";
import { noAdditionalJSONSchema } from "../../utils/JSON_schemas/index_mappings";

describe("noAdditionalPropertiesValidator equivalence test", () => {
  let originalAjvValidator: (data: unknown) => boolean;

  beforeAll(() => {
    // Recreate the original AJV validator for comparison
    const ajvInstance = new Ajv();
    originalAjvValidator = ajvInstance.compile(noAdditionalJSONSchema);
  });

  // Test data cases covering various scenarios
  const testCases = [
    {
      name: "valid simple type",
      data: {
        field1: {
          type: "keyword",
        },
      },
    },
    {
      name: "valid alias with required path",
      data: {
        field1: {
          type: "alias",
          path: "some.path",
        },
      },
    },
    {
      name: "valid token_count with analyzer",
      data: {
        field1: {
          type: "token_count",
          analyzer: "standard",
        },
      },
    },
    {
      name: "valid object type with properties",
      data: {
        field1: {
          type: "object",
          properties: {
            nested: {
              type: "keyword",
            },
          },
        },
      },
    },
    {
      name: "nested object with multiple levels",
      data: {
        root: {
          type: "object",
          properties: {
            level1: {
              type: "object",
              properties: {
                level2: {
                  type: "text",
                },
              },
            },
          },
        },
      },
    },
    {
      name: "invalid type",
      data: {
        field1: {
          type: "invalid-type",
        },
      },
    },
    {
      name: "missing type field",
      data: {
        field1: {
          someProperty: "value",
        },
      },
    },
    {
      name: "additional property not allowed",
      data: {
        field1: {
          type: "keyword",
          additionalProperty: "not-allowed",
        },
      },
    },
    {
      name: "invalid nested type",
      data: {
        field1: {
          type: "object",
          properties: {
            nested: {
              type: "invalid-nested-type",
            },
          },
        },
      },
    },
    {
      name: "wrong field type for alias path",
      data: {
        field1: {
          type: "alias",
          path: 123, // should be string
        },
      },
    },
    {
      name: "wrong field type for token_count analyzer",
      data: {
        field1: {
          type: "token_count",
          analyzer: 456, // should be string
        },
      },
    },
    {
      name: "object without properties",
      data: {
        field1: {
          type: "object",
        },
      },
    },
    {
      name: "empty data object",
      data: {},
    },
    {
      name: "null data",
      data: null,
    },
    {
      name: "non-object data",
      data: "string",
    },
    {
      name: "array data",
      data: [],
    },
    {
      name: "multiple valid fields",
      data: {
        field1: {
          type: "keyword",
        },
        field2: {
          type: "text",
        },
        field3: {
          type: "integer",
        },
      },
    },
    {
      name: "mixed valid and invalid fields",
      data: {
        validField: {
          type: "keyword",
        },
        invalidField: {
          type: "invalid-type",
        },
      },
    },
    {
      name: "object with invalid properties structure",
      data: {
        field1: {
          type: "object",
          properties: "invalid", // should be object
        },
      },
    },
    {
      name: "deeply nested valid structure",
      data: {
        root: {
          type: "object",
          properties: {
            level1: {
              type: "object",
              properties: {
                level2: {
                  type: "object",
                  properties: {
                    level3: {
                      type: "keyword",
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    {
      name: "complex mix with alias",
      data: {
        aliasField: {
          type: "alias",
          path: "target.field",
        },
        objectField: {
          type: "object",
          properties: {
            textField: {
              type: "text",
            },
            tokenField: {
              type: "token_count",
              analyzer: "keyword",
            },
          },
        },
      },
    },
  ];

  testCases.forEach(({ name, data }) => {
    it(`should produce equivalent results for: ${name}`, () => {
      const originalResult = originalAjvValidator(data);
      const newResult = noAdditionalPropertiesValidator(data);

      expect(newResult).toBe(originalResult);

      // Log additional context if they differ (should not happen if implementation is correct)
      if (originalResult !== newResult) {
        console.error(`Mismatch for test case "${name}":`, {
          data: JSON.stringify(data, null, 2),
          original: originalResult,
          new: newResult,
        });
      }
    });
  });
});
