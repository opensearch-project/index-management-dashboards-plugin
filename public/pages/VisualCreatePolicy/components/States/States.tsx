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
import {
  EuiButton,
  EuiText,
  EuiHorizontalRule,
  EuiFlexGroup,
  EuiFlexItem,
  EuiSpacer,
  EuiLink,
  EuiIcon,
  EuiEmptyPrompt,
  EuiFormRow,
  EuiSelect,
} from "@elastic/eui";
import { ContentPanel } from "../../../../components/ContentPanel";
import "brace/theme/github";
import "brace/mode/json";
import { Policy, State as StateData } from "../../../../../models/interfaces";
import { STATES_DOCUMENTATION_URL } from "../../../../utils/constants";
import State from "./State";

interface StatesProps {
  onOpenFlyout: () => void;
  policy: Policy;
  onClickEditState: (state: StateData) => void;
  onClickDeleteState: (idx: number) => void;
  onChangeDefaultState: (event: ChangeEvent<HTMLSelectElement>) => void;
  isReadOnly: boolean;
}

const States = ({ onOpenFlyout, policy, onClickEditState, onClickDeleteState, onChangeDefaultState, isReadOnly = false }: StatesProps) => {
  return (
    <ContentPanel
      bodyStyles={{ padding: "initial" }}
      title={`States (${policy.states.length})`}
      titleSize="s"
      subTitleText={
        <EuiText color="subdued" size="s" style={{ padding: "5px 0px" }}>
          <p style={{ fontWeight: 200 }}>
            You can think of policies as state machines. &quot;Actions&quot; are the operations ISM performs when an index is in a certain
            state.
            <br />
            &quot;Transitions&quot; define when to move from one state to another.{" "}
            <EuiLink href={STATES_DOCUMENTATION_URL} target="_blank" rel="noopener noreferrer">
              Learn more
            </EuiLink>
          </p>
        </EuiText>
      }
    >
      <div style={{ padding: "0px 10px" }}>
        {!isReadOnly && (
          <>
            <EuiFormRow style={{ maxWidth: "300px", padding: "15px" }} isInvalid={false} error={null}>
              <EuiSelect
                compressed
                prepend="Initial state"
                options={policy.states.map((state) => ({ text: state.name, value: state.name }))}
                value={policy.default_state}
                onChange={onChangeDefaultState}
              />
            </EuiFormRow>
            <EuiSpacer size="s" />
            <EuiHorizontalRule margin="none" />
          </>
        )}

        <EuiFlexGroup gutterSize="none" direction="column">
          {policy.states.map((state, idx) => (
            <EuiFlexItem key={state.name}>
              <State
                idx={idx}
                state={state}
                isInitialState={state.name === policy.default_state}
                onClickEditState={onClickEditState}
                onClickDeleteState={onClickDeleteState}
                isReadOnly={isReadOnly}
              />
              <EuiHorizontalRule margin="none" />
            </EuiFlexItem>
          ))}
        </EuiFlexGroup>

        {!isReadOnly &&
          (!!policy.states.length ? (
            <>
              <EuiSpacer />
              <EuiButton onClick={onOpenFlyout} data-test-subj="states-add-state-button">
                Add state
              </EuiButton>
            </>
          ) : (
            <EuiEmptyPrompt
              title={<h2>No states</h2>}
              titleSize="s"
              body={<p>Your policy currently has no states defined. Add states to manage your index lifecycle.</p>}
              actions={
                <EuiButton color="primary" onClick={onOpenFlyout} data-test-subj="states-add-state-button">
                  Add state
                </EuiButton>
              }
            />
          ))}
      </div>
    </ContentPanel>
  );
};

export default States;
