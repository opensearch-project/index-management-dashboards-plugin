/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component, useContext } from "react";
import { RouteComponentProps } from "react-router-dom";
import { EuiSpacer, EuiTitle, EuiSmallButton, EuiFlexGroup, EuiFlexItem, EuiSmallButtonEmpty } from "@elastic/eui";
import { IndexService, ManagedIndexService } from "../../../../services";
import ChangeManagedIndices from "../../components/ChangeManagedIndices";
import NewPolicy from "../../components/NewPolicy";
import { BREADCRUMBS } from "../../../../utils/constants";
import { ManagedIndexItem } from "../../../../../models/interfaces";
import { getErrorMessage } from "../../../../utils/helpers";
import { PolicyOption } from "../../models/interfaces";
import { CoreServicesContext } from "../../../../components/core_services";
import { DataSourceMenuContext, DataSourceMenuProperties } from "../../../../services/DataSourceMenuContext";
import { useUpdateUrlWithDataSourceProperties } from "../../../../components/MDSEnabledComponent";

interface ChangePolicyProps extends RouteComponentProps, DataSourceMenuProperties {
  managedIndexService: ManagedIndexService;
  indexService: IndexService;
}

interface ChangePolicyState {
  selectedPolicies: PolicyOption[];
  selectedManagedIndices: { label: string; value?: ManagedIndexItem }[];
  selectedStateFilters: { label: string }[];
  stateSelected: string;
  stateRadioIdSelected: string;
  managedIndicesError: string;
  selectedPoliciesError: string;
  hasSubmitted: boolean;
}

export enum Radio {
  Current = "current",
  State = "state",
}

export class ChangePolicy extends Component<ChangePolicyProps, ChangePolicyState> {
  static contextType = CoreServicesContext;
  static emptyState = {
    selectedPolicies: [],
    selectedManagedIndices: [],
    selectedStateFilters: [],
    stateRadioIdSelected: Radio.Current,
    stateSelected: "",
    managedIndicesError: "",
    selectedPoliciesError: "",
    hasSubmitted: false,
  };
  state: ChangePolicyState = ChangePolicy.emptyState;

  async componentDidMount(): Promise<void> {
    this.context.chrome.setBreadcrumbs([BREADCRUMBS.INDEX_MANAGEMENT, BREADCRUMBS.MANAGED_INDICES, BREADCRUMBS.CHANGE_POLICY]);
  }

  componentDidUpdate(prevProps: ChangePolicyProps, prevState: Readonly<ChangePolicyState>) {
    if (prevProps.dataSourceId !== this.props.dataSourceId) {
      // reset the state, if dataSourceId changes, i.e., clear state
      this.setState({
        ...ChangePolicy.emptyState,
      });
    }
  }

  onChangeSelectedPolicy = (selectedPolicies: PolicyOption[]): void => {
    // reset the selected state and radio whenever we select a new policy
    const selectedPoliciesError = selectedPolicies.length ? "" : "Required";
    this.setState({ selectedPolicies, selectedPoliciesError, stateSelected: "", stateRadioIdSelected: Radio.Current });
  };

  onChangeManagedIndices = (selectedManagedIndices: { label: string; value?: ManagedIndexItem }[]): void => {
    const managedIndicesError = selectedManagedIndices.length ? "" : "Required";
    if (!selectedManagedIndices.length) {
      this.onChangeStateFilters([]);
    }
    this.setState({ selectedManagedIndices, managedIndicesError });
  };

  onChangeStateFilters = (selectedStateFilters: { label: string }[]): void => {
    this.setState({ selectedStateFilters });
  };

  onChangeStateRadio = (optionId: string): void => {
    this.setState({ stateRadioIdSelected: optionId });
  };

  onStateSelectChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    this.setState({ stateSelected: e.target.value });
  };

  onChangePolicy = async () => {
    try {
      const { managedIndexService } = this.props;
      const { selectedPolicies, selectedManagedIndices, selectedStateFilters, stateRadioIdSelected, stateSelected } = this.state;

      if (!selectedManagedIndices.length || !selectedPolicies.length) return;

      const indices = selectedManagedIndices.map(
        (selectedManagedIndex: { label: string; value?: ManagedIndexItem }) => selectedManagedIndex.label
      );
      const policyId = selectedPolicies[0].label;
      const state = stateRadioIdSelected === Radio.State ? stateSelected : null;
      const include = selectedStateFilters.map((selectedStateFilter: { label: string }) => ({ state: selectedStateFilter.label }));

      const changePolicyResponse = await managedIndexService.changePolicy(indices, policyId, state, include);

      if (changePolicyResponse.ok) {
        const { updatedIndices, failedIndices, failures } = changePolicyResponse.response;
        if (updatedIndices) {
          this.context.notifications.toasts.addSuccess(`Changed policy on ${updatedIndices} indexes`);
        }
        if (failures) {
          this.context.notifications.toasts.addDanger(
            `Failed to change policy on ${failedIndices
              .map((failedIndex) => `[${failedIndex.indexName}, ${failedIndex.reason}]`)
              .join(", ")}`
          );
        }
      } else {
        this.context.notifications.toasts.addDanger(changePolicyResponse.error);
      }
    } catch (err) {
      this.context.notifications.toasts.addDanger(getErrorMessage(err, "There was a problem changing policy"));
    }
  };

  onCancel = () => this.props.history.goBack();

  onSubmit = async () => {
    const { selectedPolicies, selectedManagedIndices } = this.state;

    const managedIndicesError = selectedManagedIndices.length ? "" : "Required";
    const selectedPoliciesError = selectedPolicies.length ? "" : "Required";

    this.setState({ managedIndicesError, selectedPoliciesError, hasSubmitted: true });
    if (selectedManagedIndices.length && selectedPolicies.length) {
      await this.onChangePolicy();
    }
  };

  render() {
    const { indexService, managedIndexService } = this.props;
    const {
      selectedPolicies,
      selectedManagedIndices,
      selectedStateFilters,
      stateRadioIdSelected,
      stateSelected,
      managedIndicesError,
      selectedPoliciesError,
      hasSubmitted,
    } = this.state;

    return (
      <div style={{ padding: "0px 25px" }}>
        <EuiTitle size="l">
          <h1>Change policy</h1>
        </EuiTitle>

        <EuiSpacer />

        <ChangeManagedIndices
          key={`changeManagedIndices-${this.props.dataSourceId}`} // force re-mount on dataSourceId change
          {...this.props}
          managedIndexService={managedIndexService}
          selectedManagedIndices={selectedManagedIndices}
          selectedStateFilters={selectedStateFilters}
          onChangeManagedIndices={this.onChangeManagedIndices}
          onChangeStateFilters={this.onChangeStateFilters}
          managedIndicesError={hasSubmitted ? managedIndicesError : ""}
        />

        <EuiSpacer />

        <NewPolicy
          key={`newPolicy-${this.props.dataSourceId}`} // force re-mount on dataSourceId change
          {...this.props}
          indexService={indexService}
          selectedPolicies={selectedPolicies}
          stateRadioIdSelected={stateRadioIdSelected}
          stateSelected={stateSelected}
          onChangePolicy={this.onChangeSelectedPolicy}
          onChangeStateRadio={this.onChangeStateRadio}
          onStateSelectChange={this.onStateSelectChange}
          selectedPoliciesError={hasSubmitted ? selectedPoliciesError : ""}
        />

        <EuiSpacer />

        <EuiFlexGroup alignItems="center" justifyContent="flexEnd">
          <EuiFlexItem grow={false}>
            <EuiSmallButtonEmpty onClick={this.onCancel} data-test-subj="changePolicyCancelButton">
              Cancel
            </EuiSmallButtonEmpty>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiSmallButton fill onClick={this.onSubmit} data-test-subj="changePolicyChangeButton">
              Change
            </EuiSmallButton>
          </EuiFlexItem>
        </EuiFlexGroup>
      </div>
    );
  }
}

export default function (props: Omit<ChangePolicyProps, keyof DataSourceMenuProperties>) {
  const dataSourceMenuProperties = useContext(DataSourceMenuContext);
  useUpdateUrlWithDataSourceProperties();
  return <ChangePolicy {...props} {...dataSourceMenuProperties} />;
}
