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
    expect(screen.getByTestId("prefixInput")).toBeInTheDocument();

    const { container } = render(<AddPrefixInput {...testProps} />);

    expect(container).toMatchSnapshot();
  });

  it("accepts user input", () => {
    userEvent.type(screen.getByTestId("prefixInput"), "test_prefix_");

    expect(screen.getByTestId("prefixInput")).toHaveValue("restored_test_prefix_");
  });

  it("sends user input to parent component via getPrefix", () => {
    userEvent.type(screen.getByTestId("prefixInput"), "four");

    // getPrefix is prop sent from parent component to retrieve user input
    expect(testProps.getPrefix).toBeCalledTimes(4);
  });
});
