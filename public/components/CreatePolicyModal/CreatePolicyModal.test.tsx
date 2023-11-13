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
import { render, fireEvent } from "@testing-library/react";
import CreatePolicyModal from "./CreatePolicyModal";

describe("<CreatePolicyModal /> spec", () => {
  it("renders the component", () => {
    render(<CreatePolicyModal isEdit={false} onClose={() => {}} onClickContinue={() => {}} />);
    // EuiOverlayMask appends an element to the body so we should have three (used to be two, after upgrading appears to have 3 now), an empty div from react-test-library
    // and our EuiOverlayMask element
    expect(document.body.children).toHaveLength(3);
    expect(document.body.children[2]).toMatchSnapshot();
  });

  it("renders the component w/ edit", () => {
    render(<CreatePolicyModal isEdit={true} onClose={() => {}} onClickContinue={() => {}} />);
    // EuiOverlayMask appends an element to the body so we should have three (used to be two, after upgrading appears to have 3 now), an empty div from react-test-library
    // and our EuiOverlayMask element
    expect(document.body.children).toHaveLength(3);
    expect(document.body.children[2]).toMatchSnapshot();
  });

  it("calls onAction and onCLose when action button clicked", () => {
    const onContinue = jest.fn();
    const onClose = jest.fn();
    const { getByTestId } = render(<CreatePolicyModal isEdit={false} onClose={onClose} onClickContinue={onContinue} />);

    fireEvent.click(getByTestId("createPolicyModalContinueButton"));
    expect(onContinue).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it("calls close when close button clicked", () => {
    const onClose = jest.fn();
    const { getByTestId } = render(<CreatePolicyModal isEdit={false} onClose={onClose} onClickContinue={() => {}} />);

    fireEvent.click(getByTestId("createPolicyModalCancelButton"));
    expect(onClose).toHaveBeenCalled();
  });
});
