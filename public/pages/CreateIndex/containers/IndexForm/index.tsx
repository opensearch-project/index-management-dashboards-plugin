/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { diffArrays } from "diff";
import { IAliasAction } from "../../../../../models/interfaces";

export const getAliasActionsByDiffArray = (
  oldAliases: string[],
  newAliases: string[],
  callback: (val: string) => IAliasAction[string]
): IAliasAction[] => {
  const diffedAliasArrayes = diffArrays(oldAliases, newAliases);
  return diffedAliasArrayes.reduce((total: IAliasAction[], current) => {
    if (current.added) {
      return [
        ...total,
        ...current.value.map((item) => ({
          add: callback(item),
        })),
      ];
    } else if (current.removed) {
      return [
        ...total,
        ...current.value.map((item) => ({
          remove: callback(item),
        })),
      ];
    }

    return total;
  }, [] as IAliasAction[]);
};
