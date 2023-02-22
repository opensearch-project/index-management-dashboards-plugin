/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
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
