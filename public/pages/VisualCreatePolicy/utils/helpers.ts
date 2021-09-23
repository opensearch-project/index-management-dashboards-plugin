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

import { UIAction, Action, Transition, ISMTemplate, State } from "../../../../models/interfaces";
import {
  ActionType,
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
import {
  AllocationUIAction,
  CloseUIAction,
  DeleteUIAction,
  ForceMergeUIAction,
  IndexPriorityUIAction,
  NotificationUIAction,
  OpenUIAction,
  ReadOnlyUIAction,
  ReadWriteUIAction,
  ReplicaCountUIAction,
  RolloverUIAction,
  RollupUIAction,
  SnapshotUIAction,
} from "../components/UIActions";

export const getConditionContent = (transition: Transition): string => {
  const {
    conditions: {
      min_doc_count: minDocCount = undefined,
      min_index_age: minIndexAge = undefined,
      min_size: minSize = undefined,
      cron = undefined,
    } = {},
  } = transition;
  if (minSize != undefined) return `Minimum index size is ${minSize}`;
  if (minDocCount != undefined) return `Minimum index doc count is ${minDocCount}`;
  if (minIndexAge != undefined) return `Minimum index age is ${minIndexAge}`;
  if (cron != undefined) return `After cron expression "${cron.cron.expression}" in ${cron.cron.timezone}`;
  return "No condition";
};

export const getUIActionFromData = (action: Action): UIAction<any> => {
  const actionType = Object.keys(action).pop();
  if (!actionType) throw new Error(`Failed to get action using type [${actionType}]`);
  const uiAction = getUIAction(actionType);
  return uiAction.clone(action);
};

export const getUIAction = (actionType: string): UIAction<any> => {
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
};

// Takes in the ismTemplates which could be a single object, array, or not defined and returns them reformatted as a list
export const convertTemplatesToArray = (ismTemplates: ISMTemplate[] | ISMTemplate | null | undefined): ISMTemplate[] => {
  const templates = [];
  // policy.ism_template can be an array of templates or a single template as an object or null
  if (Array.isArray(ismTemplates)) {
    templates.push(...ismTemplates);
  } else if (ismTemplates) {
    templates.push(ismTemplates);
  }
  return templates;
};

export const capitalizeFirstLetter = ([first, ...rest]: string, locale = navigator.language) =>
  first.toLocaleUpperCase(locale) + rest.join("");

export const getOrderInfo = (
  state: State | null,
  states: State[]
): { order: string; afterBeforeState: string; disableOrderSelections: boolean } => {
  const isEditing = !!state;
  const editingStateIdx = states.findIndex((s) => s === state);
  let afterBeforeState = "";
  let order = "after";
  let disableOrderSelections = false;
  if (isEditing) {
    // If there is only one existing state then we are editing the only state and there is nothing to order after/before
    if (states.length === 1) {
      disableOrderSelections = true;
    } else {
      // If the editing state is the first state then we are "Add before $secondState"
      if (editingStateIdx === 0) {
        afterBeforeState = states[editingStateIdx + 1]?.name;
        order = "before";
      } else {
        // otherwise we are "Add after $previousState"
        afterBeforeState = states[editingStateIdx - 1]?.name;
      }
    }
  } else {
    // when creating a new state
    // If there are no existing states then there is nothing to order after/before
    if (!states.length) {
      disableOrderSelections = true;
    } else {
      // Else always order it after the last state
      afterBeforeState = states[states.length - 1]?.name;
    }
  }

  return { order, afterBeforeState, disableOrderSelections };
};
