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
const formatRegExp = /%[sdj%]/g;

export function format(...args: string[]) {
  let i = 1;
  const f = args[0];
  const len = args.length;
  if (typeof f === "string") {
    const str = String(f).replace(formatRegExp, (x) => {
      if (x === "%%") {
        return "%";
      }
      if (i >= len) {
        return x;
      }
      switch (x) {
        case "%s":
          return String(args[i++]);
        case "%d":
          return `${Number(args[i++])}`;
        case "%j":
          try {
            return JSON.stringify(args[i++]);
          } catch (_) {
            return "[Circular]";
          }
        default:
          return x;
      }
    });

    return str;
  }
  return f;
}
