/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { EuiCompressedFormRow, EuiCodeEditor } from "@elastic/eui";
import { RollupAction, UIAction } from "../../../../../models/interfaces";
import { makeId } from "../../../../utils/helpers";
import { DarkModeConsumer } from "../../../../components/DarkMode";
import { ActionType } from "../../utils/constants";

export default class RollupUIAction implements UIAction<RollupAction> {
  id: string;
  action: RollupAction;
  type = ActionType.Rollup;

  constructor(action: RollupAction, id: string = makeId()) {
    this.action = action;
    this.id = id;
  }

  content = () => `Rollup`;

  clone = (action: RollupAction) => new RollupUIAction(action, this.id);

  isValid = () => {
    try {
      JSON.parse(this.getActionJsonString(this.action));
      return true;
    } catch (err) {
      return false;
    }
  };

  getActionJsonString = (action: RollupAction) => {
    const rollup = action.rollup;
    return rollup.hasOwnProperty("jsonString") ? rollup.jsonString : JSON.stringify(rollup, null, 4);
  };

  getActionJson = (action: RollupAction) => {
    const rollup = action.rollup;
    return rollup.hasOwnProperty("jsonString") ? JSON.parse(rollup.jsonString) : rollup;
  };

  render = (action: UIAction<RollupAction>, onChangeAction: (action: UIAction<RollupAction>) => void) => {
    // If we don't have a JSON string yet it just means we haven't converted the rollup to it yet
    return (
      <EuiCompressedFormRow fullWidth isInvalid={!this.isValid()} error={null} style={{ maxWidth: "100%" }}>
        <DarkModeConsumer>
          {(isDarkMode) => (
            <EuiCodeEditor
              mode="json"
              theme={isDarkMode ? "sense-dark" : "github"}
              width="100%"
              value={this.getActionJsonString(action.action)}
              onChange={(str) => {
                onChangeAction(
                  this.clone({
                    ...action.action,
                    rollup: { jsonString: str },
                  })
                );
              }}
              setOptions={{ fontSize: "14px" }}
              aria-label="Code Editor"
            />
          )}
        </DarkModeConsumer>
      </EuiCompressedFormRow>
    );
  };

  toAction = () => ({
    ...this.action,
    rollup: this.getActionJson(this.action),
  });
}
