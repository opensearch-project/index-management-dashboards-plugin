/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { EuiButton, EuiEmptyPrompt, EuiText } from "@elastic/eui";
import { ROUTES } from "../../../../utils/constants";
import { ModalConsumer } from "../../../../components/Modal";
import CreatePolicyModal from "../../../../components/CreatePolicyModal";

export const TEXT = {
  RESET_FILTERS: "There are no policies matching your applied filters. Reset your filters to view your policies.",
  NO_POLICIES: "There are no existing policies. Create a policy to apply to your indices.",
  LOADING: "Loading policies...",
};

const getMessagePrompt = ({ filterIsApplied, loading }: PolicyEmptyPromptProps) => {
  if (loading) return TEXT.LOADING;
  if (filterIsApplied) return TEXT.RESET_FILTERS;
  return TEXT.NO_POLICIES;
};

const getActions: React.FC<PolicyEmptyPromptProps> = ({ history, filterIsApplied, loading, resetFilters }) => {
  if (loading) {
    return null;
  }
  if (filterIsApplied) {
    return (
      <EuiButton fill onClick={resetFilters} data-test-subj="policyEmptyPromptRestFilters">
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

interface PolicyEmptyPromptProps {
  filterIsApplied: boolean;
  loading: boolean;
  resetFilters: () => void;
  history: any;
}

const PolicyEmptyPrompt: React.FC<PolicyEmptyPromptProps> = (props) => (
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

export default PolicyEmptyPrompt;
