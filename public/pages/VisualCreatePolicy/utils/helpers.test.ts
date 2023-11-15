/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { actionRepoSingleton, capitalizeFirstLetter, convertTemplatesToArray, getOrderInfo, getUpdatedPolicy } from "./helpers";
import { Action, ISMTemplate, UIAction } from "../../../../models/interfaces";
import { makeId } from "../../../utils/helpers";
import { DEFAULT_POLICY } from "./constants";

test("converts all ism template formats into a list of ism templates", () => {
  expect(convertTemplatesToArray(null)).toEqual([]);
  expect(convertTemplatesToArray(undefined)).toEqual([]);
  const template: ISMTemplate = { index_patterns: ["*"], priority: 1 };
  expect(convertTemplatesToArray(template)).toEqual([template]);
  const templates = [template, { index_patterns: ["log*"], priority: 50 }];
  expect(convertTemplatesToArray(templates)).toEqual(templates);
});

test("capitalizes first letter of string", () => {
  expect(capitalizeFirstLetter("some string")).toBe("Some string");
});

test("getOrderInfo returns correct order info", () => {
  const state = { name: "some_name" };
  const state2 = { name: "some_name2" };
  const state3 = { name: "some_name3" };
  expect(getOrderInfo(state, [state]).disableOrderSelections).toBe(true);
  expect(getOrderInfo(state, [state]).order).toBe("after");
  expect(getOrderInfo(state, [state]).afterBeforeState).toBe("");
  expect(getOrderInfo(state, [state, state2]).disableOrderSelections).toBe(false);

  expect(getOrderInfo(state, [state, state2, state3]).disableOrderSelections).toBe(false);
  expect(getOrderInfo(state, [state, state2, state3]).order).toBe("before");
  expect(getOrderInfo(state, [state, state2, state3]).afterBeforeState).toBe(state2.name);

  expect(getOrderInfo(state2, [state, state2, state3]).order).toBe("after");
  expect(getOrderInfo(state2, [state, state2, state3]).afterBeforeState).toBe(state.name);

  expect(getOrderInfo(null, []).disableOrderSelections).toBe(true);
  expect(getOrderInfo(null, []).afterBeforeState).toBe("");

  expect(getOrderInfo(null, [state]).disableOrderSelections).toBe(false);
  expect(getOrderInfo(null, [state]).order).toBe("after");
  expect(getOrderInfo(null, [state]).afterBeforeState).toBe(state.name);
});

interface DummyAction extends Action {
  dummy: {};
}

const DEFAULT_DUMMY: DummyAction = {
  dummy: {},
};

class DummyUIAction implements UIAction<DummyAction> {
  id: string;
  action: DummyAction;
  type = "dummy";

  constructor(action: DummyAction, id: string = makeId()) {
    this.action = action;
    this.id = id;
  }

  content = () => `Dummy content.`;

  clone = (action: DummyAction) => new DummyUIAction(action, this.id);

  render = (action: UIAction<DummyAction>, onChangeAction: (action: UIAction<DummyAction>) => void) => {
    return null;
  };

  toAction = () => this.action;
}

test("action repository usage", () => {
  expect(actionRepoSingleton.getAllActionTypes().length).toBe(15);
  actionRepoSingleton.registerAction("dummy", DummyUIAction, DEFAULT_DUMMY);
  expect(actionRepoSingleton.getAllActionTypes().length).toBe(16);
  expect(actionRepoSingleton.getUIAction("dummy") instanceof DummyUIAction).toBe(true);
  expect(actionRepoSingleton.getUIActionFromData(DEFAULT_DUMMY) instanceof DummyUIAction).toBe(true);
});

test("changing the default state name correctly updates default_state", () => {
  const policy = DEFAULT_POLICY;
  const updatedState = { ...policy.states[0], name: "new_hot" };
  const newPolicy = getUpdatedPolicy(policy, updatedState, policy.states[0], policy.states, "before", policy.states[1].name);
  expect(newPolicy.default_state).toBe("new_hot");
});
