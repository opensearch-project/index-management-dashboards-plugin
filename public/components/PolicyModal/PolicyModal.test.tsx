/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { render, fireEvent } from "@testing-library/react";
import PolicyModal from "./PolicyModal";

describe("<PolicyModal /> spec", () => {
  it("renders the component", () => {
    render(
      <PolicyModal
        policyId={"some-id"}
        policy={{ policy: { name: "policy" } }} // replace with random policy w/ seed
        onClose={() => {}}
        onEdit={() => {}}
      />
    );
    // EuiOverlayMask appends an element to the body so we should have two, an empty div from react-test-library
    // and our EuiOverlayMask element
    expect(document.body.children).toHaveLength(2);
    expect(document.body.children[1]).toMatchSnapshot();
  });

  it("disables edit button", () => {
    const { getByTestId } = render(
      <PolicyModal
        policyId={""}
        policy={{ policy: { name: "policy" } }} // replace with random policy w/ seed
        onClose={() => {}}
        onEdit={() => {
          {
          }
        }}
      />
    );

    expect(getByTestId("policyModalEditButton")).toBeDisabled();
  });

  it("calls edit when edit button clicked", () => {
    const onEdit = jest.fn();
    const { getByTestId } = render(
      <PolicyModal
        policyId={"some-id"}
        policy={{ policy: { name: "policy" } }} // replace with random policy w/ seed
        onClose={() => {}}
        onEdit={onEdit}
      />
    );

    expect(getByTestId("policyModalEditButton")).toBeEnabled();
    fireEvent.click(getByTestId("policyModalEditButton"));
    expect(onEdit).toHaveBeenCalled();
  });

  it("calls close when close button clicked", () => {
    const onClose = jest.fn();
    const { getByTestId } = render(
      <PolicyModal
        policyId={"some-id"}
        policy={{ policy: { name: "policy" } }} // replace with random policy w/ seed
        onClose={onClose}
        onEdit={() => {}}
      />
    );

    fireEvent.click(getByTestId("policyModalCloseButton"));
    expect(onClose).toHaveBeenCalled();
  });
});
