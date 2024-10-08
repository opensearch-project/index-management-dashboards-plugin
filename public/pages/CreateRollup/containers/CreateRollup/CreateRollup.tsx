/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ChangeEvent, Component, useContext } from "react";
import { EuiSpacer, EuiTitle, EuiFlexGroup, EuiFlexItem, EuiComboBoxOptionOption, EuiText } from "@elastic/eui";
import { RouteComponentProps } from "react-router-dom";
import { RollupService } from "../../../../services";
import ConfigureRollup from "../../components/ConfigureRollup";
import RollupIndices from "../../components/RollupIndices";
import CreateRollupSteps from "../../components/CreateRollupSteps";
import IndexService from "../../../../services/IndexService";
import { IndexItem } from "../../../../../models/interfaces";
import { DataSourceMenuContext, DataSourceMenuProperties } from "../../../../services/DataSourceMenuContext";

interface CreateRollupProps extends RouteComponentProps, DataSourceMenuProperties {
  rollupService: RollupService;
  indexService: IndexService;
  rollupId: string;
  rollupIdError: string;
  submitError: string;
  isSubmitting: boolean;
  hasSubmitted: boolean;
  description: string;
  sourceIndex: { label: string; value?: IndexItem }[];
  sourceIndexError: string;
  targetIndex: { label: string; value?: IndexItem }[];
  targetIndexError: string;
  onChangeName: (e: ChangeEvent<HTMLInputElement>) => void;
  onChangeDescription: (value: ChangeEvent<HTMLTextAreaElement>) => void;
  onChangeSourceIndex: (options: EuiComboBoxOptionOption<IndexItem>[]) => void;
  onChangeTargetIndex: (options: EuiComboBoxOptionOption<IndexItem>[]) => void;
  currentStep: number;
  hasAggregation: boolean;
  useNewUX: boolean;
}

export default class CreateRollup extends Component<CreateRollupProps> {
  render() {
    if (this.props.currentStep !== 1) {
      return null;
    }

    const getTitle = !this.props.useNewUX
      ? () => {
          return (
            <>
              <EuiText size="s">
                <h1>Set up indices</h1>
              </EuiText>
              <EuiSpacer />
            </>
          );
        }
      : () => {};
    const padding_style = this.props.useNewUX ? { padding: "0px 0px" } : { padding: "5px 50px" };

    return (
      <div style={padding_style}>
        <EuiFlexGroup>
          <EuiFlexItem style={{ maxWidth: 300 }} grow={false}>
            <CreateRollupSteps step={1} />
          </EuiFlexItem>
          <EuiFlexItem>
            {getTitle()}
            <ConfigureRollup isEdit={false} {...this.props} />
            <EuiSpacer />
            <RollupIndices key={this.props.dataSourceId} {...this.props} />
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiSpacer />
      </div>
    );
  }
}
