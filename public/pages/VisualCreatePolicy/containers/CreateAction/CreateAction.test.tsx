/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { render } from "@testing-library/react";
import CreateAction from "./CreateAction";
import { RolloverUIAction } from "../../components/UIActions";
import { DEFAULT_ROLLOVER } from "../../utils/constants";
import { UIAction } from "../../../../../models/interfaces";

describe("<CreateAction /> spec", () => {
  it("renders the component", () => {
    const rolloverAction: UIAction<any> = new RolloverUIAction(DEFAULT_ROLLOVER, "some_id");
    const actions = [rolloverAction];
    const { container } = render(
      <CreateAction
        stateName="some_state"
        actions={actions}
        editAction={rolloverAction}
        onClickCancelAction={() => {}}
        onClickSaveAction={() => {}}
      />
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
