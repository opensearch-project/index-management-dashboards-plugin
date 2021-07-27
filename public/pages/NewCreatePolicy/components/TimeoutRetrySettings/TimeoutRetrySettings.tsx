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
import { EuiAccordion, EuiText, EuiFlexGroup, EuiFlexItem, EuiFormRow, EuiFieldNumber, EuiFieldText, EuiSelect } from "@elastic/eui";
import "brace/theme/github";
import "brace/mode/json";
import { Action, UIAction } from "../../../../../models/interfaces";

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
              Default timeout and retry settings are supported to handle an action failure. You can specify parameters based on your need.
            </span>
          </p>
        </EuiText>
      </EuiFlexItem>
      <EuiFlexItem>
        <EuiFormRow
          fullWidth
          label={
            <EuiText>
              <h4>Timeout</h4>
            </EuiText>
          }
          isInvalid={false}
          error={null}
        >
          <EuiFlexGroup>
            <EuiFlexItem>
              <EuiFieldText
                fullWidth
                isInvalid={false}
                value={action.action.timeout}
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
        <EuiFormRow
          fullWidth
          label={
            <EuiText>
              <h4>Retry count</h4>
            </EuiText>
          }
          isInvalid={false}
          error={null}
        >
          <EuiFlexGroup>
            <EuiFlexItem>
              <EuiFieldNumber
                fullWidth
                isInvalid={false}
                min={0}
                // TODO: Will backend run retry object as null and then this throws an exception or does it always return retry: { count: 0, ... } etc?
                value={action.action.retry?.count}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  const count = e.target.valueAsNumber;
                  onChangeAction(action.clone({ ...action.action, retry: { ...action.action.retry, count } }));
                }}
              />
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFormRow>
      </EuiFlexItem>
      <EuiFlexItem>
        <EuiFormRow
          fullWidth
          label={
            <EuiText>
              <h4>Retry backoff</h4>
            </EuiText>
          }
          isInvalid={false}
          error={null}
        >
          <EuiSelect
            fullWidth
            id="retry-backoff-type"
            options={options}
            value={action.action.retry?.backoff}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => {
              const backoff = e.target.value;
              onChangeAction(action.clone({ ...action.action, retry: { ...action.action.retry, backoff } }));
            }}
            // aria-label="Use aria labels when no actual label is in use"
          />
        </EuiFormRow>
      </EuiFlexItem>
      <EuiFlexItem>
        <EuiFormRow
          fullWidth
          label={
            <EuiText>
              <h4>Retry delay</h4>
            </EuiText>
          }
          isInvalid={false}
          error={null}
        >
          <EuiFlexGroup>
            <EuiFlexItem>
              <EuiFieldText
                fullWidth
                isInvalid={false}
                value={action.action.retry?.delay}
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
