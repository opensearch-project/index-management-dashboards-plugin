/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import * as H from "history";
import { EuiSmallButton, EuiEmptyPrompt, EuiText } from "@elastic/eui";
import { ModalConsumer } from "../../../../components/Modal";
import CreatePolicyModal from "../../../../components/CreatePolicyModal";
import { ROUTES } from "../../../../utils/constants";

export const TEXT = {
  RESET_FILTERS: "There are no managed indexes matching your applied filters. Reset your filters to view your managed indexes.",
  NO_MANAGED_INDICES: "There are no existing managed indexes. Create a policy to add to an index.",
  LOADING: "Loading managed indexes...",
};

const getMessagePrompt = ({ filterIsApplied, loading }: ManagedIndexEmptyPromptProps): string => {
  if (loading) return TEXT.LOADING;
  if (filterIsApplied) return TEXT.RESET_FILTERS;
  return TEXT.NO_MANAGED_INDICES;
};

const getActions: React.SFC<ManagedIndexEmptyPromptProps> = ({ history, filterIsApplied, loading, resetFilters }) => {
  if (loading) return null;

  if (filterIsApplied) {
    return (
      <EuiSmallButton fill onClick={resetFilters} data-test-subj="managedIndexEmptyPromptResetFilters">
        Reset Filters
      </EuiSmallButton>
    );
  }

  const onClickCreate = (visual: boolean): void => {
    history.push(`${ROUTES.CREATE_POLICY}${visual ? "?type=visual" : ""}`);
  };

  return (
    <ModalConsumer>
      {({ onShow }) => (
        <EuiSmallButton fill onClick={() => onShow(CreatePolicyModal, { history, onClickContinue: onClickCreate })}>
          Create policy
        </EuiSmallButton>
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

const ManagedIndexEmptyPrompt: React.SFC<ManagedIndexEmptyPromptProps> = (props) => (
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
