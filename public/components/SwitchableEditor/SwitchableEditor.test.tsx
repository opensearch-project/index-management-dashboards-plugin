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
import { render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SwitchableEditor from "./index";

describe("<SwitchableEditor /> spec", () => {
  it("renders the component", async () => {
    const onChangeMock = jest.fn();
    const { findByText, getByText, queryByText } = render(
      <SwitchableEditor onChange={onChangeMock} mode="diff" value={JSON.stringify({ name: "test" })} />
    );
    expect(document.body.children).toMatchSnapshot();
    userEvent.click(document.querySelector(".euiSwitch__button") as HTMLElement);
    await findByText("The original value");
    expect(document.body.children).toMatchSnapshot();
    await findByText("The original value");
    const textarea = document.querySelector('[data-test-subj="jsonEditor-valueDisplay"]') as HTMLElement;
    userEvent.type(textarea, "123");
    userEvent.click(document.body);
    await findByText(/Your input does not match the validation of json format/, undefined, {
      timeout: 3000,
    });
    userEvent.clear(textarea);
    userEvent.paste(textarea, `{ "name": "test" }`);
    userEvent.click(document.body);
    await waitFor(() => {});
    expect(onChangeMock).toBeCalledWith(`{ "name": "test" }`);
  });
});
