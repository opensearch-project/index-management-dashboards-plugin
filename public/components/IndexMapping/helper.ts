/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import { MappingsProperties, MappingsPropertiesObject } from "../../../models/interfaces";

export const transformObjectToArray = (obj: MappingsPropertiesObject): MappingsProperties => {
  return Object.entries(obj).map(([fieldName, fieldSettings]) => {
    const { properties, ...others } = fieldSettings;
    const payload: MappingsProperties[number] = {
      ...others,
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
    const { fieldName, properties, ...others } = current;
    const payload: MappingsPropertiesObject[string] = {
      ...others,
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
