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
import Actions from "./Actions";
import { UIAction } from "../../../../../models/interfaces";
import { CloseUIAction, RolloverUIAction } from "../../components/UIActions";
import { DEFAULT_CLOSE, DEFAULT_ROLLOVER } from "../../utils/constants";

describe("<Actions /> spec", () => {
  it("renders the component", () => {
    const actions: Array<UIAction<any>> = [
      new RolloverUIAction(DEFAULT_ROLLOVER, "some_id_1"),
      new CloseUIAction(DEFAULT_CLOSE, "some_id_2"),
    ];
    const { container } = render(
      <Actions
        actions={actions}
        onClickDeleteAction={() => {}}
        onClickEditAction={() => {}}
        onDragEndActions={() => {}}
        onClickAddAction={() => {}}
      />
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
