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
