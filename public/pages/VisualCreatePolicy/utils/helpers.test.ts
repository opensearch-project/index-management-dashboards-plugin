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

import { convertTemplatesToArray } from "./helpers";
import { ISMTemplate } from "../../../../models/interfaces";

test("converts all ism template formats into a list of ism templates", () => {
  expect(convertTemplatesToArray(null)).toEqual([]);
  expect(convertTemplatesToArray(undefined)).toEqual([]);
  const template: ISMTemplate = { index_patterns: ["*"], priority: 1 };
  expect(convertTemplatesToArray(template)).toEqual([template]);
  const templates = [template, { index_patterns: ["log*"], priority: 50 }];
  expect(convertTemplatesToArray(templates)).toEqual(templates);
});
