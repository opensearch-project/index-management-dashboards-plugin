/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AddPrefixInput from "./AddPrefixInput";


const testProps = { getPrefix: jest.fn() };

beforeEach(() => {
  render(<AddPrefixInput {...testProps} />);
});

afterEach(() => {
  cleanup();
});

describe("AddPrefixInput component", () => {
  it("renders without error", () => {
    expect(screen.getByText("Specify prefix for restored index names")).toBeInTheDocument();
    expect(screen.getByTestId("prefixInput"));

    cleanup();

    const { container } = render(<AddPrefixInput {...testProps} />);

    expect(container).toMatchSnapshot();
  });

  it("accepts user input", () => {
    // User enters text
    userEvent.type(screen.getByTestId("prefixInput"), "test_prefix_");

    expect(screen.getByTestId("prefixInput")).toHaveValue("test_prefix_");
  });

  it("sends user input to parent component via getPrefix", () => {
    // User enters text into prefix input
    userEvent.type(screen.getByTestId("prefixInput"), "four");

    // getPrefix is prop sent from parent component to retrieve user input
    expect(testProps.getPrefix).toBeCalledTimes(4);
  });
});