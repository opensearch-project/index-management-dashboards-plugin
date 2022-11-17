/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { fireEvent, render, waitFor } from "@testing-library/react";
import JSONDiffEditor from "./index";
import userEvent from "@testing-library/user-event";

describe("<JSONDiffEditor /> spec", () => {
  it("renders the component", () => {
    render(<JSONDiffEditor value={JSON.stringify({ name: "test" })} />);
    // EuiOverlayMask appends an element to the body so we should have three (used to be two, after upgrading appears to have 3 now), an empty div from react-test-library
    // and our EuiOverlayMask element
    expect(document.body.children).toMatchSnapshot();
  });

  it("it do not trigger onBlur when readonly", async () => {
    const onChangeMock = jest.fn();
    render(<JSONDiffEditor readOnly value={JSON.stringify({ name: "test" })} onChange={onChangeMock} />);
    const textareaInput = document.querySelector(".ace_text-input") as HTMLTextAreaElement;
    fireEvent.focus(textareaInput);
    fireEvent.blur(textareaInput);

    expect(onChangeMock).toBeCalledTimes(0);
  });

  it("it triggers onChange when json is input", async () => {
    const onChangeMock = jest.fn();
    const { getByTestId, getByText } = render(<JSONDiffEditor value={JSON.stringify({ name: "test" })} onChange={onChangeMock} />);
    const textareaInput = document.querySelector(".ace_text-input") as HTMLTextAreaElement;
    fireEvent.focus(textareaInput);
    const valueLength = (getByTestId("json-editor-value-display") as HTMLTextAreaElement).value.length;
    for (let i = 0; i < valueLength; i++) {
      await fireEvent(
        textareaInput,
        new KeyboardEvent("keydown", {
          keyCode: 40,
        })
      );
    }
    for (let i = 0; i < valueLength; i++) {
      await fireEvent(
        textareaInput,
        new KeyboardEvent("keydown", {
          keyCode: 8,
        })
      );
    }
    // try to input a non-json string
    textareaInput.value = '{ "test": "1", 123 }';
    fireEvent(
      textareaInput,
      new InputEvent("input", {
        data: '{ "test": "1", 123 }',
      })
    );
    fireEvent.blur(textareaInput);
    await waitFor(() => {
      userEvent.click(getByText("Close to modify"));
    });

    expect(onChangeMock).toBeCalledTimes(0);

    fireEvent.focus(textareaInput);
    fireEvent.blur(textareaInput);
    userEvent.click(getByText("Continue with data reset"));
    expect(onChangeMock).toBeCalledTimes(1);
    expect(onChangeMock).toBeCalledWith(JSON.stringify({ name: "test" }));

    fireEvent.focus(textareaInput);
    fireEvent.blur(textareaInput);

    expect(onChangeMock).toBeCalledTimes(2);
  });
});
