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

  isValid = () => {
    try {
      JSON.parse(this.getActionJsonString(this.action));
      return true;
    } catch (err) {
      return false;
    }
  };

  getActionJsonString = (action: AllocationAction) => {
    const allocation = action.allocation;
    return allocation.hasOwnProperty("jsonString") ? allocation.jsonString : JSON.stringify(allocation, null, 4);
  };

  getActionJson = (action: AllocationAction) => {
    const allocation = action.allocation;
    return allocation.hasOwnProperty("jsonString") ? JSON.parse(allocation.jsonString) : allocation;
  };

  render = (action: UIAction<AllocationAction>, onChangeAction: (action: UIAction<AllocationAction>) => void) => {
    return (
      <EuiFormRow fullWidth isInvalid={!this.isValid()} error={null} style={{ maxWidth: "100%" }}>
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

  toAction = () => ({
    ...this.action,
    allocation: this.getActionJson(this.action),
  });
}
