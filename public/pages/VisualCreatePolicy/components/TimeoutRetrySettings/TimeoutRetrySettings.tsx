/*
 *   Copyright OpenSearch Contributors
 *
 *   Licensed under the Apache License, Version 2.0 (the "License").
 *   You may not use this file except in compliance with the License.
 *   A copy of the License is located at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   or in the "license" file accompanying this file. This file is distributed
 *   on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 *   express or implied. See the License for the specific language governing
 *   permissions and limitations under the License.
 */

import React, { ChangeEvent } from "react";
import { EuiAccordion, EuiText, EuiFlexGroup, EuiFlexItem, EuiFormRow, EuiFieldNumber, EuiFieldText, EuiSelect } from "@elastic/eui";
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
        <EuiFormRow fullWidth isInvalid={false} error={null}>
          <EuiFlexGroup>
            <EuiFlexItem>
              <EuiFieldText
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
        </EuiFormRow>
      </EuiFlexItem>
      <EuiFlexItem>
        <EuiFormCustomLabel
          title="Retry count"
          helpText="The number of times the action should be retried if it fails. Must be greater than 0."
        />
        <EuiFormRow fullWidth isInvalid={false} error={null}>
          <EuiFlexGroup>
            <EuiFlexItem>
              <EuiFieldNumber
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
        </EuiFormRow>
      </EuiFlexItem>
      <EuiFlexItem>
        <EuiFormCustomLabel title="Retry backoff" helpText="The backoff policy type to use when retrying." />
        <EuiFormRow fullWidth isInvalid={false} error={null}>
          <EuiSelect
            id="retry-backoff-type"
            fullWidth
            options={options}
            value={action.action.retry?.backoff || ""}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => {
              const backoff = e.target.value;
              onChangeAction(action.clone({ ...action.action, retry: { ...action.action.retry, backoff } }));
            }}
          />
        </EuiFormRow>
      </EuiFlexItem>
      <EuiFlexItem>
        <EuiFormCustomLabel title="Retry delay" helpText={`The time to wait between retries. Accepts time units, e.g. "2h" or "1d"`} />
        <EuiFormRow fullWidth isInvalid={false} error={null}>
          <EuiFlexGroup>
            <EuiFlexItem>
              <EuiFieldText
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
        </EuiFormRow>
      </EuiFlexItem>
    </EuiFlexGroup>
  </EuiAccordion>
);

export default TimeoutRetrySettings;
