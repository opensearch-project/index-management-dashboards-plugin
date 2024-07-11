/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from "react";
import {
  EuiSmallButton,
  EuiSmallButtonEmpty,
  EuiModal,
  EuiModalBody,
  EuiModalFooter,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiOverlayMask,
  EuiRadioGroup,
  EuiSelect,
  EuiSpacer,
  EuiFormRow,
} from "@elastic/eui";
import { ManagedIndexItem, State } from "../../../../../models/interfaces";
import { BrowserServices } from "../../../../models/interfaces";
import { getErrorMessage } from "../../../../utils/helpers";
import { CoreServicesContext } from "../../../../components/core_services";

interface RetryModalProps {
  services: BrowserServices;
  retryItems: ManagedIndexItem[];
  onClose: () => void;
}

interface RetryModalState {
  radioIdSelected: string;
  stateSelected: string;
  stateOptions: { value: string; text: string }[];
}

enum Radio {
  Current = "current",
  State = "state",
}

export default class RetryModal extends Component<RetryModalProps, RetryModalState> {
  static contextType = CoreServicesContext;
  state = {
    radioIdSelected: Radio.Current,
    stateSelected: "",
    stateOptions: [],
  };

  componentDidMount(): void {
    this.initOptions();
  }

  initOptions = (): void => {
    const { retryItems } = this.props;
    if (!retryItems.length) return;

    // we will use this first item as the base set of states
    // if we ever encounter an item with no policy, then simply return early
    // otherwise take the intersections of all next retry item states
    // until we have a final list of common states

    const firstRetryItem = retryItems[0];
    if (!firstRetryItem.policy || !firstRetryItem.policy.states) return;
    let states = new Set(firstRetryItem.policy.states.map((state: State) => state.name));

    for (let i = 1; i < retryItems.length; i++) {
      // if we ever end up with no states just return early
      if (!states.size) return;

      const retryItem = retryItems[i];
      if (!retryItem.policy || !retryItem.policy.states) return;
      const tempStates = new Set(retryItem.policy.states.map((state: State) => state.name));

      // take intersection of two state sets
      states = new Set([...states].filter((state) => tempStates.has(state)));
    }

    const stateOptions = [...states].map((state: string) => ({ value: state, text: state }));
    this.setState({ stateOptions });
  };

  onRetry = async (): Promise<void> => {
    const { radioIdSelected, stateSelected } = this.state;
    const {
      retryItems,
      onClose,
      services: { managedIndexService },
    } = this.props;
    try {
      const indices = retryItems.map((item) => item.index);
      const state = radioIdSelected == Radio.State ? stateSelected : null;
      const response = await managedIndexService.retryManagedIndexPolicy(indices, state);
      if (response.ok) {
        const {
          response: { updatedIndices, failedIndices, failures },
        } = response;
        if (failures) {
          this.context.notifications.toasts.addDanger(
            `Failed to retry: ${failedIndices.map((failedIndex) => `[${failedIndex.indexName}, ${failedIndex.reason}]`).join(", ")}`
          );
        }

        if (updatedIndices) {
          this.context.notifications.toasts.addSuccess(`Retried ${updatedIndices} managed indexes`);
        }
      } else {
        this.context.notifications.toasts.addDanger(response.error);
      }
      onClose();
    } catch (err) {
      this.context.notifications.toasts.addDanger(getErrorMessage(err, "There was a problem retrying managed indexes"));
    }
  };

  onChange = (optionId: string): void => {
    this.setState({ radioIdSelected: optionId });
  };

  onSelectChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    this.setState({ stateSelected: e.target.value });
  };

  render() {
    const { radioIdSelected, stateSelected, stateOptions } = this.state;
    const { onClose, retryItems } = this.props;

    const currentRadio = { id: Radio.Current, label: "Retry policy from current action" };
    const stateRadio = { id: Radio.State, label: "Retry policy from selected state", disabled: !stateOptions.length };
    const radioOptions = [currentRadio, stateRadio];
    return (
      <EuiOverlayMask>
        {/*
            // @ts-ignore */}
        <EuiModal onCancel={onClose} onClose={onClose}>
          <EuiModalHeader>
            <EuiModalHeaderTitle>Retry policy</EuiModalHeaderTitle>
          </EuiModalHeader>

          <EuiModalBody>
            <EuiRadioGroup options={radioOptions} idSelected={radioIdSelected} onChange={this.onChange} />

            <EuiSpacer size="s" />
            <EuiFormRow label="Start state" helpText="Only common states shared across all selected indexes are available">
              <EuiSelect
                disabled={radioIdSelected !== Radio.State}
                options={stateOptions}
                value={stateSelected}
                onChange={this.onSelectChange}
                aria-label="Retry failed policy from"
              />
            </EuiFormRow>
          </EuiModalBody>

          <EuiModalFooter>
            <EuiSmallButtonEmpty onClick={onClose} data-test-subj="retryModalCloseButton">
              Close
            </EuiSmallButtonEmpty>

            <EuiSmallButton onClick={this.onRetry} disabled={!retryItems.length} fill data-test-subj="retryModalRetryButton">
              Retry
            </EuiSmallButton>
          </EuiModalFooter>
        </EuiModal>
      </EuiOverlayMask>
    );
  }
}
