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
