/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { render } from "@testing-library/react";
import Transition from "./Transition";

describe("<Transition /> spec", () => {
  it("renders the component", () => {
    const { container } = render(
      <Transition
        uiTransition={{ id: "123", transition: { state_name: "some_state", conditions: { min_index_age: "30d" } } }}
        onChangeTransition={() => {}}
      />
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
