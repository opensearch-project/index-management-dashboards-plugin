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

import React from "react";
import { render, screen } from "@testing-library/react";
import { inputLimitText } from "./helpers";

function renderInputLimitText(currCount?, limit?, singularKeyword?, pluralKeyword?, styleProps?) {
  return { ...render(inputLimitText(currCount, limit, singularKeyword, pluralKeyword, styleProps)) };
}

describe("inputLimitText", () => {
  it("renders the component with 0 inputs", () => {
    const expected = `You can add up to 10 more aliases.`;
    const { container } = renderInputLimitText(0, 10, "alias", "aliases");
    expect(screen.getByText(expected)).toBeInTheDocument();
    expect(container.firstChild).toMatchSnapshot();
  });

  it("renders the component with 1 input remaining", () => {
    const expected = "You can add up to 1 more alias.";
    const { container } = renderInputLimitText(9, 10, "alias", "aliases");
    expect(screen.getByText(expected)).toBeInTheDocument();
    expect(container.firstChild).toMatchSnapshot();
  });

  it("renders the component with 0 inputs remaining", () => {
    const expected = "You have reached the limit of 10 aliases.";
    const { container } = renderInputLimitText(10, 10, "alias", "aliases");
    expect(screen.getByText(expected)).toBeInTheDocument();
    expect(container.firstChild).toMatchSnapshot();
  });
});
