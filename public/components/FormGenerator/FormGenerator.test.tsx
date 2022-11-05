/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from "react";
import { fireEvent, render } from "@testing-library/react";
import FormGenerator, { IFormGeneratorProps, IFormGeneratorRef } from "./index";
import { renderHook } from "@testing-library/react-hooks";
import userEvent from "@testing-library/user-event";
const testFormFields: IFormGeneratorProps["formFields"] = [
  {
    rowProps: {
      label: "test",
      children: <h1>test</h1>,
    },
    name: "test",
    type: "Input",
    options: {
      rules: [
        {
          required: true,
          message: "error",
        },
      ],
    },
  },
  {
    rowProps: {
      label: "component test",
      children: <h1>test</h1>,
    },
    name: "test_component",
    component: ({ onChange, ...others }) => <input {...others} onChange={(e) => onChange(e.target.value)} />,
  },
];

describe("<FormGenerator /> spec", () => {
  it("render the component", () => {
    render(<FormGenerator formFields={testFormFields} />);
    // EuiOverlayMask appends an element to the body so we should have three (used to be two, after upgrading appears to have 3 now), an empty div from react-test-library
    // and our EuiOverlayMask element
    expect(document.body.children).toMatchSnapshot();
  });

  it("shows error when invalid", async () => {
    const onChangeMock = jest.fn();
    const { result } = renderHook(() => {
      const ref = useRef<IFormGeneratorRef>(null);
      const renderResult = render(
        <FormGenerator
          onChange={onChangeMock}
          formFields={testFormFields}
          ref={ref}
          hasAdvancedSettings
          advancedSettingsProps={{ accordionProps: { initialIsOpen: true, id: "test" } }}
        />
      );
      return {
        ref,
        renderResult,
      };
    });
    const { ref } = result.current;
    const validateResult = await ref.current?.validatePromise();
    const { getByTestId } = result.current.renderResult;

    userEvent.type(getByTestId("form-name-test").querySelector("input") as Element, "3");
    fireEvent.focus(getByTestId("form-name-advanced-settings").querySelector(".ace_text-input") as HTMLElement);
    for (let i = 0; i < 2; i++) {
      await fireEvent(
        getByTestId("form-name-advanced-settings").querySelector(".ace_text-input") as HTMLElement,
        new KeyboardEvent("keydown", {
          keyCode: 8,
        })
      );
    }
    (getByTestId("form-name-advanced-settings").querySelector(".ace_text-input") as HTMLTextAreaElement).value = '{ "test": "1" }';
    fireEvent(
      getByTestId("form-name-advanced-settings").querySelector(".ace_text-input") as HTMLElement,
      new InputEvent("input", {
        data: '{ "test": "1" }',
      })
    );
    fireEvent.blur(getByTestId("form-name-advanced-settings").querySelector(".ace_text-input") as HTMLElement);

    expect(validateResult?.errors).toEqual({
      test: {
        errors: ["error"],
      },
    });

    expect(onChangeMock).toBeCalledWith(
      {
        test: "3",
      },
      "test",
      "3"
    );

    expect(onChangeMock).toBeCalledWith(
      {
        test: "1",
      },
      undefined,
      {
        test: "1",
      }
    );
  });
});
