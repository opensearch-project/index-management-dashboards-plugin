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
import { render } from "@testing-library/react";
import PolicyInfo from "./PolicyInfo";
import { fireEvent } from "@testing-library/dom";
import userEvent from "@testing-library/user-event/dist";

describe("<PolicyInfo /> spec", () => {
  it("renders the component", () => {
    const { container } = render(
      <PolicyInfo
        isEdit={false}
        policyId="some_id"
        policyIdError=""
        description="some description"
        onChangePolicyId={() => {}}
        onChangeDescription={() => {}}
      />
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it("calls on change policy id when typing in input", () => {
    const onChangePolicyId = jest.fn();
    const { getByTestId } = render(
      <PolicyInfo
        isEdit={false}
        policyId="some_id"
        policyIdError=""
        description="some description"
        onChangePolicyId={onChangePolicyId}
        onChangeDescription={() => {}}
      />
    );

    fireEvent.focus(getByTestId("create-policy-policy-id"));
    userEvent.type(getByTestId("create-policy-policy-id"), `some_policy_id`);
    expect(onChangePolicyId).toHaveBeenCalled();
  });

  it("calls on change description when typing in input", () => {
    const onChangeDescription = jest.fn();
    const { getByTestId } = render(
      <PolicyInfo
        isEdit={false}
        policyId="some_id"
        policyIdError=""
        description="some description"
        onChangePolicyId={() => {}}
        onChangeDescription={onChangeDescription}
      />
    );

    fireEvent.focus(getByTestId("create-policy-description"));
    userEvent.type(getByTestId("create-policy-description"), `some description`);
    expect(onChangeDescription).toHaveBeenCalled();
  });
});
