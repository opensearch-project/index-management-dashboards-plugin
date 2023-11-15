/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { render, fireEvent } from "@testing-library/react";
import JSONModal from "./JSONModal";
import { DEFAULT_LEGACY_ERROR_NOTIFICATION } from "../../pages/VisualCreatePolicy/utils/constants";

describe("<JSONModal /> spec", () => {
  it("renders the component", () => {
    render(
      <JSONModal
        title="Some modal title"
        json={DEFAULT_LEGACY_ERROR_NOTIFICATION} // just some random json
        onClose={() => {}}
      />
    );
    // EuiOverlayMask appends an element to the body so we should have three (used to be two, after upgrading appears to have 3 now), an empty div from react-test-library
    // and our EuiOverlayMask element
    expect(document.body.children).toHaveLength(3);
    expect(document.body.children[2]).toMatchSnapshot();
  });

  it("calls close when close button clicked", () => {
    const onClose = jest.fn();
    const { getByTestId } = render(
      <JSONModal
        title="Some modal title"
        json={DEFAULT_LEGACY_ERROR_NOTIFICATION} // just some random json
        onClose={onClose}
      />
    );

    fireEvent.click(getByTestId("jsonModalCloseButton"));
    expect(onClose).toHaveBeenCalled();
  });
});
