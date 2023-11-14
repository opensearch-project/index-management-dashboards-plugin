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

// minimatch is a peer dependency of glob
import minimatch from "minimatch";
export const filterByMinimatch = (input: string, rules: string[]): boolean => {
  return rules.some((item) =>
    minimatch(input, item, {
      dot: true,
    })
  );
};

export const getOrderedJson = (json: object) => {
  const entries = Object.entries(json);
  entries.sort((a, b) => (a[0] < b[0] ? -1 : 1));
  return entries.reduce((total, [key, value]) => ({ ...total, [key]: value }), {});
};
