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
import { DeleteAction, UIAction } from "../../../../../models/interfaces";
import { makeId } from "../../../../utils/helpers";
import { ActionType } from "../../utils/constants";

export default class DeleteUIAction implements UIAction<DeleteAction> {
  id: string;
  action: DeleteAction;
  type = ActionType.Delete;

  constructor(action: DeleteAction, id: string = makeId()) {
    this.action = action;
    this.id = id;
  }

  content = () => `Delete`;

  clone = (action: DeleteAction) => new DeleteUIAction(action, this.id);

  isValid = () => true;

  render = (action: UIAction<DeleteAction>, onChangeAction: (action: UIAction<DeleteAction>) => void) => {
    return <div />;
  };

  toAction = () => this.action;
}
