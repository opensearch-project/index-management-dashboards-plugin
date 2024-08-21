/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { EuiSmallButton, EuiEmptyPrompt, EuiText } from "@elastic/eui";

export const TEXT = {
  RESET_FILTERS: "There are no indices matching your applied filters. Reset your filters to view your indices.",
  NO_INDICES: "There are no existing indices. Create an index to view it here.",
  LOADING: "Loading indices...",
};

const getMessagePrompt = ({ filterIsApplied, loading }: IndexEmptyPromptProps): string => {
  if (loading) return TEXT.LOADING;
  if (filterIsApplied) return TEXT.RESET_FILTERS;
  return TEXT.NO_INDICES;
};

const getActions: React.SFC<IndexEmptyPromptProps> = ({ filterIsApplied, loading, resetFilters }) => {
  if (loading) {
    return null;
  }

  if (filterIsApplied) {
    return (
      <EuiSmallButton fill onClick={resetFilters} data-test-subj="indexEmptyPromptResetFilters">
        Reset Filters
      </EuiSmallButton>
    );
  }

  return null;
};

interface IndexEmptyPromptProps {
  filterIsApplied: boolean;
  loading: boolean;
  resetFilters: () => void;
}

const IndexEmptyPrompt: React.SFC<IndexEmptyPromptProps> = (props) => (
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

export default IndexEmptyPrompt;
