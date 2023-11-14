/*
 *   Copyright OpenSearch Contributors
 *
 *   Licensed under the Apache License, Version 2.0 (the "License").
 *   You may not use this file except in compliance with the License.
 *   A copy of the License is located at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   or in the "license" file accompanying this file. This file is distributed
 *   on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 *   express or implied. See the License for the specific language governing
 *   permissions and limitations under the License.
 */

import React, { Component, Fragment } from "react";
import { EuiSpacer, EuiFormRow, EuiCallOut, EuiText, EuiLink } from "@elastic/eui";
import { EuiComboBoxOptionOption } from "@elastic/eui/src/components/combo_box/types";
import _ from "lodash";
import EuiComboBox from "../../../../components/ComboBoxWithoutWarning";
import { ContentPanel } from "../../../../components/ContentPanel";
import { IndexItem } from "../../../../../models/interfaces";
import IndexService from "../../../../services/IndexService";
import { CoreServicesContext } from "../../../../components/core_services";
import { wildcardOption } from "../../../../utils/helpers";

interface RollupIndicesProps {
  indexService: IndexService;
  sourceIndex: Array<{ label: string; value?: IndexItem }>;
  sourceIndexError: string;
  targetIndex: Array<{ label: string; value?: IndexItem }>;
  targetIndexError: string;
  onChangeSourceIndex: (options: Array<EuiComboBoxOptionOption<IndexItem>>) => void;
  onChangeTargetIndex: (options: Array<EuiComboBoxOptionOption<IndexItem>>) => void;
  hasAggregation: boolean;
}

interface RollupIndicesState {
  isLoading: boolean;
  indexOptions: Array<{ label: string; value?: IndexItem }>;
  targetIndexOptions: Array<{ label: string; value?: IndexItem }>;
}

export const ROLLUP_RESULTS_HELP_TEXT_LINK = "https://opensearch.org/docs/latest/im-plugin/index-rollups/index/#step-1-set-up-indices";

export default class RollupIndices extends Component<RollupIndicesProps, RollupIndicesState> {
  static contextType = CoreServicesContext;
  _isMount: boolean;
  constructor(props: RollupIndicesProps) {
    super(props);
    this.state = {
      isLoading: true,
      indexOptions: [],
      targetIndexOptions: [],
    };

    this._isMount = true;
    this.onIndexSearchChange = _.debounce(this.onIndexSearchChange, 500, { leading: true });
  }

  async componentDidMount(): Promise<void> {
    await this.onIndexSearchChange("");
  }

  componentWillUnmount(): void {
    this._isMount = false;
  }

  onIndexSearchChange = async (searchValue: string): Promise<void> => {
    if (!this._isMount) {
      return;
    }
    const { indexService } = this.props;
    this.setState({ isLoading: true, indexOptions: [] });
    try {
      const dataStreamsAndIndicesNamesResponse = await indexService.getDataStreamsAndIndicesNames(searchValue);
      if (dataStreamsAndIndicesNamesResponse.ok) {
        // Adding wildcard to search value
        const options = searchValue.trim() ? [{ label: wildcardOption(searchValue) }] : [];
        const dataStreams = dataStreamsAndIndicesNamesResponse.response.dataStreams.map((label) => ({ label }));
        const indices = dataStreamsAndIndicesNamesResponse.response.indices.map((label) => ({ label }));
        if (this._isMount) {
          this.setState({ indexOptions: options.concat(dataStreams, indices), targetIndexOptions: indices });
        }
      } else {
        if (dataStreamsAndIndicesNamesResponse.error.startsWith("[index_not_found_exception]")) {
          this.context.notifications.toasts.addDanger("No index available");
        } else {
          this.context.notifications.toasts.addDanger(dataStreamsAndIndicesNamesResponse.error);
        }
      }
    } catch (err) {
      this.context.notifications.toasts.addDanger(err.message);
    }

    if (this._isMount) {
      this.setState({ isLoading: false });
    }
  };

  onCreateOption = (searchValue: string, flattenedOptions: Array<{ label: string; value?: IndexItem }>): void => {
    const { targetIndexOptions } = this.state;
    const { onChangeTargetIndex } = this.props;
    const normalizedSearchValue = searchValue.trim();

    if (!normalizedSearchValue) {
      return;
    }

    const newOption = {
      label: searchValue,
    };

    // Create the option if it doesn't exist.
    if (flattenedOptions.findIndex((option) => option.label.trim() === normalizedSearchValue) === -1) {
      targetIndexOptions.concat(newOption);
      this.setState({ targetIndexOptions });
    }
    onChangeTargetIndex([newOption]);
  };

  render() {
    const {
      sourceIndex,
      sourceIndexError,
      targetIndex,
      targetIndexError,
      onChangeSourceIndex,
      onChangeTargetIndex,
      hasAggregation,
    } = this.props;
    const { isLoading, indexOptions, targetIndexOptions } = this.state;
    return (
      <ContentPanel bodyStyles={{ padding: "initial" }} title="Indices" titleSize="m">
        <div style={{ paddingLeft: "10px" }}>
          <EuiSpacer size="s" />
          <EuiCallOut color="warning">
            <p>You can&apos;t change indices after creating a job. Double-check the source and target index names before proceeding.</p>
          </EuiCallOut>
          {hasAggregation && (
            <Fragment>
              <EuiSpacer />
              <EuiCallOut color="warning">
                <p>Note: changing source index will erase all existing definitions about aggregations and metrics.</p>
              </EuiCallOut>
            </Fragment>
          )}
          <EuiSpacer size="m" />
          <EuiFormRow
            label="Source index"
            error={sourceIndexError}
            isInvalid={sourceIndexError !== ""}
            helpText="The index pattern on which to performed the rollup job. You can use * as a wildcard."
          >
            <EuiComboBox
              placeholder="Select source index"
              options={indexOptions}
              selectedOptions={sourceIndex}
              onChange={onChangeSourceIndex}
              singleSelection={{ asPlainText: true }}
              onSearchChange={this.onIndexSearchChange}
              isLoading={isLoading}
              isInvalid={sourceIndexError !== ""}
              data-test-subj="sourceIndexCombobox"
            />
          </EuiFormRow>

          <EuiFormRow
            label="Target index"
            error={targetIndexError}
            isInvalid={targetIndexError !== ""}
            helpText={
              <EuiText size={"xs"}>
                {
                  "The target index stores rollup results. You can select an existing index or type in a new index name with embedded variables "
                }
                {
                  <EuiLink external href={ROLLUP_RESULTS_HELP_TEXT_LINK} target={"_blank"} rel="noopener noreferrer">
                    Learn more
                  </EuiLink>
                }
              </EuiText>
            }
          >
            <EuiComboBox
              placeholder="Select or create target index"
              options={targetIndexOptions}
              selectedOptions={targetIndex}
              onChange={onChangeTargetIndex}
              onCreateOption={this.onCreateOption}
              singleSelection={{ asPlainText: true }}
              onSearchChange={this.onIndexSearchChange}
              isLoading={isLoading}
              isInvalid={targetIndexError !== ""}
              data-test-subj="targetIndexCombobox"
            />
          </EuiFormRow>
        </div>
      </ContentPanel>
    );
  }
}
