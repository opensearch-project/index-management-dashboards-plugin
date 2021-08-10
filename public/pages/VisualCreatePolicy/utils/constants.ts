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

export const DEFAULT_LEGACY_ERROR_NOTIFICATION = {
  destination: {
    slack: {
      url: "<url>",
    },
  },
  message_template: {
    source: "The index {{ctx.index}} failed during policy execution.",
  },
};
