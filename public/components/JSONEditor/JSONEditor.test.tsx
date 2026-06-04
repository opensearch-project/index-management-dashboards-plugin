/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from "react";
import "@testing-library/jest-dom/extend-expect";
import { fireEvent, render, waitFor, renderHook } from "@testing-library/react";
import JSONEditor, { IJSONEditorRef } from "./JSONEditor";

async function inputTextArea(props: { textareaInput: HTMLTextAreaElement; nowValue: string; newValue: string }) {
  const { textareaInput, nowValue, newValue } = props;
  const valueLength = nowValue.length;
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
  textareaInput.value = newValue;
  fireEvent(
    textareaInput,
    new InputEvent("input", {
      data: newValue,
    })
  );
}

describe("<JSONEditor /> spec", () => {
  it("renders the component", () => {
    render(<JSONEditor value={JSON.stringify({ name: "test" })} />);
    // EuiOverlayMask appends an element to the body so we should have three (used to be two, after upgrading appears to have 3 now), an empty div from react-test-library
    // and our EuiOverlayMask element
    expect(document.body.children).toMatchSnapshot();
  });

  it("ref hook validate", async () => {
    const { result } = renderHook(() => {
      const refCorrect = useRef<IJSONEditorRef>(null);
      const refError = useRef<IJSONEditorRef>(null);
      render(
        <>
          <JSONEditor ref={refCorrect} value={JSON.stringify({ name: "test" })} />
          <JSONEditor ref={refError} value='{ "name": "test }' />
        </>
      );
      return {
        refCorrect,
        refError,
      };
    });
    const { refCorrect, refError } = result.current;
    await waitFor(() => expect(refCorrect.current?.validate()).resolves.toEqual(""));
    await waitFor(() => expect(refError.current?.validate()).rejects.toEqual("Format validate error"));
  });

  it("it do not trigger onBlur when readonly", async () => {
    const onChangeMock = jest.fn();
    render(<JSONEditor readOnly value={JSON.stringify({ name: "test" })} onChange={onChangeMock} />);
    const textareaInput = document.querySelector(".ace_text-input") as HTMLTextAreaElement;
    fireEvent.focus(textareaInput);
    fireEvent.blur(textareaInput);

    expect(onChangeMock).toBeCalledTimes(0);
  });

  it("it triggers onChange when json is input", async () => {
    const onChangeMock = jest.fn();
    const { getByTestId, getByText, findByText } = render(<JSONEditor value={JSON.stringify({ name: "test" })} onChange={onChangeMock} />);
    const textareaInput = document.querySelector(".ace_text-input") as HTMLTextAreaElement;
    fireEvent.focus(textareaInput);
    await inputTextArea({
      textareaInput,
      nowValue: (getByTestId("jsonEditor-valueDisplay") as HTMLTextAreaElement).value,
      newValue: '{ "test": "1", 123 }',
    });
    fireEvent.blur(textareaInput);
    await findByText("Your input does not match the validation of json format, please fix the error line with error aside.");

    expect(onChangeMock).toBeCalledTimes(0);

    fireEvent.focus(textareaInput);
    await inputTextArea({
      textareaInput,
      nowValue: (getByTestId("jsonEditor-valueDisplay") as HTMLTextAreaElement).value,
      newValue: '{ "test": "1" }',
    });
    fireEvent.blur(textareaInput);
    await waitFor(() => {
      expect(onChangeMock).toBeCalledTimes(1);
      expect(onChangeMock).toBeCalledWith('{ "test": "1" }');
    });
  });
});
