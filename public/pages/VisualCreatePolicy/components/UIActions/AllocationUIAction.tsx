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
import { AllocationAction, UIAction } from "../../../../../models/interfaces";
import { makeId } from "../../../../utils/helpers";
import { ActionType } from "../../utils/constants";
import { DarkModeConsumer } from "../../../../components/DarkMode";

export default class AllocationUIAction implements UIAction<AllocationAction> {
  id: string;
  action: AllocationAction;
  type = ActionType.Allocation;

  constructor(action: AllocationAction, id: string = makeId()) {
    this.action = action;
    this.id = id;
  }

  content = () => `Allocation`;

  clone = (action: AllocationAction = this.action) => new AllocationUIAction(action, this.id);

  isValid = (action: UIAction<AllocationAction>) => {
    try {
      JSON.parse(this.getActionJsonString(action));
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  getActionJsonString = (action: UIAction<AllocationAction>) => {
    const allocation = action.action.allocation;
    return allocation.hasOwnProperty("jsonString") ? allocation.jsonString : JSON.stringify(allocation, null, 4);
  };

  render = (action: UIAction<AllocationAction>, onChangeAction: (action: UIAction<AllocationAction>) => void) => {
    return (
      <EuiFormRow isInvalid={false} error={null} style={{ maxWidth: "100%" }}>
        <DarkModeConsumer>
          {(isDarkMode) => (
            <EuiCodeEditor
              mode="json"
              theme={isDarkMode ? "sense-dark" : "github"}
              width="100%"
              value={this.getActionJsonString(action)}
              onChange={(str) => {
                onChangeAction(
                  this.clone({
                    ...action,
                    allocation: { jsonString: str },
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

  toAction = () => {
    const newAction = { ...this.action };
    const allocation = JSON.parse(newAction.allocation.jsonString);
    return { ...newAction, allocation };
  };
}
