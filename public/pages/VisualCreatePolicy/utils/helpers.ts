/*
 * SPDX-License-Identifier: Apache-2.0
 *
 * The OpenSearch Contributors require contributions made to
 * this file be licensed under the Apache-2.0 license or a
 * compatible open source license.
 *
 * Modifications Copyright OpenSearch Contributors. See
 * GitHub history for details.
 */

import { Transition } from "../../../../models/interfaces";

export const getConditionContent = (transition: Transition): string => {
  const {
    conditions: {
      min_doc_count: minDocCount = undefined,
      min_index_age: minIndexAge = undefined,
      min_size: minSize = undefined,
      cron = undefined,
    } = {},
  } = transition;
  if (minSize != undefined) return `Minimum index size is ${minSize}`;
  if (minDocCount != undefined) return `Minimum index doc count is ${minDocCount}`;
  if (minIndexAge != undefined) return `Minimum index age is ${minIndexAge}`;
  if (cron != undefined) return `After cron expression "${cron.cron.expression}" in ${cron.cron.timezone}`;
  return "No condition";
};
