/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component, Fragment } from "react";
import { EuiSpacer, EuiCompressedFormRow, EuiCallOut, EuiText, EuiLink, EuiFlexGroup, EuiHorizontalRule, EuiPanel } from "@elastic/eui";
import { EuiComboBoxOptionOption } from "@elastic/eui/src/components/combo_box/types";
import _ from "lodash";
import EuiCompressedComboBox from "../../../../components/ComboBoxWithoutWarning";
import { ContentPanel } from "../../../../components/ContentPanel";
import { IndexItem } from "../../../../../models/interfaces";
import IndexService from "../../../../services/IndexService";
import { CoreServicesContext } from "../../../../components/core_services";
import { wildcardOption } from "../../../../utils/helpers";

interface RollupIndicesProps {
  indexService: IndexService;
  sourceIndex: { label: string; value?: IndexItem }[];
  sourceIndexError: string;
  targetIndex: { label: string; value?: IndexItem }[];
  targetIndexError: string;
  onChangeSourceIndex: (options: EuiComboBoxOptionOption<IndexItem>[]) => void;
  onChangeTargetIndex: (options: EuiComboBoxOptionOption<IndexItem>[]) => void;
  hasAggregation: boolean;
}

interface RollupIndicesState {
  isLoading: boolean;
  indexOptions: { label: string; value?: IndexItem }[];
  targetIndexOptions: { label: string; value?: IndexItem }[];
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

  onCreateOption = (searchValue: string, flattenedOptions: { label: string; value?: IndexItem }[]): void => {
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
      this.setState({ targetIndexOptions: targetIndexOptions });
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
      <EuiPanel>
        <EuiFlexGroup gutterSize="xs" alignItems="center">
          <EuiText size="s">
            <h2>Indices</h2>
          </EuiText>
        </EuiFlexGroup>
        <EuiHorizontalRule margin={"xs"} />
        <EuiSpacer size="s" />
        <EuiCallOut color="warning">
          <p>You can't change indices after creating a job. Double-check the source and target index names before proceeding.</p>
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
        <EuiCompressedFormRow
          label={
            <EuiText size="s">
              <h3>Source index</h3>
            </EuiText>
          }
          error={sourceIndexError}
          isInvalid={sourceIndexError != ""}
          helpText="The index pattern on which to performed the rollup job. You can use * as a wildcard."
        >
          <EuiCompressedComboBox
            placeholder="Select source index"
            options={indexOptions}
            selectedOptions={sourceIndex}
            onChange={onChangeSourceIndex}
            singleSelection={{ asPlainText: true }}
            onSearchChange={this.onIndexSearchChange}
            isLoading={isLoading}
            isInvalid={sourceIndexError != ""}
            data-test-subj="sourceIndexCombobox"
          />
        </EuiCompressedFormRow>

        <EuiCompressedFormRow
          label={
            <EuiText size="s">
              <h3>Target index</h3>
            </EuiText>
          }
          error={targetIndexError}
          isInvalid={targetIndexError != ""}
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
          <EuiCompressedComboBox
            placeholder="Select or create target index"
            options={targetIndexOptions}
            selectedOptions={targetIndex}
            onChange={onChangeTargetIndex}
            onCreateOption={this.onCreateOption}
            singleSelection={{ asPlainText: true }}
            onSearchChange={this.onIndexSearchChange}
            isLoading={isLoading}
            isInvalid={targetIndexError != ""}
            data-test-subj="targetIndexCombobox"
          />
        </EuiCompressedFormRow>
      </EuiPanel>
    );
  }
}
