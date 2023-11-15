/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { render } from "@testing-library/react";
import Transitions from "./Transitions";
import { UITransition } from "../../../../../models/interfaces";

describe("<Transitions /> spec", () => {
  it("renders the component", () => {
    const transitions: UITransition[] = [
      { id: "some_id_1", transition: { state_name: "some_state", conditions: { min_index_age: "30d" } } },
      { id: "some_id_2", transition: { state_name: "some_state", conditions: { min_size: "50gb" } } },
    ];
    const { container } = render(
      <Transitions
        transitions={transitions}
        onClickDeleteTransition={() => {}}
        onClickEditTransition={() => {}}
        onDragEndTransitions={() => {}}
        onClickAddTransition={() => {}}
      />
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
