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

const DEFAULT_RENAME_PATTERN = "$1_remote";

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
    return this.isValidAction(this.action);
  };

  isValidAction = (action: ConvertIndexToRemoteAction) => {
    const convertAction = action.convert_index_to_remote;
    return (
      !!convertAction.snapshot &&
      !!convertAction.repository &&
      this.isValidRenamePattern(convertAction.rename_pattern) &&
      this.isValidNumberOfReplicas(convertAction.number_of_replicas)
    );
  };

  isValidRenamePattern = (renamePattern: string = DEFAULT_RENAME_PATTERN) => {
    return renamePattern.trim().length > 0 && renamePattern.includes("$1");
  };

  isValidNumberOfReplicas = (numberOfReplicas?: number) => {
    return typeof numberOfReplicas === "undefined" || numberOfReplicas >= 0;
  };

  render = (action: UIAction<ConvertIndexToRemoteAction>, onChangeAction: (action: UIAction<ConvertIndexToRemoteAction>) => void) => {
    const convertAction = action.action as ConvertIndexToRemoteAction;
    const convertIndexToRemote = convertAction.convert_index_to_remote;
    const isRepositoryValid = !!convertIndexToRemote.repository;
    const isSnapshotValid = !!convertIndexToRemote.snapshot;
    const isRenamePatternValid = this.isValidRenamePattern(convertIndexToRemote.rename_pattern);
    const isNumberOfReplicasValid = this.isValidNumberOfReplicas(convertIndexToRemote.number_of_replicas);

    return (
      <>
        <EuiFormCustomLabel
          title="Repository"
          helpText="The repository name registered through the native snapshot API operations. Must be a remote repository type (e.g., S3, Azure, or GCS)."
          isInvalid={!isRepositoryValid}
        />
        <EuiCompressedFormRow fullWidth isInvalid={!isRepositoryValid} error={null}>
          <EuiCompressedFieldText
            fullWidth
            value={convertIndexToRemote.repository}
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
          isInvalid={!isSnapshotValid}
        />
        <EuiCompressedFormRow fullWidth isInvalid={!isSnapshotValid} error={null}>
          <EuiCompressedFieldText
            fullWidth
            value={convertIndexToRemote.snapshot}
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
          title="Rename pattern"
          helpText="The pattern used to name the restored remote index. Must include $1 to reference the source index name."
          isInvalid={!isRenamePatternValid}
        />
        <EuiCompressedFormRow fullWidth isInvalid={!isRenamePatternValid} error="Rename pattern must be non-empty and contain $1.">
          <EuiCompressedFieldText
            fullWidth
            value={
              typeof convertIndexToRemote.rename_pattern === "undefined" ? DEFAULT_RENAME_PATTERN : convertIndexToRemote.rename_pattern
            }
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              const renamePattern = e.target.value;
              onChangeAction(
                this.clone({
                  convert_index_to_remote: {
                    ...action.action.convert_index_to_remote,
                    rename_pattern: renamePattern,
                  },
                })
              );
            }}
            data-test-subj="action-render-convert-index-to-remote-rename-pattern"
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
            checked={convertIndexToRemote.include_aliases || false}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              const includeAliases = e.target.checked;
              onChangeAction(
                this.clone({
                  convert_index_to_remote: {
                    ...action.action.convert_index_to_remote,
                    include_aliases: includeAliases,
                  },
                })
              );
            }}
            data-test-subj="action-render-convert-index-to-remote-include-aliases"
          />
        </EuiCompressedFormRow>
        <EuiSpacer size="s" />
        <EuiFormCustomLabel
          title="Delete original index"
          helpText="Delete the local source index after the restored remote index is confirmed."
          isInvalid={false}
        />
        <EuiCompressedFormRow fullWidth>
          <EuiCompressedSwitch
            label="Delete original index"
            checked={convertIndexToRemote.delete_original_index || false}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              const deleteOriginalIndex = e.target.checked;
              onChangeAction(
                this.clone({
                  convert_index_to_remote: {
                    ...action.action.convert_index_to_remote,
                    delete_original_index: deleteOriginalIndex,
                  },
                })
              );
            }}
            data-test-subj="action-render-convert-index-to-remote-delete-original-index"
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
            value={convertIndexToRemote.ignore_index_settings || ""}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              const ignoreIndexSettings = e.target.value;
              onChangeAction(
                this.clone({
                  convert_index_to_remote: {
                    ...action.action.convert_index_to_remote,
                    ignore_index_settings: ignoreIndexSettings,
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
          helpText="The number of replicas to configure for the restored remote index. Leave empty to inherit the value from the snapshot."
          isInvalid={!isNumberOfReplicasValid}
          isOptional={true}
        />
        <EuiCompressedFormRow fullWidth isInvalid={!isNumberOfReplicasValid} error="Number of replicas must be non-negative.">
          <EuiCompressedFieldNumber
            fullWidth
            value={typeof convertIndexToRemote.number_of_replicas === "undefined" ? "" : convertIndexToRemote.number_of_replicas}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              const numberOfReplicas = e.target.valueAsNumber;
              const updatedConvertIndexToRemote: ConvertIndexToRemoteAction["convert_index_to_remote"] = {
                ...action.action.convert_index_to_remote,
                number_of_replicas: numberOfReplicas,
              };
              if (isNaN(numberOfReplicas)) delete updatedConvertIndexToRemote.number_of_replicas;
              onChangeAction(
                this.clone({
                  convert_index_to_remote: updatedConvertIndexToRemote,
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

  toAction = () => {
    const action: ConvertIndexToRemoteAction = {
      ...this.action,
      convert_index_to_remote: {
        ...this.action.convert_index_to_remote,
      },
    };
    if (typeof action.convert_index_to_remote.number_of_replicas === "undefined") {
      delete action.convert_index_to_remote.number_of_replicas;
    }
    return action;
  };
}
