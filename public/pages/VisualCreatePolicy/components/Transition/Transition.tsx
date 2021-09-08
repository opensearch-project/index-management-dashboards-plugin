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
import { EuiFormRow, EuiSelect, EuiSpacer, EuiFieldText, EuiFieldNumber } from "@elastic/eui";
import moment from "moment-timezone";
import EuiFormCustomLabel from "../EuiFormCustomLabel";
import { UITransition } from "../../../../../models/interfaces";

const timezones = moment.tz.names().map((tz) => ({ label: tz, text: tz }));

const conditionTypeOptions = [
  { value: "none", text: "No condition" },
  { value: "min_index_age", text: "Minimum index age" },
  { value: "min_doc_count", text: "Minimum doc count" },
  { value: "min_size", text: "Minimum size" },
  { value: "cron", text: "Cron expression" },
];

interface TransitionProps {
  uiTransition: UITransition;
  onChangeTransition: (transition: UITransition) => void;
}

const Transition = ({ uiTransition, onChangeTransition }: TransitionProps) => {
  // We currently only support one transition condition
  const conditionType = Object.keys(uiTransition.transition?.conditions || []).pop() || "none";
  const conditions = uiTransition.transition.conditions;
  return (
    <>
      <EuiFormCustomLabel title="Condition" helpText="Specify the condition needed to be met to transition to the destination state." />
      <EuiFormRow isInvalid={false} error={null}>
        <EuiSelect
          id="condition-type"
          options={conditionTypeOptions}
          value={conditionType}
          style={{ textTransform: "capitalize" }}
          onChange={(e) => {
            const selectedConditionType = e.target.value;
            let condition = {};
            if (selectedConditionType === "min_index_age") condition = { min_index_age: "30d" };
            if (selectedConditionType === "min_doc_count") condition = { min_doc_count: 1000000 };
            if (selectedConditionType === "min_size") condition = { min_size: "50gb" };
            if (selectedConditionType === "cron")
              condition = { cron: { cron: { expression: "* 17 * * SAT", timezone: "America/Los_Angeles" } } };
            onChangeTransition({
              ...uiTransition,
              transition: {
                ...uiTransition.transition,
                conditions: condition,
              },
            });
          }}
          data-test-subj="create-state-action-type"
        />
      </EuiFormRow>

      <EuiSpacer />

      {conditionType === "min_index_age" && (
        <>
          <EuiFormCustomLabel title="Minimum index age" helpText="The minimum age required to transition to the next state." />
          <EuiFormRow isInvalid={false} error={null}>
            <EuiFieldText
              value={conditions?.min_index_age}
              style={{ textTransform: "capitalize" }}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                const minIndexAge = e.target.value;
                onChangeTransition({
                  ...uiTransition,
                  transition: {
                    ...uiTransition.transition,
                    conditions: {
                      min_index_age: minIndexAge,
                    },
                  },
                });
              }}
              data-test-subj="transition-render-conditions-min-index-age"
            />
          </EuiFormRow>
        </>
      )}

      {conditionType === "min_doc_count" && (
        <>
          <EuiFormCustomLabel
            title="Minimum doc count"
            helpText="The minimum number of documents required to transition to the next state."
          />
          <EuiFormRow isInvalid={false} error={null}>
            <EuiFieldNumber
              value={typeof conditions?.min_doc_count === "undefined" ? "" : conditions?.min_doc_count}
              style={{ textTransform: "capitalize" }}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                const minDocCount = e.target.valueAsNumber;
                const conditions = { min_doc_count: minDocCount };
                // TODO: clean this up..
                // set it to undefined instead of deleting... as we use the presence of the key itself for the type of transition
                if (isNaN(minDocCount)) conditions.min_doc_count = undefined;
                onChangeTransition({
                  ...uiTransition,
                  transition: {
                    ...uiTransition.transition,
                    conditions,
                  },
                });
              }}
              data-test-subj="transition-render-conditions-min-doc-count"
            />
          </EuiFormRow>
        </>
      )}

      {conditionType === "min_size" && (
        <>
          <EuiFormCustomLabel
            title="Minimum index size"
            helpText="The minimum size of the total primary shard storage required to transition to the next state."
          />
          <EuiFormRow isInvalid={false} error={null}>
            <EuiFieldText
              value={conditions?.min_size}
              style={{ textTransform: "capitalize" }}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                const minSize = e.target.value;
                onChangeTransition({
                  ...uiTransition,
                  transition: {
                    ...uiTransition.transition,
                    conditions: {
                      min_size: minSize,
                    },
                  },
                });
              }}
              data-test-subj="transition-render-conditions-min-size"
            />
          </EuiFormRow>
        </>
      )}

      {conditionType === "cron" && (
        <>
          <EuiFormCustomLabel title="Cron expression" helpText="The matching cron expression required to transition to the next state." />
          <EuiFormRow isInvalid={false} error={null}>
            <EuiFieldText
              value={conditions?.cron?.cron.expression}
              style={{ textTransform: "capitalize" }}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                const expression = e.target.value;
                onChangeTransition({
                  ...uiTransition,
                  transition: {
                    ...uiTransition.transition,
                    conditions: {
                      cron: {
                        cron: {
                          expression,
                          timezone: uiTransition.transition.conditions?.cron?.cron.timezone || "",
                        },
                      },
                    },
                  },
                });
              }}
              data-test-subj="transition-render-conditions-min-size"
            />
          </EuiFormRow>

          <EuiSpacer />

          <EuiFormCustomLabel title="Timezone" helpText="A day starts from 00:00:00 in the specified timezone." />
          <EuiFormRow isInvalid={false} error={null}>
            <EuiSelect
              id="timezone"
              options={timezones}
              value={conditions?.cron?.cron.timezone}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                const timezone = e.target.value;
                onChangeTransition({
                  ...uiTransition,
                  transition: {
                    ...uiTransition.transition,
                    conditions: {
                      cron: {
                        cron: {
                          expression: uiTransition.transition.conditions?.cron?.cron.expression || "",
                          timezone,
                        },
                      },
                    },
                  },
                });
              }}
            />
          </EuiFormRow>
        </>
      )}
    </>
  );
};

export default Transition;
