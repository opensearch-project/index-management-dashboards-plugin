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
import "@testing-library/jest-dom/extend-expect";
import { render, waitFor } from "@testing-library/react";
// @ts-ignore
import userEvent from "@testing-library/user-event";
import IndexControls from "./IndexControls";

describe("<IndexControls /> spec", () => {
  it("renders the component", async () => {
    const { container } = render(<IndexControls value={{ search: "testing" }} onSearchChange={() => {}} />);

    expect(container.firstChild).toMatchSnapshot();
  });

  it("onChange with right data", async () => {
    const onSearchChangeMock = jest.fn();
    const { getByPlaceholderText } = render(<IndexControls value={{ search: "" }} onSearchChange={onSearchChangeMock} />);

    userEvent.type(getByPlaceholderText("Search..."), "test");
    await waitFor(() => {
      expect(onSearchChangeMock).toBeCalledTimes(4);
      expect(onSearchChangeMock).toBeCalledWith({
        search: "test",
      });
    });
  });
});
