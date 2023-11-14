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
