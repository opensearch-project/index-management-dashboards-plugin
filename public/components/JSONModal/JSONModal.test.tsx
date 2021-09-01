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
    // EuiOverlayMask appends an element to the body so we should have two, an empty div from react-test-library
    // and our EuiOverlayMask element
    expect(document.body.children).toHaveLength(2);
    expect(document.body.children[1]).toMatchSnapshot();
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
