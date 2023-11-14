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
import "@testing-library/jest-dom/extend-expect";
import { render } from "@testing-library/react";
import { fireEvent } from "@testing-library/dom";
import FlyoutFooter from "./FlyoutFooter";

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
