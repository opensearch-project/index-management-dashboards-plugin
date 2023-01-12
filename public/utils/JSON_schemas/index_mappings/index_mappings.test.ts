/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import Ajv from "ajv";
import { noAdditionalJSONSchema, IndexMappingsJSONEditorSchema } from "./index";

describe("index_mappings json schema spec", () => {
  it(`validate jsons correctly`, async () => {
    const noAdditionalValidator = new Ajv().compile(noAdditionalJSONSchema);
    const indexMappingsJSONEditorValidator = new Ajv().compile(IndexMappingsJSONEditorSchema);

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
