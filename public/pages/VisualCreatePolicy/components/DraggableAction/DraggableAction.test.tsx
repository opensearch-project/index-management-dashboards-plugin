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
import { EuiDragDropContext, EuiDroppable } from "@elastic/eui";
import DraggableAction from "./DraggableAction";
import { DEFAULT_ROLLOVER } from "../../utils/constants";
import { RolloverUIAction } from "../../utils/actions";
import { UIAction } from "../../../../../models/interfaces";
import { fireEvent } from "@testing-library/dom";

describe("<DraggableAction /> spec", () => {
  it("renders the component", () => {
    const action: UIAction<any> = new RolloverUIAction(DEFAULT_ROLLOVER);
    const { container } = render(
      <EuiDragDropContext onDragEnd={() => {}}>
        <EuiDroppable droppableId="STATE_ACTIONS_DROPPABLE_AREA">
          <DraggableAction action={action} idx={0} isLast={true} onClickDeleteAction={() => {}} onClickEditAction={() => {}} />
        </EuiDroppable>
      </EuiDragDropContext>
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it("calls onclickdeleteaction when clicking delete button", () => {
    const action: UIAction<any> = new RolloverUIAction(DEFAULT_ROLLOVER);
    const onClickDeleteAction = jest.fn();
    const { getByTestId } = render(
      <EuiDragDropContext onDragEnd={() => {}}>
        <EuiDroppable droppableId="STATE_ACTIONS_DROPPABLE_AREA">
          <DraggableAction action={action} idx={0} isLast={true} onClickDeleteAction={onClickDeleteAction} onClickEditAction={() => {}} />
        </EuiDroppable>
      </EuiDragDropContext>
    );

    fireEvent.click(getByTestId("draggable-action-delete-button"));
    expect(onClickDeleteAction).toHaveBeenCalledTimes(1);
  });

  it("calls onclickeditaction when clicking delete button", () => {
    const action: UIAction<any> = new RolloverUIAction(DEFAULT_ROLLOVER);
    const onClickEditAction = jest.fn();
    const { getByTestId } = render(
      <EuiDragDropContext onDragEnd={() => {}}>
        <EuiDroppable droppableId="STATE_ACTIONS_DROPPABLE_AREA">
          <DraggableAction action={action} idx={0} isLast={true} onClickDeleteAction={() => {}} onClickEditAction={onClickEditAction} />
        </EuiDroppable>
      </EuiDragDropContext>
    );

    fireEvent.click(getByTestId("draggable-action-edit-button"));
    expect(onClickEditAction).toHaveBeenCalledTimes(1);
  });
});
