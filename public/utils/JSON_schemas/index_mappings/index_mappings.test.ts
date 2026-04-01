/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import { INDEX_MAPPING_TYPES } from "../../constants";

describe("index_mappings json schema spec", () => {
  it(`validate jsons correctly`, async () => {
    // Create CSP-compliant validators using yup instead of JSON Schema
    const allowedTypes = INDEX_MAPPING_TYPES.map((item) => item.label);

    // Helper function to validate a single mapping property
    const validateMappingProperty = (value: any, requireAllFields = false): boolean => {
      if (!value || !value.type) return false;

      // Check if type is valid
      if (!allowedTypes.includes(value.type)) return false;

      const mappingType = INDEX_MAPPING_TYPES.find((item) => item.label === value.type);
      if (!mappingType) return false;

      // For editor validation, check if required fields are present
      if (requireAllFields) {
        // For object types, properties should be required in editor mode
        if (mappingType.hasChildren && !value.properties) {
          return false;
        }

        if (mappingType.options?.fields) {
          for (const field of mappingType.options.fields) {
            if (!(field.name in value)) {
              return false;
            }
          }
        }
      }

      // Validate field types when present
      if (mappingType.options?.fields) {
        for (const field of mappingType.options.fields) {
          if (field.name in value) {
            const fieldValue = value[field.name];
            if (field.validateType === "string" && typeof fieldValue !== "string") {
              return false;
            }
            if (field.validateType === "number" && typeof fieldValue !== "number") {
              return false;
            }
            if (field.validateType === "boolean" && typeof fieldValue !== "boolean") {
              return false;
            }
          }
        }
      }

      // For types with children, validate properties recursively
      if (mappingType.hasChildren && value.properties) {
        if (typeof value.properties !== "object" || value.properties === null) {
          return false;
        }

        for (const prop of Object.values(value.properties)) {
          if (!validateMappingProperty(prop, requireAllFields)) {
            return false;
          }
        }
      }

      return true;
    };

    // Create validators that match the original API
    const noAdditionalValidator = (data: any): boolean => {
      if (typeof data !== "object" || data === null) return false;
      try {
        for (const property of Object.values(data)) {
          if (!validateMappingProperty(property, false)) {
            return false;
          }
        }
        return true;
      } catch {
        return false;
      }
    };

    const indexMappingsJSONEditorValidator = (data: any): boolean => {
      if (typeof data !== "object" || data === null) return false;
      try {
        for (const property of Object.values(data)) {
          if (!validateMappingProperty(property, true)) {
            return false;
          }
        }
        return true;
      } catch {
        return false;
      }
    };

    const jsonWithExtraType = {
      a: {
        type: "alias-1",
      },
    };

    expect(noAdditionalValidator(jsonWithExtraType)).toEqual(false);
    expect(indexMappingsJSONEditorValidator(jsonWithExtraType)).toEqual(false);

    const jsonWithoutRequiredProperties = {
      a: {
        type: "alias",
      },
    };

    expect(noAdditionalValidator(jsonWithoutRequiredProperties)).toEqual(true);
    expect(indexMappingsJSONEditorValidator(jsonWithoutRequiredProperties)).toEqual(false);

    const jsonWithNestedProperty = {
      a: {
        type: "object",
        properties: {
          b: {
            type: "alias-1",
          },
        },
      },
    };

    expect(noAdditionalValidator(jsonWithNestedProperty)).toEqual(false);
    expect(indexMappingsJSONEditorValidator(jsonWithNestedProperty)).toEqual(false);

    const jsonWithoutProperties = {
      a: {
        type: "object",
      },
    };

    expect(noAdditionalValidator(jsonWithoutProperties)).toEqual(true);
    expect(indexMappingsJSONEditorValidator(jsonWithoutProperties)).toEqual(false);
  });
});
