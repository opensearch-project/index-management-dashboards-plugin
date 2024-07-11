/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component, Fragment } from "react";
import {
  EuiSpacer,
  EuiCompressedFormRow,
  EuiCallOut,
  EuiPopover,
  EuiFlexGroup,
  EuiFlexItem,
  EuiText,
  EuiButtonEmpty,
  EuiHorizontalRule,
  EuiComboBoxOptionOption,
  EuiBadge,
  EuiLink,
} from "@elastic/eui";
import _ from "lodash";
import EuiComboBox from "../../../../components/ComboBoxWithoutWarning";
import { ContentPanel } from "../../../../components/ContentPanel";
import IndexFilterPopover from "../IndexFilterPopover";
import { FieldItem, IndexItem } from "../../../../../models/interfaces";
import IndexService from "../../../../services/IndexService";
import { CoreServicesContext } from "../../../../components/core_services";
import { wildcardOption } from "../../../../utils/helpers";

interface TransformIndicesProps {
  indexService: IndexService;
  sourceIndex: { label: string; value?: IndexItem }[];
  sourceIndexFilter: string;
  sourceIndexFilterError: string;
  sourceIndexError: string;
  targetIndex: { label: string; value?: IndexItem }[];
  targetIndexError: string;
  onChangeSourceIndex: (options: EuiComboBoxOptionOption<IndexItem>[]) => void;
  onChangeSourceIndexFilter: (sourceIndexFilter: string) => void;
  onChangeTargetIndex: (options: EuiComboBoxOptionOption<IndexItem>[]) => void;
  hasAggregation: boolean;
  fields: FieldItem[];
  beenWarned: boolean;
}

interface TransformIndicesState {
  isLoading: boolean;
  indexOptions: { label: string; value?: IndexItem }[];
  targetIndexOptions: { label: string; value?: IndexItem }[];
  isPopoverOpen: boolean;
  selectFieldValue: string;
}

export default class TransformIndices extends Component<TransformIndicesProps, TransformIndicesState> {
  static contextType = CoreServicesContext;
  _isMount: boolean;
  constructor(props: TransformIndicesProps) {
    super(props);
    this.state = {
      isLoading: true,
      indexOptions: [],
      targetIndexOptions: [],
      isPopoverOpen: false,
      selectFieldValue: "",
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

  // TODO: created shared method with rollup indices to reduce duplicate code.
  onIndexSearchChange = async (searchValue: string): Promise<void> => {
    if (!this._isMount) {
      return;
    }
    const { indexService } = this.props;
    this.setState({ isLoading: true, indexOptions: [] });
    try {
      const dataStreamsAndIndicesNamesResponse = await indexService.getDataStreamsAndIndicesNames(searchValue);
      if (!this._isMount) {
        return;
      }
      if (dataStreamsAndIndicesNamesResponse.ok) {
        // Adding wildcard to search value
        const options = searchValue.trim() ? [{ label: wildcardOption(searchValue) }] : [];
        const dataStreams = dataStreamsAndIndicesNamesResponse.response.dataStreams.map((label) => ({ label }));
        const indices = dataStreamsAndIndicesNamesResponse.response.indices.map((label) => ({ label }));
        this.setState({ indexOptions: options.concat(dataStreams, indices), targetIndexOptions: indices });
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

    this.setState({ isLoading: false });
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

  onButtonClick = () => {
    const { isPopoverOpen } = this.state;
    if (isPopoverOpen) {
      this.setState({ isPopoverOpen: false });
    } else {
      this.setState({ isPopoverOpen: true });
    }
  };

  closePopover = () => this.setState({ isPopoverOpen: false });

  render() {
    const {
      sourceIndex,
      sourceIndexError,
      sourceIndexFilter,
      sourceIndexFilterError,
      targetIndex,
      targetIndexError,
      onChangeSourceIndex,
      onChangeSourceIndexFilter,
      onChangeTargetIndex,
      hasAggregation,
      beenWarned,
    } = this.props;

    const { isLoading, indexOptions, targetIndexOptions, isPopoverOpen } = this.state;

    const clearIndexFilter = () => {
      onChangeSourceIndexFilter("");
    };

    return (
      <div>
        <ContentPanel panelStyles={{ padding: "20px 20px" }} bodyStyles={{ padding: "10px" }} title="Indices" titleSize="m">
          <div>
            {hasAggregation && (
              <Fragment>
                <EuiCallOut color="warning">
                  <p>Note: changing source index will erase all existing definitions about aggregations and metrics.</p>
                </EuiCallOut>
              </Fragment>
            )}
            <EuiCompressedFormRow
              label="Source index"
              error={sourceIndexError}
              isInvalid={sourceIndexError != ""}
              helpText="The index where this transform job is performed on. Type in * as wildcard for index pattern. Indices cannot be changed once the job is created. Please ensure that you select the right source index."
            >
              <EuiComboBox
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
            <EuiSpacer size="s" />
            <EuiFlexGroup gutterSize="xs">
              <EuiFlexItem grow={false}>
                <EuiText size="xs">
                  <h4>Source index filter</h4>
                </EuiText>
              </EuiFlexItem>
              <EuiFlexItem>
                <EuiText size="xs" color="subdued">
                  <i> – optional</i>
                </EuiText>
              </EuiFlexItem>
            </EuiFlexGroup>

            <EuiText size="xs" color="subdued" style={{ width: "400px" }}>
              You can use the custom DSL to filter a subset of the source index to use in the transform job, which optimizes the job for
              performance and computing resources. You cannot change these filters once the job is created.
            </EuiText>

            <EuiText size="xs">
              <EuiLink
                external={true}
                target="_blank"
                href="https://opensearch.org/docs/opensearch/query-dsl/index/"
                rel="noopener noreferrer"
              >
                {" "}
                Learn more
              </EuiLink>
            </EuiText>
            <EuiSpacer size="s" />
            <EuiBadge
              iconType="cross"
              iconSide="right"
              onClick={() => this.onButtonClick()}
              onClickAriaLabel="Edit Source Index Filter"
              iconOnClick={() => clearIndexFilter()}
              iconOnClickAriaLabel="Clear Source Index Filter"
            >
              {sourceIndexFilter}
            </EuiBadge>
            <EuiPopover
              button={
                <EuiButtonEmpty
                  size="xs"
                  onClick={() => this.onButtonClick()}
                  data-test-subj="addFilter"
                  className="globalFilterBar__addButton"
                >
                  Edit data filter
                </EuiButtonEmpty>
              }
              isOpen={isPopoverOpen}
              closePopover={this.closePopover}
            >
              <IndexFilterPopover {...this.props} closePopover={this.closePopover} />
            </EuiPopover>
            <EuiText color="danger" size="xs">
              {sourceIndexFilterError}
            </EuiText>
            <EuiSpacer size="s" />
            <EuiHorizontalRule margin="xs" />
            <EuiCompressedFormRow
              label="Target index"
              error={targetIndexError}
              isInvalid={targetIndexError != ""}
              helpText="The index stores transform results. You can look up an existing index to reuse or type to create a new index."
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
                isInvalid={targetIndexError != ""}
                data-test-subj="targetIndexCombobox"
              />
            </EuiCompressedFormRow>
          </div>
        </ContentPanel>
        <Fragment>
          <EuiSpacer />
          <EuiCallOut color="warning">
            <p>You can't change indices after creating a job. Double-check the source and target index names before proceeding.</p>
          </EuiCallOut>
        </Fragment>
      </div>
    );
  }
}
