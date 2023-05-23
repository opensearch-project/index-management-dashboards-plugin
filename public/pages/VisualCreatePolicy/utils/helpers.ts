/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { UIAction, Action, Transition, ISMTemplate, State, Policy } from "../../../../models/interfaces";
import {
  ActionType,
  DEFAULT_ALIAS,
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
  DEFAULT_SHRINK,
  DEFAULT_SNAPSHOT,
} from "./constants";
import {
  AliasUIAction,
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
  ShrinkUIAction,
  SnapshotUIAction,
} from "../components/UIActions";

export const getConditionContent = (transition: Transition): string => {
  const {
    conditions: {
      min_doc_count: minDocCount = undefined,
      min_index_age: minIndexAge = undefined,
      min_size: minSize = undefined,
      min_rollover_age: minRolloverAge = undefined,
      cron = undefined,
    } = {},
  } = transition;
  if (minSize != undefined) return `Minimum index size is ${minSize}`;
  if (minDocCount != undefined) return `Minimum index doc count is ${minDocCount}`;
  if (minIndexAge != undefined) return `Minimum index age is ${minIndexAge}`;
  if (minRolloverAge != undefined) return `Minimum rollover age is ${minRolloverAge}`;
  if (cron != undefined) return `After cron expression "${cron.cron.expression}" in ${cron.cron.timezone}`;
  return "No condition";
};

export const getUIActionFromData = (action: Action): UIAction<any> => {
  const actionType = Object.keys(action)
    .filter((key) => key !== "timeout" && key !== "retry")
    .pop();
  if (!actionType) throw new Error(`Failed to get action using type [${actionType}]`);
  const uiAction = getUIAction(actionType);
  return uiAction.clone(action);
};

export const getUIAction = (actionType: string): UIAction<any> => {
  switch (actionType) {
    case ActionType.Alias:
      return new AliasUIAction(DEFAULT_ALIAS);
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
    case ActionType.Shrink:
      return new ShrinkUIAction(DEFAULT_SHRINK);
    case ActionType.Snapshot:
      return new SnapshotUIAction(DEFAULT_SNAPSHOT);
    default:
      throw new Error(`Action type [${actionType}] not supported`);
  }
};

class ActionRepository {
  repository: { [actionType: string]: [new (action: Action) => UIAction<any>, Action] } = {
    alias: [AliasUIAction, DEFAULT_ALIAS],
    allocation: [AllocationUIAction, DEFAULT_ALLOCATION],
    close: [CloseUIAction, DEFAULT_CLOSE],
    delete: [DeleteUIAction, DEFAULT_DELETE],
    force_merge: [ForceMergeUIAction, DEFAULT_FORCE_MERGE],
    index_priority: [IndexPriorityUIAction, DEFAULT_INDEX_PRIORITY],
    notification: [NotificationUIAction, DEFAULT_NOTIFICATION],
    open: [OpenUIAction, DEFAULT_OPEN],
    read_only: [ReadOnlyUIAction, DEFAULT_READ_ONLY],
    read_write: [ReadWriteUIAction, DEFAULT_READ_WRITE],
    replica_count: [ReplicaCountUIAction, DEFAULT_REPLICA_COUNT],
    rollover: [RolloverUIAction, DEFAULT_ROLLOVER],
    rollup: [RollupUIAction, DEFAULT_ROLLUP],
    shrink: [ShrinkUIAction, DEFAULT_SHRINK],
    snapshot: [SnapshotUIAction, DEFAULT_SNAPSHOT],
  };

  getAllActionTypes = () => {
    return Object.keys(this.repository);
  };

  registerAction = (actionType: string, uiActionCtor: new (action: Action) => UIAction<any>, defaultAction: Action) => {
    if (this.repository.hasOwnProperty(actionType)) {
      throw new Error(`Cannot register an action twice in the repository [type=${actionType}]`);
    }

    this.repository[actionType] = [uiActionCtor, defaultAction];
  };

  getUIActionFromData = (action: Action) => {
    const actionType = Object.keys(action)
      .filter((key) => key !== "timeout" && key !== "retry")
      .pop();
    if (!actionType) throw new Error(`Failed to get action using type [${actionType}]`);
    const uiAction = this.getUIAction(actionType);
    return uiAction.clone(action);
  };

  getUIAction = (actionType: string): UIAction<any> => {
    const uiAction = this.repository[actionType];
    if (!uiAction) throw new Error(`Action type [${actionType}] not supported`);
    return new uiAction[0](uiAction[1]);
  };
}

export const actionRepoSingleton = new ActionRepository();

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

export const getUpdatedStates = (
  state: State,
  editingState: State | null,
  states: State[],
  order: string,
  afterBeforeState: string
): State[] => {
  const someStates: State[] = [];
  const isEditing = !!editingState;
  if ((isEditing && states.length === 1) || (!isEditing && !states.length)) return [state];

  states.forEach((s, idx) => {
    if (s.name === afterBeforeState && order === "before") someStates.push(state);
    if (s.name !== editingState?.name) someStates.push(s);
    if (s.name === afterBeforeState && order === "after") someStates.push(state);
  });

  return someStates;
};

export const getUpdatedPolicy = (
  currentPolicy: Policy,
  updatedState: State,
  editingState: State | null,
  currentStates: State[],
  order: string,
  afterBeforeState: string
): Policy => {
  const updatedStates = getUpdatedStates(updatedState, editingState, currentStates, order, afterBeforeState);
  let defaultState = currentPolicy.default_state;
  // If there is 1 state, change it to this state
  if (updatedStates.length === 1) {
    defaultState = updatedStates[0].name;
  }
  // Change the default state if the state being edited was the default state
  if (editingState && editingState.name === defaultState) {
    // don't bother checking if the name itself changed, just set it regardless to the value from the new state
    defaultState = updatedState.name;
  }

  return {
    ...currentPolicy,
    states: updatedStates,
    default_state: defaultState,
  };
};
