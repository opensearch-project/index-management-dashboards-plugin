/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
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
