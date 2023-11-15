/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { CloseAction, UIAction } from "../../../../../models/interfaces";
import { makeId } from "../../../../utils/helpers";
import { ActionType } from "../../utils/constants";

export default class CloseUIAction implements UIAction<CloseAction> {
  id: string;
  action: CloseAction;
  type = ActionType.Close;

  constructor(action: CloseAction, id: string = makeId()) {
    this.action = action;
    this.id = id;
  }

  content = () => `Close`;

  clone = (action: CloseAction) => new CloseUIAction(action, this.id);

  isValid = () => true;

  render = (action: UIAction<CloseAction>, onChangeAction: (action: UIAction<CloseAction>) => void) => {
    return <div />;
  };

  toAction = () => this.action;
}
