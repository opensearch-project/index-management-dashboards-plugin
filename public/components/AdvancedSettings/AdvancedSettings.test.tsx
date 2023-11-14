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
import { fireEvent, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AdvancedSettings from "./index";

describe("<FormGenerator /> spec", () => {
  it("render the component", () => {
    render(<AdvancedSettings value={{ a: "foo" }} accordionProps={{ id: "test", initialIsOpen: false }} />);
    expect(document.body.children).toMatchSnapshot();
  });

  it("do some actions with render props", async () => {
    const onChangeMock = jest.fn();
    render(
      <AdvancedSettings
        onChange={onChangeMock}
        value={{}}
        renderProps={(props) => (
          <textarea
            onBlur={(e) => {
              props.onChange(JSON.parse(e.target.value));
            }}
          />
        )}
        accordionProps={{ id: "test", initialIsOpen: false }}
      />
    );
    const textareaInput = document.querySelector("textarea") as HTMLTextAreaElement;
    userEvent.clear(textareaInput);
    userEvent.paste(textareaInput, '{ "test": "1" }');
    userEvent.click(document.body);
    expect(onChangeMock).toBeCalledTimes(1);
    expect(onChangeMock).toBeCalledWith({ test: "1" });
  });
});
