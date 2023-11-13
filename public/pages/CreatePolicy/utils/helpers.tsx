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

import React from "react";
import { EuiText } from "@elastic/eui";

// A helper function to generate a simple string explaining how many elements a user can add to a list.
export const inputLimitText = (currCount = 0, limit = 0, singularKeyword = "", pluralKeyword = "", styleProps = {}) => {
  const difference = limit - currCount;
  const remainingLimit = `You can add up to ${difference} ${limit === 1 ? "" : "more"} ${
    difference === 1 ? singularKeyword : pluralKeyword
  }.`;
  const reachedLimit = `You have reached the limit of ${limit} ${limit === 1 ? singularKeyword : pluralKeyword}.`;
  return (
    <EuiText color={"subdued"} size={"xs"} style={styleProps}>
      {difference > 0 ? remainingLimit : reachedLimit}
    </EuiText>
  );
};
