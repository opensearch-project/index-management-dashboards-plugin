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
import { ReadWriteAction, UIAction } from "../../../../../models/interfaces";
import { makeId } from "../../../../utils/helpers";
import { ActionType } from "../../utils/constants";

export default class ReadWriteUIAction implements UIAction<ReadWriteAction> {
  id: string;
  action: ReadWriteAction;
  type = ActionType.ReadWrite;

  constructor(action: ReadWriteAction, id: string = makeId()) {
    this.action = action;
    this.id = id;
  }

  content = () => `Read write`;

  clone = (action: ReadWriteAction) => new ReadWriteUIAction(action, this.id);

  render = (action: UIAction<ReadWriteAction>, onChangeAction: (action: UIAction<ReadWriteAction>) => void) => {
    return <div />;
  };

  toAction = () => this.action;
}
