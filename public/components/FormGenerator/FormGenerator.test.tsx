/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from "react";
import { render } from "@testing-library/react";
import FormGenerator, { IFormGeneratorProps, IFormGeneratorRef } from "./index";
import { renderHook } from "@testing-library/react-hooks";
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
          required: true,
          message: "error",
        },
      ],
    },
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
    const { result } = renderHook(() => {
      const ref = useRef<IFormGeneratorRef>(null);
      const renderResult = render(<FormGenerator formFields={testFormFields} ref={ref} />);
      return {
        ref,
        renderResult,
      };
    });
    const { ref } = result.current;
    const validateResult = await ref.current?.validatePromise();

    expect(validateResult?.errors).toEqual({
      test: {
        errors: ["error"],
      },
    });
  });
});
