/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import _ from "lodash";
import {
  EuiSpacer,
  EuiText,
  EuiCompressedRadioGroup,
  EuiCompressedFormRow,
  EuiCompressedSelect,
  EuiCompressedComboBox,
  EuiLink,
  EuiIcon,
  EuiPanel,
  EuiHorizontalRule,
} from "@elastic/eui";
import { ContentPanel } from "../../../../components/ContentPanel";
import { IndexService } from "../../../../services";
import { Radio } from "../../containers/ChangePolicy/ChangePolicy";
import { DocumentPolicy, Policy } from "../../../../../models/interfaces";
import { PolicyOption } from "../../models/interfaces";
import { getErrorMessage } from "../../../../utils/helpers";
import { DOCUMENTATION_URL } from "../../../../utils/constants";
import { CoreServicesContext } from "../../../../components/core_services";

interface NewPolicyProps {
  indexService: IndexService;
  selectedPolicies: PolicyOption[];
  stateRadioIdSelected: string;
  stateSelected: string;
  selectedPoliciesError: string;
  onChangePolicy: (selectedPolicies: PolicyOption[]) => void;
  onChangeStateRadio: (optionId: string) => void;
  onStateSelectChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

interface NewPolicyState {
  stateOptions: { value: string; text: string }[];
  policiesIsLoading: boolean;
  policies: PolicyOption[];
}

export default class NewPolicy extends React.Component<NewPolicyProps, NewPolicyState> {
  static contextType = CoreServicesContext;
  state = {
    stateOptions: [],
    policiesIsLoading: false,
    policies: [],
  };

  async componentDidMount(): Promise<void> {
    await this.onPolicySearchChange("");
  }

  onPolicySearchChange = async (searchValue: string): Promise<void> => {
    const { indexService } = this.props;
    this.setState({ policiesIsLoading: true, policies: [] });
    try {
      const searchPoliciesResponse = await indexService.searchPolicies(searchValue, true);
      if (searchPoliciesResponse.ok) {
        const policies = searchPoliciesResponse.response.policies.map((p: DocumentPolicy) => ({
          label: p.id,
          value: p.policy,
        }));
        this.setState({ policies });
      } else {
        if (searchPoliciesResponse.error.startsWith("[index_not_found_exception]")) {
          this.context.notifications.toasts.addDanger("You have not created a policy yet");
        } else {
          this.context.notifications.toasts.addDanger(searchPoliciesResponse.error);
        }
      }
    } catch (err) {
      this.context.notifications.toasts.addDanger(getErrorMessage(err, "There was a problem searching policies"));
    }

    this.setState({ policiesIsLoading: false });
  };

  render() {
    const { selectedPolicies, stateRadioIdSelected, stateSelected, selectedPoliciesError, useUpdatedUX } = this.props;
    const { policies, policiesIsLoading } = this.state;

    const hasSelectedPolicy = !!selectedPolicies.length;
    const stateOptions = _.flatten(
      selectedPolicies.map((selectedPolicy: PolicyOption) =>
        selectedPolicy.value.states.map((state) => ({ value: state.name, text: state.name }))
      )
    );

    const currentRadio = {
      id: Radio.Current,
      label: (
        <EuiText size="xs">
          <p>Keep indices in their current state after the policy takes effect</p>
        </EuiText>
      ),
    };
    const stateRadio = {
      id: Radio.State,
      label: (
        <EuiText size="xs">
          <p>Switch indices to the following state after the policy takes effect</p>
        </EuiText>
      ),
      disabled: !hasSelectedPolicy || !stateOptions.length,
    };
    const radioOptions = [currentRadio, stateRadio];
    return (
      <EuiPanel>
        <EuiText size="s">
          <h2>Choose new policy</h2>
        </EuiText>
        <EuiHorizontalRule margin="xs" />
        <div>
          <EuiText size="xs">
            <p>
              When the new policy will take effect depends on the current state of indices and the states of the new policy.{" "}
              <EuiLink href={DOCUMENTATION_URL} target="_blank" rel="noopener noreferrer">
                Learn more
              </EuiLink>
            </p>
          </EuiText>

          <EuiSpacer size="s" />

          <EuiCompressedFormRow
            label={
              <EuiText size="s">
                <h3>New policy</h3>
              </EuiText>
            }
            isInvalid={!!selectedPoliciesError}
            error={selectedPoliciesError}
          >
            <EuiCompressedComboBox
              placeholder=""
              async
              options={policies}
              isInvalid={!!selectedPoliciesError}
              singleSelection={{ asPlainText: true }}
              selectedOptions={selectedPolicies}
              isLoading={policiesIsLoading}
              // @ts-ignore
              onChange={this.props.onChangePolicy}
              onSearchChange={this.onPolicySearchChange}
            />
          </EuiCompressedFormRow>

          <EuiSpacer size="m" />

          <EuiCompressedRadioGroup options={radioOptions} idSelected={stateRadioIdSelected} onChange={this.props.onChangeStateRadio} />

          <EuiSpacer size="s" />

          <EuiCompressedFormRow>
            <EuiCompressedSelect
              disabled={stateRadioIdSelected !== Radio.State}
              options={stateOptions}
              value={stateSelected}
              onChange={this.props.onStateSelectChange}
              aria-label="Start state for new policy"
            />
          </EuiCompressedFormRow>
        </div>
      </EuiPanel>
    );
  }
}
