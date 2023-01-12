import { JSONSchema4 } from "@types/json-schema";
import { INDEX_MAPPING_TYPES } from "../../constants";
import { propertiesSchema, typeSchema, schemaId } from "./property_item";

export * from "./property_item";

export const noAdditionalJSONSchema: JSONSchema4 = {
  title: "Index mapping properties",
  description: "Index mapping properties validation",
  type: "object",
  $id: schemaId,
  patternProperties: {
    ".*": {
      type: "object",
      properties: {
        type: typeSchema,
      },
      required: ["type"],
      allOf: [
        ...INDEX_MAPPING_TYPES.map((item) => {
          const payload: JSONSchema4 = {
            if: {
              properties: { type: { const: item.label } },
            },
            then: {
              properties: {
                type: typeSchema,
                ...item.options?.fields?.reduce(
                  (total, current) => ({
                    ...total,
                    [current.name as string]: {
                      description: current.label,
                      type: current.validateType,
                    },
                  }),
                  {}
                ),
              },
              additionalProperties: false,
            },
          };

          return payload;
        }),
      ],
    },
  },
};

export const IndexMappingsJSONEditorSchema: JSONSchema4 = {
  title: "Index mapping properties",
  description: "Index mapping properties validation",
  type: "object",
  patternProperties: {
    ".*": {
      type: "object",
      required: ["type"],
      properties: {
        type: typeSchema,
      },
      allOf: [
        ...INDEX_MAPPING_TYPES.map((item) => {
          const payload: JSONSchema4 = {
            if: {
              properties: { type: { const: item.label } },
              required: ["type"],
            },
            then: {
              properties: {
                type: typeSchema,
                ...item.options?.fields?.reduce(
                  (total, current) => ({
                    ...total,
                    [current.name as string]: {
                      description: current.label,
                      type: current.validateType,
                    },
                  }),
                  {}
                ),
              },
              required: ["type", ...(item.options?.fields?.map((item) => item.name) || [])],
              additionalProperties: false,
            },
          };

          if (item.hasChildren) {
            payload.then.required.push("properties");
            payload.then.properties.properties = propertiesSchema;
          }

          return payload;
        }),
      ],
    },
  },
};
