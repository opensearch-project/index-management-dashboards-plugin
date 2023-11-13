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

/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { render } from "@testing-library/react";
import { waitFor, screen, fireEvent } from "@testing-library/dom";
import States from "./States";
import { DEFAULT_POLICY } from "../../utils/constants";

describe("<States /> spec", () => {
  it("renders the component", () => {
    const { container } = render(
      <States
        policy={DEFAULT_POLICY}
        onOpenFlyout={() => {}}
        onClickEditState={() => {}}
        onClickDeleteState={() => {}}
        onChangeDefaultState={() => {}}
      />
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it("shows empty states message when none defined", async () => {
    render(
      <States
        policy={{ ...DEFAULT_POLICY, states: [], default_state: "" }}
        onOpenFlyout={() => {}}
        onClickEditState={() => {}}
        onClickDeleteState={() => {}}
        onChangeDefaultState={() => {}}
      />
    );
    await waitFor(() => screen.getByText("You can think of policies as state machines.", { exact: false }));
    expect(
      screen.queryByText("Your policy currently has no states defined. Add states to manage your index lifecycle.", { exact: false })
    ).not.toBeNull();
  });

  it("opens flyout on clicking add state", async () => {
    const onOpenFlyout = jest.fn();
    const { getByTestId } = render(
      <States
        policy={{ ...DEFAULT_POLICY, states: [], default_state: "" }}
        onOpenFlyout={onOpenFlyout}
        onClickEditState={() => {}}
        onClickDeleteState={() => {}}
        onChangeDefaultState={() => {}}
      />
    );
    await waitFor(() =>
      screen.queryByText("Your policy currently has no states defined. Add states to manage your index lifecycle.", { exact: false })
    );
    fireEvent.click(getByTestId("states-add-state-button"));
    expect(onOpenFlyout).toHaveBeenCalled();
  });
});
