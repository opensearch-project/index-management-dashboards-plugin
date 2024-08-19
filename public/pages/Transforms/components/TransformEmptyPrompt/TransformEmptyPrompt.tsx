/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { EuiButton, EuiEmptyPrompt, EuiText } from "@elastic/eui";
import { PLUGIN_NAME, ROUTES } from "../../../../utils/constants";
import { getUISettings } from "../../../../services/Services";

interface TransformEmptyPromptProps {
  filterIsApplied: boolean;
  loading: boolean;
  resetFilters: () => void;
}

export const TEXT = {
  RESET_FILTERS: "There are no transform jobs matching your applied filters. Reset your filters to view your transform jobs.",
  NO_TRANSFORMS: "Transform jobs help you create a materialized view on top of existing data.",
  LOADING: "Loading transform jobs...",
};

const getMessagePrompt = ({ filterIsApplied, loading }: TransformEmptyPromptProps) => {
  if (loading) return TEXT.LOADING;
  if (filterIsApplied) return TEXT.RESET_FILTERS;
  return TEXT.NO_TRANSFORMS;
};

const getActions: React.SFC<TransformEmptyPromptProps> = ({ filterIsApplied, loading, resetFilters, size }) => {
  if (loading) {
    return null;
  }

  const uiSettings = getUISettings();
  const useUpdatedUX = uiSettings.get("home:useNewHomePage");

  if (filterIsApplied) {
    return (
      <EuiButton size={useUpdatedUX ? "s" : undefined} fill onClick={resetFilters} data-test-subj="transformEmptyPromptRestFilters">
        Reset Filters
      </EuiButton>
    );
  }

  return (
    <EuiButton
      size={useUpdatedUX ? "s" : undefined}
      href={`${PLUGIN_NAME}#${ROUTES.CREATE_TRANSFORM}`}
      data-test-subj="emptyPromptCreateTransformButton"
    >
      Create transform
    </EuiButton>
  );
};

const TransformEmptyPrompt: React.SFC<TransformEmptyPromptProps> = (props) => (
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

export default TransformEmptyPrompt;
