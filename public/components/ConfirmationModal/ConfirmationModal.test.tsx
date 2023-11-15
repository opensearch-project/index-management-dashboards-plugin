/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { render, fireEvent } from "@testing-library/react";
import ConfirmationModal from "./ConfirmationModal";

describe("<ConfirmationModal /> spec", () => {
  it("renders the component", () => {
    render(
      <ConfirmationModal
        title="some title"
        bodyMessage="some body message"
        actionMessage="some action message"
        onClose={() => {}}
        onAction={() => {}}
      />
    );
    // EuiOverlayMask appends an element to the body so we should have three (used to be two, after upgrading appears to have 3 now), an empty div from react-test-library
    // and our EuiOverlayMask element
    expect(document.body.children).toHaveLength(3);
    expect(document.body.children[2]).toMatchSnapshot();
  });

  it("calls onAction when action button clicked", () => {
    const onAction = jest.fn();
    const { getByTestId } = render(
      <ConfirmationModal
        title="some title"
        bodyMessage="some body message"
        actionMessage="some action message"
        onClose={() => {}}
        onAction={onAction}
      />
    );

    fireEvent.click(getByTestId("confirmationModalActionButton"));
    expect(onAction).toHaveBeenCalled();
  });

  it("calls close when close button clicked", () => {
    const onClose = jest.fn();
    const { getByTestId } = render(
      <ConfirmationModal
        title="some title"
        bodyMessage="some body message"
        actionMessage="some action message"
        onClose={onClose}
        onAction={() => {}}
      />
    );

    fireEvent.click(getByTestId("confirmationModalCloseButton"));
    expect(onClose).toHaveBeenCalled();
  });
});
