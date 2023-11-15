/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { render, waitFor, act } from "@testing-library/react";
import { fireEvent } from "@testing-library/dom";
import EuiToolTipWrapper from "./index";

const WrappedInput = EuiToolTipWrapper((props: any) => <input {...props} />);

describe("<FormGenerator /> spec", () => {
  it("render the component", async () => {
    render(<WrappedInput />);
    await waitFor(() => {});
    expect(document.body.children).toMatchSnapshot();
  });

  it("render the error", async () => {
    const { queryByText, container } = render(<WrappedInput disabledReason="test error" disabled data-test-subj="test" />);
    const anchorDOM = container.querySelector(".euiToolTipAnchor") as Element;
    await act(async () => {
      await fireEvent.mouseOver(anchorDOM, {
        bubbles: true,
      });
    });
    await waitFor(() => {
      expect(queryByText("test error")).not.toBeNull();
    });
  });
});
