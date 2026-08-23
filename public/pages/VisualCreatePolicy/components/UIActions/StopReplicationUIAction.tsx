/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { StopReplicationAction, UIAction } from "../../../../../models/interfaces";
import { makeId } from "../../../../utils/helpers";
import { ActionType } from "../../utils/constants";

export class StopReplicationUIAction implements UIAction<StopReplicationAction> {
  id: string;
  action: StopReplicationAction;
  type = ActionType.StopReplication;

  constructor(action: StopReplicationAction, id: string = makeId()) {
    this.action = action;
    this.id = id;
  }

  content = () => `Stop replication`;

  clone = (action: StopReplicationAction) => new StopReplicationUIAction(action, this.id);

  isValid = () => true;

  render = (action: UIAction<StopReplicationAction>, onChangeAction: (action: UIAction<StopReplicationAction>) => void) => {
    return <div />;
  };

  toAction = () => this.action;
}
