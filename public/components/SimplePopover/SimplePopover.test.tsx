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
import { render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SimplePopover, { loopToGetPath } from "./SimplePopover";

describe("<SimplePopover /> spec", () => {
  it("renders the component", () => {
    render(<SimplePopover button={<div>123</div>} />);
    expect(document.body.children).toMatchSnapshot();
  });

  it("return [] when element is null", () => {
    expect(loopToGetPath(null)).toEqual([]);
  });

  it("render the component with hover", async () => {
    const { getByTestId, queryByText } = render(
      <>
        <SimplePopover triggerType="hover" button={<div data-test-subj="test">button</div>}>
          content in popover
        </SimplePopover>
        <div data-test-subj="anotherElement">another element</div>
      </>
    );
    userEvent.hover(getByTestId("test"));
    await waitFor(() => {
      expect(queryByText("content in popover")).not.toBeNull();
    });
    userEvent.hover(getByTestId("anotherElement"));
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
