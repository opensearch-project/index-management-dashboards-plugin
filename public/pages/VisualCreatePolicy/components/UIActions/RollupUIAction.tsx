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
import { EuiFormRow, EuiCodeEditor } from "@elastic/eui";
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

  render = (action: UIAction<RollupAction>, onChangeAction: (action: UIAction<RollupAction>) => void) => {
    return (
      <EuiFormRow isInvalid={false} error={null} style={{ maxWidth: "100%" }}>
        <DarkModeConsumer>
          {(isDarkMode) => (
            <EuiCodeEditor
              mode="json"
              theme={isDarkMode ? "sense-dark" : "github"}
              width="100%"
              value={action.action.rollup.jsonString}
              onChange={(str) => {
                onChangeAction(
                  this.clone({
                    ...action,
                    rollup: { jsonString: str },
                  })
                );
              }}
              setOptions={{ fontSize: "14px" }}
              aria-label="Code Editor"
            />
          )}
        </DarkModeConsumer>
      </EuiFormRow>
    );
  };

  toAction = () => ({
    ...this.action,
    // TODO: validate this in UI before parsing here in case it failsZ
    rollup: { ism_rollup: JSON.parse(this.action.rollup.jsonString) },
  });
}
