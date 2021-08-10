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

import { htmlIdGenerator } from "@elastic/eui";
import { RolloverAction, UIAction } from "../../../../models/interfaces";

const makeId = htmlIdGenerator();

export enum ActionType {
  Allocation = "allocation",
  Close = "close",
  Delete = "delete",
  ForceMerge = "force_merge",
  IndexPriority = "index_priority",
  Notification = "notification",
  Open = "open",
  ReadOnly = "read_only",
  ReadWrite = "read_write",
  ReplicaCount = "replica_count",
  Rollover = "rollover",
  Rollup = "rollup",
  Snapshot = "snapshot",
}

export class RolloverUIAction implements UIAction<RolloverAction> {
  id: string;
  action: RolloverAction;
  type = ActionType.Rollover;

  constructor(action: RolloverAction, id: string = makeId()) {
    this.action = action;
    this.id = id;
  }

  content = () => `Rollover`;

  clone = (action: RolloverAction) => new RolloverUIAction(action, this.id);

  render = () => null;

  toAction = () => this.action;
}
