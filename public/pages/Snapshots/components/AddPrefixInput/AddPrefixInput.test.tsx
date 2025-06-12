/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { render, screen, cleanup } from "@testing-library/react";
import userEventModule from "@testing-library/user-event";
import AddPrefixInput from "./AddPrefixInput";

const testProps = { getPrefix: jest.fn() };

beforeEach(() => {
  render(<AddPrefixInput {...testProps} />);
});

afterEach(() => {
  cleanup();
});

describe("AddPrefixInput component", () => {
  const userEvent = userEventModule.setup();

  it("renders without error", () => {
    expect(screen.getByText("Specify prefix for restored index names")).toBeInTheDocument();
    expect(screen.getByTestId("prefixInput")).toBeInTheDocument();

    const { container } = render(<AddPrefixInput {...testProps} />);

    expect(container).toMatchSnapshot();
  });

  it("accepts user input", async () => {
    await userEvent.type(screen.getByTestId("prefixInput"), "test_prefix_");

    expect(screen.getByTestId("prefixInput")).toHaveValue("restored_test_prefix_");
  });

  it("sends user input to parent component via getPrefix", async () => {
    await userEvent.type(screen.getByTestId("prefixInput"), "four");

    // getPrefix is prop sent from parent component to retrieve user input
    expect(testProps.getPrefix).toBeCalledTimes(4);
  });
});
