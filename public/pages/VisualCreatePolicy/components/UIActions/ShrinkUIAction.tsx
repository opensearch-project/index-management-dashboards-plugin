/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ChangeEvent } from "react";
import { EuiCompressedFormRow, EuiCodeEditor, EuiCompressedFieldText, EuiSpacer, EuiRadioGroup, EuiCallOut } from "@elastic/eui";
import { ShrinkAction, UIAction } from "../../../../../models/interfaces";
import { makeId } from "../../../../utils/helpers";
import { ActionType } from "../../utils/constants";
import { DarkModeConsumer } from "../../../../components/DarkMode";
import EuiFormCustomLabel from "../EuiFormCustomLabel";

const radios = [
  {
    id: "no",
    label: "No",
  },
  {
    id: "yes",
    label: "Yes",
  },
];

export default class ShrinkUIAction implements UIAction<ShrinkAction> {
  id: string;
  action: ShrinkAction;
  type = ActionType.Shrink;

  constructor(action: ShrinkAction, id: string = makeId(), useJsons: boolean = false) {
    this.action = { ...action };
    this.id = id;
    // When the jsons are edited by the user, don't overwrite the json. When cloned elsewhere, take the actual object as source of truth
    if (!useJsons) {
      this.action.target_index_name_template_json = JSON.stringify(this.action.shrink.target_index_name_template, null, 4);
      this.action.aliases_json = JSON.stringify(this.action.shrink.aliases, null, 4);
      this.action.force_unsafe_input = this.action.shrink.force_unsafe ? "yes" : "no";
    }
  }

  content = () => `Shrink`;

  clone = (action: ShrinkAction = this.action) => new ShrinkUIAction(action, this.id);

  cloneUsingString = (action: ShrinkAction) => new ShrinkUIAction(action, this.id, true);

  isValid = () => {
    return this.isValidNumShards() && this.isValidAliasesJson() && this.isValidIndexNameTemplateJson();
  };

  isValidNumShards = () => {
    const shrink = this.action.shrink;
    const numSet = [shrink.num_new_shards != null, shrink.percentage_of_source_shards != null, shrink.max_shard_size != null].filter(
      (it) => it
    ).length;
    return numSet == 1;
  };

  isValidAliasesJson = () => {
    if (this.action.aliases_json && this.action.aliases_json?.length > 0) {
      try {
        JSON.parse(this.getAliasesJsonString(this.action) as string);
        return true;
      } catch (err) {
        return false;
      }
    }
    return true;
  };

  getAliasesJsonString = (action: ShrinkAction) => {
    const shrink = action.shrink;
    return action.hasOwnProperty("aliases_json") ? action.aliases_json : JSON.stringify(shrink.aliases, null, 4);
  };

  isValidIndexNameTemplateJson = () => {
    if (this.action.target_index_name_template_json && this.action.target_index_name_template_json?.length > 0) {
      try {
        JSON.parse(this.getIndexNameTemplateJsonString(this.action) as string);
        return true;
      } catch (err) {
        return false;
      }
    }
    return true;
  };

  getIndexNameTemplateJsonString = (action: ShrinkAction) => {
    if (action.hasOwnProperty("target_index_name_template_json")) {
      return action.target_index_name_template_json;
    } else {
      return JSON.stringify(action.shrink.target_index_name_template, null, 4);
    }
  };

  render = (action: UIAction<ShrinkAction>, onChangeAction: (action: UIAction<ShrinkAction>) => void) => {
    const shrink = action.action.shrink;
    return (
      <>
        <EuiCallOut color="warning" hidden={this.isValidNumShards()}>
          <p>Exactly one setting specifying the number of primary shards to shrink to must be used.</p>
        </EuiCallOut>
        <EuiFormCustomLabel
          title="Number of new shards"
          helpText={
            "The number of primary shards to attempt to shrink the index down to. This must be a factor of the " +
            "number of source index primary shards or else the greatest factor lower than your requested number of targeted primary shards " +
            "will be used."
          }
          isInvalid={!this.isValidNumShards()}
        />
        <EuiCompressedFormRow fullWidth isInvalid={!this.isValidNumShards()} error={null}>
          <EuiCompressedFieldText
            fullWidth
            value={typeof shrink.num_new_shards === "undefined" ? "" : shrink.num_new_shards}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              const numNewShards = e.target.value;
              const shrinkObject = { ...action.action };
              if (numNewShards) shrinkObject.shrink.num_new_shards = numNewShards;
              else delete shrinkObject.shrink.num_new_shards;
              onChangeAction(this.cloneUsingString(shrinkObject));
            }}
            data-test-subj="action-render-shrink-num-new-shards"
          />
        </EuiCompressedFormRow>
        <EuiSpacer size="s" />
        <EuiFormCustomLabel
          title="Maximum shard size"
          helpText={
            "The maximum size of each primary shard following the shrink. This will be used to calculate the lowest factor of " +
            "the number of source index primary shards to shrink to which satisfies the maximum shard size requirement. Accepts byte units, " +
            'e.g. "500mb" or "50gb".'
          }
          isInvalid={!this.isValidNumShards()}
        />
        <EuiCompressedFormRow fullWidth isInvalid={!this.isValidNumShards()} error={null}>
          <EuiCompressedFieldText
            fullWidth
            value={shrink.max_shard_size || ""}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              const maxShardSize = e.target.value;
              const shrinkObject = { ...action.action };
              if (maxShardSize) shrinkObject.shrink.max_shard_size = maxShardSize;
              else delete shrinkObject.shrink.max_shard_size;
              onChangeAction(this.cloneUsingString(shrinkObject));
            }}
            data-test-subj="action-render-shrink-max-shard-size"
          />
        </EuiCompressedFormRow>
        <EuiSpacer size="s" />
        <EuiFormCustomLabel
          title="Percentage of source shards"
          helpText={
            "The percentage of source shards to shrink to. This will be used to calculate the greatest factor of " +
            "the number of source index primary shards to shrink to which is less than the number of source shards times the percentage to shrink to. " +
            "Accepts a percentage as a decimal, e.g. 0.5"
          }
          isInvalid={!this.isValidNumShards()}
        />
        <EuiCompressedFormRow fullWidth isInvalid={!this.isValidNumShards()} error={null}>
          <EuiCompressedFieldText
            fullWidth
            value={typeof shrink.percentage_of_source_shards === "undefined" ? "" : shrink.percentage_of_source_shards}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              const percentageOfSourceShards = e.target.value;
              const shrinkObject = { ...action.action };
              if (percentageOfSourceShards) shrinkObject.shrink.percentage_of_source_shards = percentageOfSourceShards;
              else delete shrinkObject.shrink.percentage_of_source_shards;
              onChangeAction(this.cloneUsingString(shrinkObject));
            }}
            data-test-subj="action-render-shrink-percentage-of-source-shards"
          />
        </EuiCompressedFormRow>
        <EuiSpacer size="s" />
        <EuiFormCustomLabel
          title="Target Index Name Template"
          helpText={`The mustache template to use to form the name of the output shrunken index.
          If not provided, a default suffix of "_shrunken" will be appended.`}
          isInvalid={!this.isValidIndexNameTemplateJson()}
          isOptional={true}
        />
        <EuiCompressedFormRow fullWidth isInvalid={!this.isValidIndexNameTemplateJson()} error={null} style={{ maxWidth: "100%" }}>
          <DarkModeConsumer>
            {(isDarkMode) => (
              <EuiCodeEditor
                mode="json"
                theme={isDarkMode ? "sense-dark" : "github"}
                width="100%"
                value={action.action.target_index_name_template_json}
                onChange={(str) => {
                  const indexNameTemplateJSON = str;
                  const shrinkObject = { ...action.action };
                  if (indexNameTemplateJSON) shrinkObject.target_index_name_template_json = indexNameTemplateJSON;
                  else delete shrinkObject.target_index_name_template_json;
                  onChangeAction(this.cloneUsingString(shrinkObject));
                }}
                setOptions={{ fontSize: "14px" }}
                aria-label="Code Editor"
                height="100px"
              />
            )}
          </DarkModeConsumer>
        </EuiCompressedFormRow>
        <EuiSpacer size="s" />
        <EuiCallOut color="warning" hidden={!this.action.shrink.force_unsafe}>
          <p>
            Warning: shrinking without replicas will allocate all primaries to one node, which could result in a complete loss of the index
            in the case of a node crashing.
          </p>
        </EuiCallOut>
        <EuiFormCustomLabel
          title="Force unsafe"
          helpText={`If this is set to 'No' then the shrink action will fail for indices which do not have replica shards.`}
          isInvalid={false}
        />
        <EuiCompressedFormRow fullWidth isInvalid={false} error={null} style={{ maxWidth: "100%" }}>
          <EuiRadioGroup
            options={radios}
            idSelected={this.action.force_unsafe_input}
            onChange={(id) => {
              const forceUnsafe = id === "yes";
              const shrinkObject = { ...action.action };
              if (forceUnsafe) {
                shrinkObject.shrink.force_unsafe = forceUnsafe;
                shrinkObject.force_unsafe_input = id;
              } else {
                shrinkObject.shrink.force_unsafe = false;
                shrinkObject.force_unsafe_input = "no";
              }
              onChangeAction(this.cloneUsingString(shrinkObject));
            }}
            name="forceUnsafe"
          />
        </EuiCompressedFormRow>
        <EuiSpacer size="s" />
        <EuiFormCustomLabel
          title="Aliases"
          helpText={`The aliases to be applied to the output shrunken index.`}
          isInvalid={!this.isValidAliasesJson()}
          isOptional={true}
        />
        <EuiCompressedFormRow fullWidth isInvalid={!this.isValidAliasesJson()} error={null} style={{ maxWidth: "100%" }}>
          <DarkModeConsumer>
            {(isDarkMode) => (
              <EuiCodeEditor
                mode="json"
                theme={isDarkMode ? "sense-dark" : "github"}
                width="100%"
                value={action.action.aliases_json}
                onChange={(str) => {
                  const aliasesJSON = str;
                  const shrinkObject: ShrinkAction = { ...action.action };
                  // const shrink = { ...action.action.shrink };
                  if (aliasesJSON) shrinkObject.aliases_json = aliasesJSON;
                  else delete shrinkObject.aliases_json;
                  onChangeAction(this.cloneUsingString(shrinkObject));
                }}
                setOptions={{ fontSize: "14px" }}
                aria-label="Code Editor"
                height="100px"
              />
            )}
          </DarkModeConsumer>
        </EuiCompressedFormRow>
      </>
    );
  };

  toAction = () => {
    // Use the spread operator to copy the action
    const shrink = { ...this.action };
    if (shrink.aliases_json != null) {
      shrink.shrink.aliases = JSON.parse(shrink.aliases_json as string);
    }
    if (shrink.target_index_name_template_json != null) {
      shrink.shrink.target_index_name_template = JSON.parse(shrink.target_index_name_template_json as string);
    }
    delete shrink.aliases_json;
    delete shrink.force_unsafe_input;
    delete shrink.target_index_name_template_json;
    return shrink;
  };
}
