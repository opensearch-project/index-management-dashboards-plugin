/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ChangeEvent } from "react";
import {
  EuiAccordion,
  EuiText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiCompressedFormRow,
  EuiCompressedFieldNumber,
  EuiCompressedFieldText,
  EuiCompressedSelect,
} from "@elastic/eui";
import "brace/theme/github";
import "brace/mode/json";
import { Action, UIAction } from "../../../../../models/interfaces";
import EuiFormCustomLabel from "../EuiFormCustomLabel";

interface TimeoutRetrySettingsProps {
  action: UIAction<Action>;
  editAction: boolean;
  onChangeAction: (action: UIAction<any>) => void;
}

const options = [
  { value: "exponential", text: "Exponential" },
  { value: "constant", text: "Constant" },
  { value: "linear", text: "Linear" },
];

const TimeoutRetrySettings = ({ action, editAction, onChangeAction }: TimeoutRetrySettingsProps) => (
  <EuiAccordion id="timeout-retry-settings" buttonContent="Timeout and retry settings">
    <EuiFlexGroup style={{ padding: "5px 28px" }} direction="column">
      <EuiFlexItem>
        <EuiText>
          <p>
            <span style={{ color: "grey", fontWeight: 200, fontSize: "15px" }}>
              Timeout and retry settings are supported to handle an action failure. You can specify parameters based on your need.
            </span>
          </p>
        </EuiText>
      </EuiFlexItem>
      <EuiFlexItem>
        <EuiFormCustomLabel title="Timeout" helpText={`The timeout period for the action. Accepts time units, e.g. "5h" or "1d".`} />
        <EuiCompressedFormRow fullWidth isInvalid={false} error={null}>
          <EuiFlexGroup>
            <EuiFlexItem>
              <EuiCompressedFieldText
                isInvalid={false}
                fullWidth
                value={action.action.timeout || ""}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  const timeout = e.target.value;
                  onChangeAction(action.clone({ ...action.action, timeout }));
                }}
              />
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiCompressedFormRow>
      </EuiFlexItem>
      <EuiFlexItem>
        <EuiFormCustomLabel
          title="Retry count"
          helpText="The number of times the action should be retried if it fails. Must be greater than 0."
        />
        <EuiCompressedFormRow fullWidth isInvalid={false} error={null}>
          <EuiFlexGroup>
            <EuiFlexItem>
              <EuiCompressedFieldNumber
                isInvalid={false}
                fullWidth
                min={0}
                value={typeof action.action.retry?.count === "undefined" ? "" : action.action.retry.count}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  const count = e.target.valueAsNumber;
                  const retry = { ...action.action.retry, count };
                  if (isNaN(count)) delete retry.count;
                  onChangeAction(action.clone({ ...action.action, retry }));
                }}
              />
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiCompressedFormRow>
      </EuiFlexItem>
      <EuiFlexItem>
        <EuiFormCustomLabel title="Retry backoff" helpText="The backoff policy type to use when retrying." />
        <EuiCompressedFormRow fullWidth isInvalid={false} error={null}>
          <EuiCompressedSelect
            id="retry-backoff-type"
            fullWidth
            options={options}
            value={action.action.retry?.backoff || ""}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => {
              const backoff = e.target.value;
              onChangeAction(action.clone({ ...action.action, retry: { ...action.action.retry, backoff } }));
            }}
          />
        </EuiCompressedFormRow>
      </EuiFlexItem>
      <EuiFlexItem>
        <EuiFormCustomLabel title="Retry delay" helpText={`The time to wait between retries. Accepts time units, e.g. "2h" or "1d"`} />
        <EuiCompressedFormRow fullWidth isInvalid={false} error={null}>
          <EuiFlexGroup>
            <EuiFlexItem>
              <EuiCompressedFieldText
                isInvalid={false}
                fullWidth
                value={action.action.retry?.delay || ""}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  const delay = e.target.value;
                  onChangeAction(action.clone({ ...action.action, retry: { ...action.action.retry, delay } }));
                }}
              />
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiCompressedFormRow>
      </EuiFlexItem>
    </EuiFlexGroup>
  </EuiAccordion>
);

export default TimeoutRetrySettings;
