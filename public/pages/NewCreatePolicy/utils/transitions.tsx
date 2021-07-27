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
import { EuiText, EuiFormRow, htmlIdGenerator } from "@elastic/eui";
import { UITransition, Transition as TransitionData } from "../../../../models/interfaces";
import ConditionExpression from "../components/ConditionExpression";

const makeId = htmlIdGenerator();

export class Transition implements UITransition {
  id: string;
  transition: TransitionData;

  constructor(transition: TransitionData, id: string = makeId()) {
    this.transition = transition;
    this.id = id;
  }

  static content = (transition: TransitionData) => (
    <EuiText>
      <dl>
        <dt>Destination state</dt>
        <dd>{transition.state_name}</dd>
        <dt>Transition trigger logic</dt>
        <dd>{Transition.conditionContent(transition)}</dd>
      </dl>
    </EuiText>
  );

  private static conditionContent = (transition: TransitionData): string => {
    const {
      conditions: { min_doc_count: minDocCount, min_index_age: minIndexAge, min_size: minSize, cron: cron },
    } = transition;
    if (minSize != undefined) return `Minimum index size is ${minSize}`;
    if (minDocCount != undefined) return `Minimum index doc count is ${minDocCount}`;
    if (minIndexAge != undefined) return `Minimum index age is ${minIndexAge}`;
    if (cron != undefined) return `After cron expression ${cron.cron.expression} in ${cron.cron.timezone}`;
    return "No condition";
  };

  clone = (transition: TransitionData) => new Transition(transition, this.id);

  render = (transition: UITransition, onChangeTransition: (transition: UITransition) => void) => {
    return (
      <>
        <EuiFormRow
          label="Condition"
          helpText="Specify the condition needed to be met to transition to the destination state."
          isInvalid={false}
          error={null}
        >
          <ConditionExpression />
        </EuiFormRow>
      </>
    );
  };
}
