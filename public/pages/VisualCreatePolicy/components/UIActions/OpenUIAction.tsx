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
import { OpenAction, UIAction } from "../../../../../models/interfaces";
import { ActionType } from "../../utils/constants";
import { makeId } from "../../../../utils/helpers";

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

  render = (action: UIAction<OpenAction>, onChangeAction: (action: UIAction<OpenAction>) => void) => {
    return <div />;
  };

  toAction = () => this.action;
}
