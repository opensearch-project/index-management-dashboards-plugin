import { INDEX_MAPPING_TYPES } from "../../constants";

export const schemaId = "ISMIndexMappingProperties";

export const typeSchema = {
  description: "type for this field",
  enum: INDEX_MAPPING_TYPES.map((item) => item.label),
};

export const propertiesSchema = {
  description: "properties for this field",
  $ref: schemaId,
};
