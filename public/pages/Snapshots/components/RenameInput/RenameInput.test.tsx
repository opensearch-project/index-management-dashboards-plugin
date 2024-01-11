/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RenameInput from "./RenameInput";

const testProps = { getRenamePattern: jest.fn(), getRenameReplacement: jest.fn() };

beforeEach(() => {
  render(<RenameInput {...testProps} />);
});

afterEach(() => {
  cleanup();
});

describe("RenameInput component", () => {
  it("renders without error", () => {
    expect(screen.getByText("Rename Pattern")).toBeInTheDocument();
    expect(screen.getByText("Rename Replacement")).toBeInTheDocument();

    cleanup();

    const { container } = render(<RenameInput {...testProps} />);

    expect(container).toMatchSnapshot();
  });

  it("accepts user input", () => {
    // User enters text
    userEvent.type(screen.getByTestId("renamePatternInput"), "{selectall}{del}(.+)");

    expect(screen.getByTestId("renamePatternInput")).toHaveValue("(.+)");

    userEvent.type(screen.getByTestId("renameReplacementInput"), "{selectall}{del}test_$1");

    expect(screen.getByTestId("renameReplacementInput")).toHaveValue("test_$1");
  });

  it("sends user input to parent component via getRenamePattern", () => {
    // User enters text into renamePatternInput
    userEvent.type(screen.getByTestId("renamePatternInput"), "(.+)");

    // getRenamePattern is prop sent from parent component to retrieve user input
    expect(testProps.getRenamePattern).toBeCalledTimes(4);
  });

  it("sends user input to parent component via getRenameReplacement", () => {
    // User enters text into renamePatternInput
    userEvent.type(screen.getByTestId("renameReplacementInput"), "test_$1");

    // getRenamePattern is prop sent from parent component to retrieve user input
    expect(testProps.getRenameReplacement).toBeCalledTimes(7);
  });
});
