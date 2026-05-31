/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { render } from "@testing-library/react";
import CreateState from "./CreateState";
import { DEFAULT_POLICY } from "../../utils/constants";
import { Policy, State } from "../../../../../models/interfaces";

describe("<CreateState /> spec", () => {
  it("renders the component", () => {
    render(<CreateState policy={DEFAULT_POLICY} onSaveState={() => {}} onCloseFlyout={() => {}} state={null} />);
    expect(document.body.children[1]).toMatchSnapshot();
  });

  it("loads a state with a stop replication action", () => {
    const state: State = {
      name: "stop_replication",
      actions: [{ stop_replication: {} }],
      transitions: [],
    };
    const policy: Policy = {
      ...DEFAULT_POLICY,
      default_state: state.name,
      states: [state],
    };

    expect(() => render(<CreateState policy={policy} onSaveState={() => {}} onCloseFlyout={() => {}} state={state} />)).not.toThrow();
  });
});
