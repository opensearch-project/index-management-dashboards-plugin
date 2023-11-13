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

/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

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
