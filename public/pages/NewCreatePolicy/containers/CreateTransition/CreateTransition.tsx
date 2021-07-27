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

import React, { Component } from "react";
import { EuiFlyoutBody, EuiFlyoutFooter, EuiTitle, EuiFormRow, EuiSpacer, EuiComboBox } from "@elastic/eui";
import { UITransition } from "../../../../../models/interfaces";
import { UIActionFactory } from "../../utils/actions";
import TransitionFooter from "../../components/TransitionFooter";

interface CreateTransitionProps {
  edit: boolean;
  transition: UITransition | null;
  onChangeTransition: (transition: UITransition) => void;
  onCloseCreateTransition: () => void;
  onClickAddTransition: () => void;
  stateOptions: string[];
}

interface CreateTransitionState {
  transitions: any[];
}

export default class CreateTransition extends Component<CreateTransitionProps, CreateTransitionState> {
  uiActionFactory: UIActionFactory;

  constructor(props: CreateTransitionProps) {
    super(props);

    this.uiActionFactory = new UIActionFactory();

    this.state = {
      transitions: [],
    };
  }

  onChange = (selectedOptions: { label: string }[]) => {
    console.log("selectedOptions", JSON.stringify(selectedOptions));
    // const transition = {
    //   state_name: "",
    //   conditions: { // only one allowed at a time
    //     min_index_age: "",
    //     min_doc_count: 5,
    //     min_size: "",
    //     cron: {
    //       cron: {
    //         expression: "",
    //         timezone: ""
    //       }
    //     }
    //   }
    // };
    // We should only get back either 0 or 1 options.
    // const destinationState = selectedOptions.pop()?.label || null;
    //this.setState({ transitionStateName: selectedOption };
  };

  onCreateOption = (searchValue = []) => {
    console.log("searchvalue", searchValue);
    const normalizedSearchValue = searchValue.trim().toLowerCase();

    if (!normalizedSearchValue) {
      return;
    }

    // const newOption = {
    //   label: searchValue,
    // };

    // Select the option.
    //setSelected([newOption]);
  };

  render() {
    const { transition, edit, onChangeTransition, onClickAddTransition, onCloseCreateTransition, stateOptions } = this.props;
    console.log(transition);
    let title = "Create transition";
    if (edit) title = "Edit transition";
    return (
      <>
        <EuiFlyoutBody>
          <>
            <EuiTitle size="s">
              <h3>{title}</h3>
            </EuiTitle>

            <EuiSpacer />

            <EuiFormRow
              label="Destination state"
              helpText="If entering a state that does not exist yet then you must create it before creating the policy."
              isInvalid={false}
              error={null}
            >
              {/*<EuiSelect*/}
              {/*  id="action-type"*/}
              {/*  hasNoInitialSelection*/}
              {/*  options={actionOptions}*/}
              {/*  value={action?.type}*/}
              {/*  style={{ textTransform: "capitalize" }}*/}
              {/*  // This one below is for resetting to a new UIAction*/}
              {/*  onChange={this.onChangeAction}*/}
              {/*  data-test-subj="create-state-action-type"*/}
              {/*/>*/}

              <EuiComboBox
                placeholder="Select a single option"
                singleSelection={{ asPlainText: true }}
                options={stateOptions.map((state) => ({ label: state }))}
                selectedOptions={[]}
                onChange={this.onChange}
                onCreateOption={this.onCreateOption}
                customOptionText="Add {searchValue} state"
              />
            </EuiFormRow>

            <EuiSpacer />

            {transition?.render(transition, (transition: UITransition) => {
              onChangeTransition(transition);
            })}
          </>
        </EuiFlyoutBody>
        <EuiFlyoutFooter>
          <TransitionFooter
            editTransition={edit}
            onClickCancelTransition={() => onCloseCreateTransition()}
            onClickAddTransition={() => onClickAddTransition()}
          />
        </EuiFlyoutFooter>
      </>
    );
  }
}
