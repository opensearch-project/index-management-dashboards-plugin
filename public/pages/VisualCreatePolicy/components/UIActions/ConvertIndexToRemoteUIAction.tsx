/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ChangeEvent } from "react";
import { EuiCompressedFormRow, EuiCompressedFieldText, EuiSpacer, EuiCompressedFieldNumber, EuiCompressedSwitch } from "@elastic/eui";
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

  content = () => `Convert index to remote`;

  clone = (action: ConvertIndexToRemoteAction) => new ConvertIndexToRemoteUIAction(action, this.id);

  isValid = () => {
    return !!this.action.convert_index_to_remote.snapshot && !!this.action.convert_index_to_remote.repository;
  };

  render = (action: UIAction<ConvertIndexToRemoteAction>, onChangeAction: (action: UIAction<ConvertIndexToRemoteAction>) => void) => {
    return (
      <>
        <EuiFormCustomLabel
          title="Repository"
          helpText="The repository name registered through the native snapshot API operations. Must be a remote repository type (e.g., S3, Azure, or GCS)."
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
        <EuiFormCustomLabel 
          title="Snapshot" 
          helpText="The snapshot name created through the snapshot action. You can use variables like {{ctx.index}} for dynamic naming." 
          isInvalid={!this.isValid()} 
        />
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
        <EuiSpacer size="s" />
        <EuiFormCustomLabel
          title="Include aliases"
          helpText="Whether to include index aliases during the restore operation. Set to true if your application references the index through aliases."
          isInvalid={false}
        />
        <EuiCompressedFormRow fullWidth>
          <EuiCompressedSwitch
            label="Include aliases"
            checked={(action.action as ConvertIndexToRemoteAction).convert_index_to_remote.include_aliases || false}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              const include_aliases = e.target.checked;
              onChangeAction(
                this.clone({
                  convert_index_to_remote: {
                    ...action.action.convert_index_to_remote,
                    include_aliases,
                  },
                })
              );
            }}
            data-test-subj="action-render-convert-index-to-remote-include-aliases"
          />
        </EuiCompressedFormRow>
        <EuiSpacer size="s" />
        <EuiFormCustomLabel
          title="Ignore index settings"
          helpText="A comma-separated list of index settings to ignore during the restore operation (e.g., 'index.refresh_interval,index.number_of_replicas')."
          isInvalid={false}
        />
        <EuiCompressedFormRow fullWidth>
          <EuiCompressedFieldText
            fullWidth
            value={(action.action as ConvertIndexToRemoteAction).convert_index_to_remote.ignore_index_settings || ""}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              const ignore_index_settings = e.target.value;
              onChangeAction(
                this.clone({
                  convert_index_to_remote: {
                    ...action.action.convert_index_to_remote,
                    ignore_index_settings,
                  },
                })
              );
            }}
            data-test-subj="action-render-convert-index-to-remote-ignore-index-settings"
          />
        </EuiCompressedFormRow>
        <EuiSpacer size="s" />
        <EuiFormCustomLabel
          title="Number of replicas"
          helpText="The number of replicas to configure for the restored remote index. Consider your cluster's capacity when setting this value."
          isInvalid={false}
        />
        <EuiCompressedFormRow fullWidth>
          <EuiCompressedFieldNumber
            fullWidth
            value={(action.action as ConvertIndexToRemoteAction).convert_index_to_remote.number_of_replicas ?? 0}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              const number_of_replicas = parseInt(e.target.value);
              onChangeAction(
                this.clone({
                  convert_index_to_remote: {
                    ...action.action.convert_index_to_remote,
                    number_of_replicas,
                  },
                })
              );
            }}
            min={0}
            data-test-subj="action-render-convert-index-to-remote-number-of-replicas"
          />
        </EuiCompressedFormRow>
      </>
    );
  };

  toAction = () => this.action;
}

