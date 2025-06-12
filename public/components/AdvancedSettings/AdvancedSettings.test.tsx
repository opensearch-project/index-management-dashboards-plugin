/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { fireEvent, render } from "@testing-library/react";
import AdvancedSettings from "./index";
import userEventModule from "@testing-library/user-event";

describe("<FormGenerator /> spec", () => {
  const userEvent = userEventModule.setup();
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
    await userEvent.clear(textareaInput);
    await userEvent.paste('{ "test": "1" }');
    await userEvent.click(document.body);
    expect(onChangeMock).toBeCalledTimes(1);
    expect(onChangeMock).toBeCalledWith({ test: "1" });
  });
});
