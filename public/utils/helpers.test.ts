/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import { diffJson } from "./helpers";

describe("helpers spec", () => {
  it(`diffJson`, async () => {
    expect(diffJson({ a: 123, b: 456, c: 789 }, { a: 123, b: 456 })).toEqual(1);
    expect(diffJson({ a: 123, b: 456, c: 789 }, { b: 456, a: 123 })).toEqual(1);
    expect(diffJson({ a: 123, b: 456, c: [1, 2, { foo: "bar" }, 4] }, { a: 123, b: 456, c: [1, { foo: "bar" }, 4] })).toEqual(1);
    expect(
      diffJson(
        {
          a: 123,
          b: 456,
          c: {
            a: "2",
            b: "3",
          },
        },
        {
          a: 123,
          c: {
            b: "3",
            c: 4,
          },
        }
      )
    ).toEqual(3);
    expect(
      diffJson(
        {},
        {
          foo: {},
          test: {},
        }
      )
    ).toEqual(2);
  });
});
