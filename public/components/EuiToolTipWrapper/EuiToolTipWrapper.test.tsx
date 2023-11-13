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
