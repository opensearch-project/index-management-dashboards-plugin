/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { Snapshot } from "../../../../../models/interfaces";

export const getEmptySnapshot = (): Snapshot => ({
  indices: "",
  ignore_unavailable: false,
  include_global_state: false,
  partial: false,
});
