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
import Ajv from "ajv";
import { DiffableMappingsPropertiesObject, MappingsProperties, MappingsPropertiesObject } from "../../../models/interfaces";
import { noAdditionalJSONSchema } from "../../utils/JSON_schemas/index_mappings";

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

const ajvInstance = new Ajv();
export const noAdditionalPropertiesValidator = ajvInstance.compile(noAdditionalJSONSchema);
