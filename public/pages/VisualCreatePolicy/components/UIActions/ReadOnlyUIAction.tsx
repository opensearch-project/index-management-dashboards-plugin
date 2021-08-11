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
import { ReadOnlyAction, UIAction } from "../../../../../models/interfaces";
import { ActionType } from "../../utils/constants";
import { makeId } from "../../../../utils/helpers";

export default class ReadOnlyUIAction implements UIAction<ReadOnlyAction> {
  id: string;
  action: ReadOnlyAction;
  type = ActionType.ReadOnly;

  constructor(action: ReadOnlyAction, id: string = makeId()) {
    this.action = action;
    this.id = id;
  }

  content = () => `Read only`;

  clone = (action: ReadOnlyAction) => new ReadOnlyUIAction(action, this.id);

  render = (action: UIAction<ReadOnlyAction>, onChangeAction: (action: UIAction<ReadOnlyAction>) => void) => {
    return <div />;
  };

  toAction = () => this.action;
}
