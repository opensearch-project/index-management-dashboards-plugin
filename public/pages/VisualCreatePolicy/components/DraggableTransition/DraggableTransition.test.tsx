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
import DraggableTransition from "./DraggableTransition";
import { fireEvent } from "@testing-library/dom";
import { makeId } from "../../../../utils/helpers";

describe("<DraggableTransition /> spec", () => {
  it("renders the component", () => {
    const transition = { id: makeId(), transition: { state_name: "some_state" } };
    const { container } = render(
      <EuiDragDropContext onDragEnd={() => {}}>
        <EuiDroppable droppableId="STATE_ACTIONS_DROPPABLE_AREA">
          <DraggableTransition
            transition={transition}
            idx={0}
            isLast={true}
            onClickDeleteTransition={() => {}}
            onClickEditTransition={() => {}}
          />
        </EuiDroppable>
      </EuiDragDropContext>
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it("calls onclickdeleteaction when clicking delete button", () => {
    const transition = { id: makeId(), transition: { state_name: "some_state" } };
    const onClickDeleteTransition = jest.fn();
    const { getByTestId } = render(
      <EuiDragDropContext onDragEnd={() => {}}>
        <EuiDroppable droppableId="STATE_ACTIONS_DROPPABLE_AREA">
          <DraggableTransition
            transition={transition}
            idx={0}
            isLast={true}
            onClickDeleteTransition={onClickDeleteTransition}
            onClickEditTransition={() => {}}
          />
        </EuiDroppable>
      </EuiDragDropContext>
    );

    fireEvent.click(getByTestId("draggable-transition-delete-button"));
    expect(onClickDeleteTransition).toHaveBeenCalledTimes(1);
  });

  it("calls onclickeditaction when clicking edit button", () => {
    const transition = { id: makeId(), transition: { state_name: "some_state" } };
    const onClickEditTransition = jest.fn();
    const { getByTestId } = render(
      <EuiDragDropContext onDragEnd={() => {}}>
        <EuiDroppable droppableId="STATE_ACTIONS_DROPPABLE_AREA">
          <DraggableTransition
            transition={transition}
            idx={0}
            isLast={true}
            onClickDeleteTransition={() => {}}
            onClickEditTransition={onClickEditTransition}
          />
        </EuiDroppable>
      </EuiDragDropContext>
    );

    fireEvent.click(getByTestId("draggable-transition-edit-button"));
    expect(onClickEditTransition).toHaveBeenCalledTimes(1);
  });
});
