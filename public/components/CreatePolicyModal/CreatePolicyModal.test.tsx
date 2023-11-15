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
