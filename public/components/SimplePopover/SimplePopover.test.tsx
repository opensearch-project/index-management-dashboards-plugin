/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { render, waitFor } from "@testing-library/react";
import SimplePopover from "./SimplePopover";
import userEvent from "@testing-library/user-event";

describe("<SimplePopover /> spec", () => {
  it("renders the component", () => {
    render(<SimplePopover button={<div>123</div>} />);
    expect(document.body.children).toMatchSnapshot();
  });

  it("render the component with hover", async () => {
    const { getByTestId, queryByText } = render(
      <SimplePopover triggerType="hover" button={<div data-test-subj="test">button</div>}>
        content in popover
      </SimplePopover>
    );
    userEvent.hover(getByTestId("test"));
    await waitFor(() => {
      expect(queryByText("content in popover")).not.toBeNull();
    });
    userEvent.unhover(getByTestId("test"));
    await waitFor(() => {
      expect(queryByText("content in popover")).toBeNull();
    });
  });

  it("render the component with click", async () => {
    const { getByTestId, queryByText } = render(
      <SimplePopover button={<div data-test-subj="test">button</div>}>content in popover</SimplePopover>
    );
    userEvent.click(getByTestId("test"));
    await waitFor(() => {
      expect(queryByText("content in popover")).not.toBeNull();
    });
    userEvent.click(document.body);
    await waitFor(() => {
      expect(queryByText("content in popover")).toBeNull();
    });
  });
});
