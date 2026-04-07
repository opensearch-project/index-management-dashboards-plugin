/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import { DiffableMappingsPropertiesObject, MappingsProperties, MappingsPropertiesObject } from "../../../models/interfaces";
import { INDEX_MAPPING_TYPES } from "../../utils/constants";

export const transformObjectToArray = (obj: MappingsPropertiesObject): MappingsProperties => {
  return Object.entries(obj).map(([fieldName, fieldSettings]) => {
    const { properties, type, ...others } = fieldSettings;
    const payload: MappingsProperties[number] = {
      ...others,
      type: type || "object",
      fieldName,
    };
    if (properties) {
      payload.properties = transformObjectToArray(properties);
    }
    return payload;
  });
};

export const transformArrayToObject = (array: MappingsProperties): MappingsPropertiesObject => {
  return array.reduce((total, current) => {
    const { fieldName, properties, type, ...others } = current;
    const payload: MappingsPropertiesObject[string] = {
      ...others,
      type: type || "object",
    };
    if (properties) {
      payload.properties = transformArrayToObject(properties);
    }
    return {
      ...total,
      [current.fieldName]: payload,
    };
  }, {} as MappingsPropertiesObject);
};

export const transformArrayToDiffableObject = (array: MappingsProperties): DiffableMappingsPropertiesObject => {
  return array.reduce((total, current, index) => {
    const { properties, ...others } = current;
    const payload: MappingsPropertiesObject[string] = {
      ...others,
    };
    if (properties) {
      payload.properties = transformArrayToObject(properties);
    }
    return {
      ...total,
      [index]: payload,
    };
  }, {} as DiffableMappingsPropertiesObject);
};

export const countNodesInTree = (array: MappingsProperties) => {
  return array.reduce((total, current) => {
    total = total + 1;
    const { properties } = current;
    if (properties) {
      total = total + countNodesInTree(properties);
    }
    return total;
  }, 0);
};

// Create allowed mapping types
const allowedTypes = INDEX_MAPPING_TYPES.map((item) => item.label);

// Helper function to validate a single mapping property
const noAdditionalSchemaValidator = (value: any, visited: WeakSet<object> = new WeakSet()): boolean => {
  if (!value || !value.type) return false;

  // Circular reference detection
  if (typeof value === "object" && value !== null) {
    if (visited.has(value)) {
      return false;
    }
    visited.add(value);
  }

  // Check if type is valid
  if (!allowedTypes.includes(value.type)) return false;

  const mappingType = INDEX_MAPPING_TYPES.find((item) => item.label === value.type);
  if (!mappingType) return false;

  // Enforce additionalProperties: false - only allow specific properties
  const allowedPropertyNames = new Set(["type"]);

  // Add allowed fields for this mapping type
  if (mappingType.options?.fields) {
    mappingType.options.fields.forEach((field) => {
      allowedPropertyNames.add(field.name);
    });
  }

  // Add 'properties' if this type has children
  if (mappingType.hasChildren) {
    allowedPropertyNames.add("properties");
  }

  // Check for additional properties (strict validation) - only enumerable own properties
  for (const key of Object.keys(value)) {
    if (!allowedPropertyNames.has(key)) {
      return false; // Additional property not allowed
    }
  }

  // Validate required fields for types that have specific requirements
  if (mappingType.options?.fields) {
    for (const field of mappingType.options.fields) {
      if (Object.prototype.hasOwnProperty.call(value, field.name)) {
        const fieldValue = value[field.name];
        // Validate field type
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
  if (mappingType.hasChildren && Object.prototype.hasOwnProperty.call(value, "properties")) {
    if (typeof value.properties !== "object" || value.properties === null || Array.isArray(value.properties)) {
      return false;
    }

    for (const prop of Object.values(value.properties)) {
      if (!noAdditionalSchemaValidator(prop, visited)) {
        return false;
      }
    }
  }

  return true;
};

export const noAdditionalPropertiesValidator = (data: unknown): boolean => {
  // Handle non-objects (including arrays, null, primitives)
  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    return false;
  }

  try {
    // Use Object.getOwnPropertyNames to avoid prototype pollution
    const propertyNames = Object.getOwnPropertyNames(data);
    for (const propertyName of propertyNames) {
      const property = (data as Record<string, any>)[propertyName];
      if (!noAdditionalSchemaValidator(property)) {
        return false;
      }
    }
    return true;
  } catch {
    return false;
  }
};
