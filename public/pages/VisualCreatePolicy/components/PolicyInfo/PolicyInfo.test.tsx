/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { render } from "@testing-library/react";
import PolicyInfo from "./PolicyInfo";
import { fireEvent } from "@testing-library/dom";
import userEventModule from "@testing-library/user-event";

describe("<PolicyInfo /> spec", () => {
  const userEvent = userEventModule.setup();

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

  it("calls on change policy id when typing in input", async () => {
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
    await userEvent.type(getByTestId("create-policy-policy-id"), `some_policy_id`);
    expect(onChangePolicyId).toHaveBeenCalled();
  });

  it("calls on change description when typing in input", async () => {
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
    await userEvent.type(getByTestId("create-policy-description"), `some description`);
    expect(onChangeDescription).toHaveBeenCalled();
  });
});
