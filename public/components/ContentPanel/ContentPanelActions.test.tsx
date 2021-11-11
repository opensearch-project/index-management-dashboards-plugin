/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { render, fireEvent } from "@testing-library/react";
import ContentPanelActions from "./ContentPanelActions";

describe("<ContentPanelActions /> spec", () => {
  it("renders the component", () => {
    const actions = [{ text: "ContentPanelActions" }];
    const { container } = render(<ContentPanelActions actions={actions} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it("renders a button to click", () => {
    const spy = jest.fn();
    const actions = [{ text: "ContentPanelActions", buttonProps: { onClick: spy } }];
    const { getByTestId } = render(<ContentPanelActions actions={actions} />);
    fireEvent.click(getByTestId("ContentPanelActionsButton"));
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("passes rest of props to button", () => {
    const spy = jest.fn();
    const actions = [{ text: "ContentPanelActions", buttonProps: { onClick: spy, disabled: true } }];
    const { getByTestId } = render(<ContentPanelActions actions={actions} />);
    fireEvent.click(getByTestId("ContentPanelActionsButton"));
    expect(spy).toHaveBeenCalledTimes(0);
    expect(getByTestId("ContentPanelActionsButton")).toBeDisabled();
  });
});
