/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
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
