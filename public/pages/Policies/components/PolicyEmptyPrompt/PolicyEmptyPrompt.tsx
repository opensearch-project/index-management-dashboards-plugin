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

/*
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * You may not use this file except in compliance with the License.
 * A copy of the License is located at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * or in the "license" file accompanying this file. This file is distributed
 * on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the License for the specific language governing
 * permissions and limitations under the License.
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

const getActions: React.SFC<PolicyEmptyPromptProps> = ({ history, filterIsApplied, loading, resetFilters }) => {
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

const PolicyEmptyPrompt: React.SFC<PolicyEmptyPromptProps> = (props) => (
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
