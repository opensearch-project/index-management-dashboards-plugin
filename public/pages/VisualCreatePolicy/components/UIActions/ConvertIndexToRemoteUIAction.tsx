/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ChangeEvent } from "react";
import { EuiCompressedFormRow, EuiCompressedFieldText, EuiSpacer } from "@elastic/eui";
import { ConvertIndexToRemoteAction, UIAction } from "../../../../../models/interfaces";
import { makeId } from "../../../../utils/helpers";
import { ActionType } from "../../utils/constants";
import EuiFormCustomLabel from "../EuiFormCustomLabel";

export default class ConvertIndexToRemoteUIAction implements UIAction<ConvertIndexToRemoteAction> {
  id: string;
  action: ConvertIndexToRemoteAction;
  type = ActionType.ConvertIndexToRemote;

  constructor(action: ConvertIndexToRemoteAction, id: string = makeId()) {
    this.action = action;
    this.id = id;
  }

  content = () => `Convert Index To Remote`;

  clone = (action: ConvertIndexToRemoteAction) => new ConvertIndexToRemoteUIAction(action, this.id);

  isValid = () => {
    return !!this.action.convert_index_to_remote.snapshot && !!this.action.convert_index_to_remote.repository;
  };

  render = (action: UIAction<ConvertIndexToRemoteAction>, onChangeAction: (action: UIAction<ConvertIndexToRemoteAction>) => void) => {
    return (
      <>
        <EuiFormCustomLabel
          title="Repository"
          helpText="The repository name that you register through the native snapshot API operations."
          isInvalid={!this.isValid()}
        />
        <EuiCompressedFormRow fullWidth isInvalid={!this.isValid()} error={null}>
          <EuiCompressedFieldText
            fullWidth
            value={(action.action as ConvertIndexToRemoteAction).convert_index_to_remote.repository}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              const repository = e.target.value;
              onChangeAction(
                this.clone({
                  convert_index_to_remote: {
                    ...action.action.convert_index_to_remote,
                    repository,
                  },
                })
              );
            }}
            data-test-subj="action-render-convert-index-to-remote-repository"
          />
        </EuiCompressedFormRow>
        <EuiSpacer size="s" />
        <EuiFormCustomLabel title="Snapshot" helpText="The name of the snapshot." isInvalid={!this.isValid()} />
        <EuiCompressedFormRow fullWidth isInvalid={!this.isValid()} error={null}>
          <EuiCompressedFieldText
            fullWidth
            value={(action.action as ConvertIndexToRemoteAction).convert_index_to_remote.snapshot}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              const snapshot = e.target.value;
              onChangeAction(
                this.clone({
                  convert_index_to_remote: {
                    ...action.action.convert_index_to_remote,
                    snapshot,
                  },
                })
              );
            }}
            data-test-subj="action-render-convert-index-to-remote-snapshot"
          />
        </EuiCompressedFormRow>
      </>
    );
  };

  toAction = () => this.action;
}
