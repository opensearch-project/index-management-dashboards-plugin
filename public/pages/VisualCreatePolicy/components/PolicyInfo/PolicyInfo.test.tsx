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

import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { render } from "@testing-library/react";
import { fireEvent } from "@testing-library/dom";
import userEvent from "@testing-library/user-event/dist";
import PolicyInfo from "./PolicyInfo";

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
