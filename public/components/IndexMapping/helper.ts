/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import { DiffableMappingsPropertiesObject, MappingsProperties, MappingsPropertiesObject } from "../../../models/interfaces";

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
