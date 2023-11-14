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
import { screen, render } from "@testing-library/react";
import { fireEvent } from "@testing-library/dom";
import userEvent from "@testing-library/user-event/dist";
import DeleteModal from "./DeleteModal";

describe("<DeleteModal /> spec", () => {
  it("renders the component", () => {
    const { baseElement } = render(<DeleteModal policyId="some_id" closeDeleteModal={() => {}} onClickDelete={() => {}} />);
    expect(baseElement).toMatchSnapshot();
  });

  it("calls closeDeleteModal when cancel button is clicked", () => {
    const closeDeleteModal = jest.fn();
    const { getByTestId } = render(<DeleteModal policyId="some_id" closeDeleteModal={closeDeleteModal} onClickDelete={() => {}} />);

    userEvent.click(getByTestId("confirmModalCancelButton"));
    expect(closeDeleteModal).toHaveBeenCalled();
  });

  it("calls onClickDelete when delete button is clicked", () => {
    const onClickDelete = jest.fn();
    const { getByTestId } = render(<DeleteModal policyId="some_id" closeDeleteModal={() => {}} onClickDelete={onClickDelete} />);

    fireEvent.focus(getByTestId("deleteTextField"));
    userEvent.type(getByTestId("deleteTextField"), `delete`);
    userEvent.click(getByTestId("confirmModalConfirmButton"));

    expect(onClickDelete).toHaveBeenCalled();
  });
});
