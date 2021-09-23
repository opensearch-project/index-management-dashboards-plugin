/*
 * SPDX-License-Identifier: Apache-2.0
 *
 * The OpenSearch Contributors require contributions made to
 * this file be licensed under the Apache-2.0 license or a
 * compatible open source license.
 *
 * Modifications Copyright OpenSearch Contributors. See
 * GitHub history for details.
 */

import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { render, fireEvent } from "@testing-library/react";
import CreatePolicyModal from "./CreatePolicyModal";
import { historyMock } from "../../../test/mocks";

describe("<CreatePolicyModal /> spec", () => {
  it("renders the component", () => {
    render(<CreatePolicyModal isEdit={false} history={historyMock} onClose={() => {}} onClickContinue={() => {}} />);
    // EuiOverlayMask appends an element to the body so we should have two, an empty div from react-test-library
    // and our EuiOverlayMask element
    expect(document.body.children).toHaveLength(2);
    expect(document.body.children[1]).toMatchSnapshot();
  });

  it("renders the component w/ edit", () => {
    render(<CreatePolicyModal isEdit={true} history={historyMock} onClose={() => {}} onClickContinue={() => {}} />);
    // EuiOverlayMask appends an element to the body so we should have two, an empty div from react-test-library
    // and our EuiOverlayMask element
    expect(document.body.children).toHaveLength(2);
    expect(document.body.children[1]).toMatchSnapshot();
  });

  it("calls onAction and onCLose when action button clicked", () => {
    const onContinue = jest.fn();
    const onClose = jest.fn();
    const { getByTestId } = render(
      <CreatePolicyModal isEdit={false} history={historyMock} onClose={onClose} onClickContinue={onContinue} />
    );

    fireEvent.click(getByTestId("createPolicyModalContinueButton"));
    expect(onContinue).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it("calls close when close button clicked", () => {
    const onClose = jest.fn();
    const { getByTestId } = render(<CreatePolicyModal isEdit={false} history={historyMock} onClose={onClose} onClickContinue={() => {}} />);

    fireEvent.click(getByTestId("createPolicyModalCancelButton"));
    expect(onClose).toHaveBeenCalled();
  });
});
