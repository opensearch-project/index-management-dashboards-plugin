/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { OpenAction, UIAction } from "../../../../../models/interfaces";
import { makeId } from "../../../../utils/helpers";
import { ActionType } from "../../utils/constants";

export default class OpenUIAction implements UIAction<OpenAction> {
  id: string;
  action: OpenAction;
  type = ActionType.Open;

  constructor(action: OpenAction, id: string = makeId()) {
    this.action = action;
    this.id = id;
  }

  content = () => `Open`;

  clone = (action: OpenAction) => new OpenUIAction(action, this.id);

  isValid = () => true;

  render = (action: UIAction<OpenAction>, onChangeAction: (action: UIAction<OpenAction>) => void) => {
    return <div />;
  };

  toAction = () => this.action;
}
