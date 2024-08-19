/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ChangeEvent } from "react";
import { EuiLink, EuiIcon, EuiFormRow, EuiSelect, EuiSpacer, EuiFieldText, EuiFieldNumber } from "@elastic/eui";
import moment from "moment-timezone";
import EuiFormCustomLabel from "../EuiFormCustomLabel";
import { UITransition } from "../../../../../models/interfaces";
import { TRANSITION_DOCUMENTATION_URL } from "../../../../utils/constants";

const timezones = moment.tz.names().map((tz) => ({ label: tz, text: tz }));

const conditionTypeOptions = [
  { value: "none", text: "No condition" },
  { value: "min_index_age", text: "Minimum index age" },
  { value: "min_doc_count", text: "Minimum doc count" },
  { value: "min_size", text: "Minimum size" },
  { value: "min_rollover_age", text: "Minimum rollover age" },
  { value: "cron", text: "Cron expression" },
];

interface TransitionProps {
  uiTransition: UITransition;
  onChangeTransition: (transition: UITransition) => void;
  useNewUx?: boolean;
}

const Transition = ({ uiTransition, onChangeTransition, useNewUx }: TransitionProps) => {
  // We currently only support one transition condition
  const conditionType = Object.keys(uiTransition.transition.conditions || []).pop() || "none";
  const conditions = uiTransition.transition.conditions;
  return (
    <>
      <EuiFormCustomLabel title="Condition" helpText="Specify the condition needed to be met to transition to the destination state." />
      <EuiFormRow fullWidth isInvalid={false} error={null}>
        <EuiSelect
          compressed={useNewUx}
          fullWidth
          id="condition-type"
          options={conditionTypeOptions}
          value={conditionType}
          style={{ textTransform: "capitalize" }}
          onChange={(e) => {
            const selectedConditionType = e.target.value;
            const transition = { ...uiTransition.transition };
            if (selectedConditionType === "none") delete transition.conditions;
            if (selectedConditionType === "min_index_age") transition.conditions = { min_index_age: "30d" };
            if (selectedConditionType === "min_doc_count") transition.conditions = { min_doc_count: 1000000 };
            if (selectedConditionType === "min_size") transition.conditions = { min_size: "50gb" };
            if (selectedConditionType === "min_rollover_age") transition.conditions = { min_rollover_age: "7d" };
            if (selectedConditionType === "cron")
              transition.conditions = { cron: { cron: { expression: "* 17 * * SAT", timezone: "America/Los_Angeles" } } };
            onChangeTransition({
              ...uiTransition,
              transition,
            });
          }}
          data-test-subj="create-state-action-type"
        />
      </EuiFormRow>

      <EuiSpacer />

      {conditionType === "min_index_age" && (
        <>
          <EuiFormCustomLabel title="Minimum index age" helpText="The minimum age required to transition to the next state." />
          <EuiFormRow fullWidth isInvalid={false} error={null}>
            <EuiFieldText
              fullWidth
              value={conditions?.min_index_age}
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
          <EuiFormRow fullWidth isInvalid={false} error={null}>
            <EuiFieldNumber
              fullWidth
              value={typeof conditions?.min_doc_count === "undefined" ? "" : conditions?.min_doc_count}
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
          <EuiFormRow fullWidth isInvalid={false} error={null}>
            <EuiFieldText
              fullWidth
              value={conditions?.min_size}
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

      {conditionType === "min_rollover_age" && (
        <>
          <EuiFormCustomLabel
            title="Minimum rollover age"
            helpText="The minimum age after a rollover has occurred that is required to transition to the next state."
          />
          <EuiFormRow fullWidth isInvalid={false} error={null}>
            <EuiFieldText
              fullWidth
              value={conditions?.min_rollover_age}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                const minRolloverAge = e.target.value;
                onChangeTransition({
                  ...uiTransition,
                  transition: {
                    ...uiTransition.transition,
                    conditions: {
                      min_rollover_age: minRolloverAge,
                    },
                  },
                });
              }}
              data-test-subj="transition-render-conditions-min-rollover-age"
            />
          </EuiFormRow>
        </>
      )}

      {conditionType === "cron" && (
        <>
          <EuiFormCustomLabel
            title="Cron expression"
            helpText="The matching cron expression required to transition to the next state."
            learnMore={
              <EuiLink href={TRANSITION_DOCUMENTATION_URL} target="_blank" rel="noopener noreferrer">
                Learn more
              </EuiLink>
            }
          />
          <EuiFormRow fullWidth isInvalid={false} error={null}>
            <EuiFieldText
              fullWidth
              value={conditions?.cron?.cron.expression}
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
          <EuiFormRow fullWidth isInvalid={false} error={null}>
            <EuiSelect
              fullWidth
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
