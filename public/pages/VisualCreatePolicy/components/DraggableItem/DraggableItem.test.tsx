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
import { EuiDragDropContext, EuiDroppable } from "@elastic/eui";
import { fireEvent } from "@testing-library/dom";
import DraggableItem from "./DraggableItem";
import { DEFAULT_ROLLOVER } from "../../utils/constants";
import { RolloverUIAction } from "../UIActions";
import { UIAction } from "../../../../../models/interfaces";

describe("<DraggableItem /> spec", () => {
  it("renders the component", () => {
    const action: UIAction<any> = new RolloverUIAction(DEFAULT_ROLLOVER);
    const content = action.content();
    const { container } = render(
      <EuiDragDropContext onDragEnd={() => {}}>
        <EuiDroppable droppableId="STATE_ACTIONS_DROPPABLE_AREA">
          <DraggableItem
            content={content}
            id={action.id}
            idx={0}
            isLast={true}
            onClickDelete={() => {}}
            onClickEdit={() => {}}
            draggableType="action"
          />
        </EuiDroppable>
      </EuiDragDropContext>
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it("calls onclickdeleteaction when clicking delete button", () => {
    const action: UIAction<any> = new RolloverUIAction(DEFAULT_ROLLOVER);
    const onClickDelete = jest.fn();
    const content = action.content();
    const { getByTestId } = render(
      <EuiDragDropContext onDragEnd={() => {}}>
        <EuiDroppable droppableId="STATE_ACTIONS_DROPPABLE_AREA">
          <DraggableItem
            content={content}
            id={action.id}
            idx={0}
            isLast={true}
            onClickDelete={onClickDelete}
            onClickEdit={() => {}}
            draggableType="action"
          />
        </EuiDroppable>
      </EuiDragDropContext>
    );

    fireEvent.click(getByTestId("draggable-item-delete-button-" + action.id));
    expect(onClickDelete).toHaveBeenCalledTimes(1);
  });

  it("calls onclickeditaction when clicking edit button", () => {
    const action: UIAction<any> = new RolloverUIAction(DEFAULT_ROLLOVER);
    const onClickEdit = jest.fn();
    const content = action.content();
    const { getByTestId } = render(
      <EuiDragDropContext onDragEnd={() => {}}>
        <EuiDroppable droppableId="STATE_ACTIONS_DROPPABLE_AREA">
          <DraggableItem
            content={content}
            id={action.id}
            idx={0}
            isLast={true}
            onClickDelete={() => {}}
            onClickEdit={onClickEdit}
            draggableType="action"
          />
        </EuiDroppable>
      </EuiDragDropContext>
    );

    fireEvent.click(getByTestId("draggable-item-edit-button-" + action.id));
    expect(onClickEdit).toHaveBeenCalledTimes(1);
  });
});
