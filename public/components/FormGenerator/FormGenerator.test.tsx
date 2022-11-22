/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { forwardRef, useRef } from "react";
import { act, fireEvent, render, waitFor } from "@testing-library/react";
import { renderHook } from "@testing-library/react-hooks";
import userEvent from "@testing-library/user-event";
import { EuiButton } from "@elastic/eui";
import FormGenerator, { IFormGeneratorProps, IFormGeneratorRef } from "./index";
import { ValidateResults } from "../../lib/field";
const testFormFields: IFormGeneratorProps["formFields"] = [
  {
    rowProps: {
      label: "test",
    },
    name: "test",
    type: "Input",
    options: {
      rules: [
        {
          validator: (rule, value, values) => {
            // let's use a validation that the values.test_component should be the same as values.test
            // you can custom validation here as you want
            if (values.test_component !== values.test) {
              // do not pass the validation
              // return a rejected promise with error message
              return Promise.reject("values.test_component !== values.test");
            }

            // pass the validation
            // return a resolved promise
            return Promise.resolve();
          },
        },
      ],
    },
  },
  {
    rowProps: {
      label: "component test",
    },
    name: "test_component",
    options: {
      rules: [
        {
          required: false,
        },
      ],
    },
    component: forwardRef(({ onChange, value, ...others }, ref: React.Ref<any>) => (
      <input ref={ref} value={value || ""} onChange={(e) => onChange(e.target.value)} />
    )),
  },
  {
    rowProps: {
      label: "component test",
    },
    name: "test_component_2",
    type: "Input",
  },
];

describe("<FormGenerator /> spec", () => {
  it("render the component", async () => {
    render(<FormGenerator formFields={testFormFields} />);
    // EuiOverlayMask appends an element to the body so we should have three (used to be two, after upgrading appears to have 3 now), an empty div from react-test-library
    // and our EuiOverlayMask element
    await waitFor(() => {});
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
          advancedSettingsProps={{
            accordionProps: { initialIsOpen: true, id: "test" },
            blockedNameList: [testFormFields[0].name],
          }}
        />
      );
      return {
        ref,
        renderResult,
      };
    });
    const { ref } = result.current;
    const { getByTestId } = result.current.renderResult;
    userEvent.type(getByTestId("form-name-test").querySelector("input") as Element, "3");
    let validateResult: ValidateResults | undefined;
    await act(async () => {
      validateResult = await ref.current?.validatePromise();
    });

    fireEvent.focus(getByTestId("form-name-advanced-settings").querySelector(".ace_text-input") as HTMLElement);
    const value = (getByTestId("json-editor-value-display") as HTMLTextAreaElement).value;
    const valueLength = value.length;
    expect(JSON.parse(value)).toEqual({});
    for (let i = 0; i < valueLength; i++) {
      await fireEvent(
        getByTestId("form-name-advanced-settings").querySelector(".ace_text-input") as HTMLElement,
        new KeyboardEvent("keydown", {
          keyCode: 40,
        })
      );
    }
    for (let i = 0; i < valueLength; i++) {
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
      test: ["values.test_component !== values.test"],
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

    userEvent.type(getByTestId("form-name-test_component").querySelector("input") as Element, "1");
    expect(onChangeMock).toBeCalledWith(
      {
        test: "1",
        test_component: "1",
      },
      "test_component",
      "1"
    );
  });

  it("shows error with custom validation in class component", async () => {
    class FormGeneratorUsedInClassComponent extends React.Component<{ onValidate: (validateResult: any) => void }> {
      formRef: IFormGeneratorRef | null = null;
      onSubmit = async () => {
        // trigger the validation manually here
        const validateResult = await this.formRef?.validatePromise();
        this.props.onValidate(validateResult);
        const { errors } = validateResult || {};
        if (errors) {
          return;
        }
        // you can submit your data here.
      };
      render() {
        return (
          <>
            <FormGenerator
              formFields={testFormFields}
              ref={(ref) => (this.formRef = ref)}
              value={{
                test: "1",
                test_component: "",
              }}
            />
            <EuiButton data-test-subj="submit" onClick={this.onSubmit}>
              submit here
            </EuiButton>
          </>
        );
      }
    }
    const onValidate = jest.fn();
    const { getByTestId } = render(<FormGeneratorUsedInClassComponent onValidate={onValidate} />);
    await act(async () => {
      await userEvent.click(getByTestId("submit"));
    });

    expect(onValidate).toBeCalledWith({
      errors: {
        test: ["values.test_component !== values.test"],
      },
      values: {
        test: "1",
        test_component: "",
      },
    });

    await act(async () => {
      await userEvent.clear(getByTestId("form-name-test").querySelector("input") as Element);
      await userEvent.click(getByTestId("submit"));
    });

    expect(onValidate).toBeCalledWith({
      errors: null,
      values: {
        test: "",
        test_component: "",
      },
    });
  });

  it("shows error with custom validation in function component", async () => {
    const FormGeneratorUsedInFunctionComponent = function (props: { onValidate: (validateResult: any) => void }) {
      const formRef = useRef<IFormGeneratorRef>(null);

      const onSubmit = async () => {
        // trigger the validation manually here
        const validateResult = await formRef.current?.validatePromise();
        props.onValidate(validateResult);
        const { errors } = validateResult || {};
        if (errors) {
          return;
        }
        // you can submit your data here.
      };
      return (
        <>
          <FormGenerator
            formFields={testFormFields}
            ref={formRef}
            value={{
              test: "1",
              test_component: "",
            }}
          />
          <EuiButton data-test-subj="submit" onClick={onSubmit}>
            submit here
          </EuiButton>
        </>
      );
    };
    const onValidate = jest.fn();
    const { getByTestId } = render(<FormGeneratorUsedInFunctionComponent onValidate={onValidate} />);
    await act(async () => {
      await userEvent.click(getByTestId("submit"));
    });

    expect(onValidate).toBeCalledWith({
      errors: {
        test: ["values.test_component !== values.test"],
      },
      values: {
        test: "1",
        test_component: "",
      },
    });

    await act(async () => {
      await userEvent.clear(getByTestId("form-name-test").querySelector("input") as Element);
      await userEvent.click(getByTestId("submit"));
    });

    expect(onValidate).toBeCalledWith({
      errors: null,
      values: {
        test: "",
        test_component: "",
      },
    });
  });
});
