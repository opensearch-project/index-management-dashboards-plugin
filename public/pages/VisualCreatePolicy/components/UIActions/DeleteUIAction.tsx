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

  isValid = (action: UIAction<DeleteAction>) => true;

  render = (action: UIAction<DeleteAction>, onChangeAction: (action: UIAction<DeleteAction>) => void) => {
    return <div />;
  };

  toAction = () => this.action;
}
