/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { screen, render } from "@testing-library/react";
import DeleteModal from "./DeleteModal";
import { fireEvent } from "@testing-library/dom";
import userEvent from "@testing-library/user-event/dist";

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
