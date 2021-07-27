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

import React, { ChangeEvent } from "react";
import { EuiFormRow, EuiFieldNumber, htmlIdGenerator } from "@elastic/eui";
import {
  UIAction,
  ForceMergeAction,
  IndexPriorityAction,
  ReplicaCountAction,
  AllocationAction,
  CloseAction,
  DeleteAction,
  NotificationAction,
  OpenAction,
  ReadOnlyAction,
  ReadWriteAction,
  RolloverAction,
  RollupAction,
  SnapshotAction,
  Action,
} from "../../../../models/interfaces";
import {
  DEFAULT_ALLOCATION,
  DEFAULT_CLOSE,
  DEFAULT_DELETE,
  DEFAULT_FORCE_MERGE,
  DEFAULT_INDEX_PRIORITY,
  DEFAULT_NOTIFICATION,
  DEFAULT_OPEN,
  DEFAULT_READ_ONLY,
  DEFAULT_READ_WRITE,
  DEFAULT_REPLICA_COUNT,
  DEFAULT_ROLLOVER,
  DEFAULT_ROLLUP,
  DEFAULT_SNAPSHOT,
} from "./constants";
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

export class UIActionFactory {
  getUIActionFromData(action: Action): UIAction<any> {
    const actionType = Object.keys(action).pop();
    if (!actionType) throw new Error(`Failed to get action using type [${actionType}]`);
    const uiAction = this.getUIAction(actionType);
    return uiAction.clone(action);
  }

  getUIAction(actionType: string): UIAction<any> {
    switch (actionType) {
      case ActionType.Allocation:
        return new AllocationUIAction(DEFAULT_ALLOCATION);
      case ActionType.Close:
        return new CloseUIAction(DEFAULT_CLOSE);
      case ActionType.Delete:
        return new DeleteUIAction(DEFAULT_DELETE);
      case ActionType.ForceMerge:
        return new ForceMergeUIAction(DEFAULT_FORCE_MERGE);
      case ActionType.IndexPriority:
        return new IndexPriorityUIAction(DEFAULT_INDEX_PRIORITY);
      case ActionType.Notification:
        return new NotificationUIAction(DEFAULT_NOTIFICATION);
      case ActionType.Open:
        return new OpenUIAction(DEFAULT_OPEN);
      case ActionType.ReadOnly:
        return new ReadOnlyUIAction(DEFAULT_READ_ONLY);
      case ActionType.ReadWrite:
        return new ReadWriteUIAction(DEFAULT_READ_WRITE);
      case ActionType.ReplicaCount:
        return new ReplicaCountUIAction(DEFAULT_REPLICA_COUNT);
      case ActionType.Rollover:
        return new RolloverUIAction(DEFAULT_ROLLOVER);
      case ActionType.Rollup:
        return new RollupUIAction(DEFAULT_ROLLUP);
      case ActionType.Snapshot:
        return new SnapshotUIAction(DEFAULT_SNAPSHOT);
      default:
        throw new Error(`Action type [${actionType}] not supported`);
    }
  }
}

export class AllocationUIAction implements UIAction<AllocationAction> {
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
    return <div>Allocation action</div>;
  };
}

export class CloseUIAction implements UIAction<CloseAction> {
  id: string;
  action: CloseAction;
  type = ActionType.Close;

  constructor(action: CloseAction, id: string = makeId()) {
    this.action = action;
    this.id = id;
  }

  content = () => `Close`;

  clone = (action: CloseAction) => new CloseUIAction(action, this.id);

  render = (action: UIAction<CloseAction>, onChangeAction: (action: UIAction<CloseAction>) => void) => {
    return null;
  };
}

export class DeleteUIAction implements UIAction<DeleteAction> {
  id: string;
  action: DeleteAction;
  type = ActionType.Delete;

  constructor(action: DeleteAction, id: string = makeId()) {
    this.action = action;
    this.id = id;
  }

  content = () => `Delete`;

  clone = (action: DeleteAction) => new DeleteUIAction(action, this.id);

  render = (action: UIAction<DeleteAction>, onChangeAction: (action: UIAction<DeleteAction>) => void) => {
    return null;
  };
}

export class ForceMergeUIAction implements UIAction<ForceMergeAction> {
  id: string;
  action: ForceMergeAction;
  type = ActionType.ForceMerge;

  constructor(action: ForceMergeAction, id: string = makeId()) {
    this.action = action;
    this.id = id;
  }

  content = () => `Force merge to ${this.action.force_merge.max_num_segments} segments`;

  clone = (action: ForceMergeAction) => new ForceMergeUIAction(action, this.id);

  render = (action: UIAction<ForceMergeAction>, onChangeAction: (action: UIAction<ForceMergeAction>) => void) => {
    return (
      <EuiFormRow label="Max num segments" helpText="The number of segments to merge to." isInvalid={false} error={null}>
        <EuiFieldNumber
          value={(action.action as ForceMergeAction).force_merge.max_num_segments}
          style={{ textTransform: "capitalize" }}
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            const maxNumSegments = e.target.valueAsNumber;
            onChangeAction(
              this.clone({
                force_merge: {
                  max_num_segments: maxNumSegments,
                },
              })
            );
          }}
          data-test-subj="action-render-force-merge"
        />
      </EuiFormRow>
    );
  };
}

export class IndexPriorityUIAction implements UIAction<IndexPriorityAction> {
  id: string;
  action: IndexPriorityAction;
  type = ActionType.IndexPriority;

  constructor(action: IndexPriorityAction, id: string = makeId()) {
    this.action = action;
    this.id = id;
  }

  content = () => `Set index priority to ${this.action.index_priority.priority}`;

  clone = (action: IndexPriorityAction) => new IndexPriorityUIAction(action, this.id);

  render = (action: UIAction<IndexPriorityAction>, onChangeAction: (action: UIAction<IndexPriorityAction>) => void) => {
    return (
      <EuiFormRow label="Priority" helpText="Higher priority indices are recovered first when possible." isInvalid={false} error={null}>
        <EuiFieldNumber
          value={(action.action as IndexPriorityAction).index_priority.priority}
          style={{ textTransform: "capitalize" }}
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            const priority = e.target.valueAsNumber;
            onChangeAction(
              this.clone({
                index_priority: { priority },
              })
            );
          }}
          data-test-subj="action-render-index-priority"
        />
      </EuiFormRow>
    );
  };
}

export class NotificationUIAction implements UIAction<NotificationAction> {
  id: string;
  action: NotificationAction;
  type = ActionType.Notification;

  constructor(action: NotificationAction, id: string = makeId()) {
    this.action = action;
    this.id = id;
  }

  content = () => `Notification`;

  clone = (action: NotificationAction) => new NotificationUIAction(action, this.id);

  render = (action: UIAction<NotificationAction>, onChangeAction: (action: UIAction<NotificationAction>) => void) => {
    return <div>Notification action</div>;
  };
}

export class OpenUIAction implements UIAction<OpenAction> {
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
    return null;
  };
}

export class ReadOnlyUIAction implements UIAction<ReadOnlyAction> {
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
    return null;
  };
}

export class ReadWriteUIAction implements UIAction<ReadWriteAction> {
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
    return null;
  };
}

export class ReplicaCountUIAction implements UIAction<ReplicaCountAction> {
  id: string;
  action: ReplicaCountAction;
  type = ActionType.ReplicaCount;

  constructor(action: ReplicaCountAction, id: string = makeId()) {
    this.action = action;
    this.id = id;
  }

  content = () => `Set number of replicas to ${this.action.replica_count.number_of_replicas}`;

  clone = (action: ReplicaCountAction) => new ReplicaCountUIAction(action, this.id);

  render = (action: UIAction<ReplicaCountAction>, onChangeAction: (action: UIAction<ReplicaCountAction>) => void) => {
    return (
      <EuiFormRow label="Number of replicas" helpText="The number of replicas to set for the index." isInvalid={false} error={null}>
        <EuiFieldNumber
          value={(action.action as ReplicaCountAction).replica_count.number_of_replicas}
          style={{ textTransform: "capitalize" }}
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            const numberOfReplicas = e.target.valueAsNumber;
            onChangeAction(
              this.clone({
                replica_count: {
                  number_of_replicas: numberOfReplicas,
                },
              })
            );
          }}
          data-test-subj="action-render-replica-count"
        />
      </EuiFormRow>
    );
  };
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

  render = (action: UIAction<RolloverAction>, onChangeAction: (action: UIAction<RolloverAction>) => void) => {
    return <div>Rollover action</div>;
  };
}

export class RollupUIAction implements UIAction<RollupAction> {
  id: string;
  action: RollupAction;
  type = ActionType.Rollup;

  constructor(action: RollupAction, id: string = makeId()) {
    this.action = action;
    this.id = id;
  }

  content = () => `Rollup`;

  clone = (action: RollupAction) => new RollupUIAction(action, this.id);

  render = (action: UIAction<RollupAction>, onChangeAction: (action: UIAction<RollupAction>) => void) => {
    return <div>Rollup action</div>;
  };
}

export class SnapshotUIAction implements UIAction<SnapshotAction> {
  id: string;
  action: SnapshotAction;
  type = ActionType.Snapshot;

  constructor(action: SnapshotAction, id: string = makeId()) {
    this.action = action;
    this.id = id;
  }

  content = () => `Snapshot`;

  clone = (action: SnapshotAction) => new SnapshotUIAction(action, this.id);

  render = (action: UIAction<SnapshotAction>, onChangeAction: (action: UIAction<SnapshotAction>) => void) => {
    return <div>Snapshot action</div>;
  };
}

// export class ActionRepository {
//   repository: { [actionType: string]: typeof UIAction} = {
//     [ActionType.Allocation.toString()]: AllocationUIAction,
//     // [ActionType.Close]:CloseUIAction,
//     // [ActionType.Delete]: DeleteUIAction,
//     // [ActionType.ForceMerge]: ForceMergeUIAction,
//     // [ActionType.IndexPriority]: IndexPriorityUIAction,
//     // [ActionType.Notification]: NotificationUIAction,
//     // [ActionType.Open]: OpenUIAction,
//     // [ActionType.ReadOnly]: ReadOnlyUIAction,
//     // [ActionType.ReadWrite]: ReadWriteUIAction,
//     // [ActionType.ReplicaCount]: ReplicaCountUIAction,
//     // [ActionType.Rollover]: RolloverUIAction,
//     // [ActionType.Rollup]: RollupUIAction,
//     // [ActionType.Snapshot]: SnapshotUIAction
//   };
//
//   registerAction(actionType: string, action: UIAction): void {
//     if (this.repository.hasOwnProperty(actionType)) {
//       throw new Error(`Cannot register an action twice in the repository [type=${actionType}]`);
//     }
//
//     this.repository[actionType] = action
//
//   }
// }
