/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { render } from "@testing-library/react";
import FlyoutFooter from "./FlyoutFooter";
import { fireEvent } from "@testing-library/dom";

describe("<FlyoutFooter /> spec", () => {
  it("renders the component", () => {
    const { container } = render(<FlyoutFooter edit={true} action="action" onClickAction={() => {}} onClickCancel={() => {}} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it("calls onClickAction  with clicking action button", async () => {
    const onClickAction = jest.fn();
    const { getByTestId } = render(<FlyoutFooter edit={true} action="action" onClickAction={onClickAction} onClickCancel={() => {}} />);

    fireEvent.click(getByTestId("flyout-footer-action-button"));
    expect(onClickAction).toHaveBeenCalledTimes(1);
  });

  it("calls onClickCancel  with clicking cancel button", async () => {
    const onClickCancel = jest.fn();
    const { getByTestId } = render(<FlyoutFooter edit={true} action="action" onClickAction={() => {}} onClickCancel={onClickCancel} />);

    fireEvent.click(getByTestId("flyout-footer-cancel-button"));
    expect(onClickCancel).toHaveBeenCalledTimes(1);
  });
});
