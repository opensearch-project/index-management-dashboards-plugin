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
import { AllocationAction, UIAction } from "../../../../../models/interfaces";
import { ActionType } from "../../utils/constants";
import { makeId } from "../../../../utils/helpers";

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

  render = (action: UIAction<AllocationAction>, onChangeAction: (action: UIAction<AllocationAction>) => void) => {
    return <div />;
  };

  toAction = () => this.action;
}
