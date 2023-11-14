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

import React from "react";
import * as H from "history";
import { EuiButton, EuiEmptyPrompt, EuiText } from "@elastic/eui";
import { ModalConsumer } from "../../../../components/Modal";
import CreatePolicyModal from "../../../../components/CreatePolicyModal";
import { ROUTES } from "../../../../utils/constants";

export const TEXT = {
  RESET_FILTERS: "There are no managed indices matching your applied filters. Reset your filters to view your managed indices.",
  NO_MANAGED_INDICES: "There are no existing managed indices. Create a policy to add to an index.",
  LOADING: "Loading managed indices...",
};

const getMessagePrompt = ({ filterIsApplied, loading }: ManagedIndexEmptyPromptProps): string => {
  if (loading) return TEXT.LOADING;
  if (filterIsApplied) return TEXT.RESET_FILTERS;
  return TEXT.NO_MANAGED_INDICES;
};

const getActions: React.FC<ManagedIndexEmptyPromptProps> = ({ history, filterIsApplied, loading, resetFilters }) => {
  if (loading) return null;

  if (filterIsApplied) {
    return (
      <EuiButton fill onClick={resetFilters} data-test-subj="managedIndexEmptyPromptResetFilters">
        Reset Filters
      </EuiButton>
    );
  }

  const onClickCreate = (visual: boolean): void => {
    history.push(`${ROUTES.CREATE_POLICY}${visual ? "?type=visual" : ""}`);
  };

  return (
    <ModalConsumer>
      {({ onShow }) => (
        <EuiButton fill onClick={() => onShow(CreatePolicyModal, { history, onClickContinue: onClickCreate })}>
          Create policy
        </EuiButton>
      )}
    </ModalConsumer>
  );
};

interface ManagedIndexEmptyPromptProps {
  filterIsApplied: boolean;
  loading: boolean;
  resetFilters: () => void;
  history: H.History;
}

const ManagedIndexEmptyPrompt: React.FC<ManagedIndexEmptyPromptProps> = (props) => (
  <EuiEmptyPrompt
    style={{ maxWidth: "45em" }}
    body={
      <EuiText>
        <p>{getMessagePrompt(props)}</p>
      </EuiText>
    }
    actions={getActions(props)}
  />
);

export default ManagedIndexEmptyPrompt;
