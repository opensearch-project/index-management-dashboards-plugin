/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ChangeEvent, Component } from "react";
import { EuiSpacer, EuiTitle, EuiFlexGroup, EuiFlexItem, EuiComboBoxOptionOption } from "@elastic/eui";
import { RouteComponentProps } from "react-router-dom";
import { TransformService } from "../../../../services";
import ConfigureTransform from "../../components/ConfigureTransform";
import TransformIndices from "../../components/TransformIndices";
import CreateTransformSteps from "../../components/CreateTransformSteps";
import IndexService from "../../../../services/IndexService";
import { FieldItem, IndexItem } from "../../../../../models/interfaces";
import { DataSourceMenuContext, DataSourceMenuProperties } from "../../../../services/DataSourceMenuContext";
import { getUISettings } from "../../../../services/Services";

interface SetUpIndicesStepProps extends RouteComponentProps, DataSourceMenuProperties {
  transformService: TransformService;
  indexService: IndexService;
  transformId: string;
  transformIdError: string;
  submitError: string;
  isSubmitting: boolean;
  hasSubmitted: boolean;
  description: string;
  sourceIndex: { label: string; value?: IndexItem }[];
  sourceIndexFilter: string;
  sourceIndexFilterError: string;
  sourceIndexError: string;
  targetIndex: { label: string; value?: IndexItem }[];
  targetIndexError: string;
  onChangeName: (e: ChangeEvent<HTMLInputElement>) => void;
  onChangeDescription: (value: ChangeEvent<HTMLTextAreaElement>) => void;
  onChangeSourceIndex: (options: EuiComboBoxOptionOption<IndexItem>[]) => void;
  onChangeSourceIndexFilter: (sourceIndexFilter: string) => void;
  onChangeTargetIndex: (options: EuiComboBoxOptionOption<IndexItem>[]) => void;
  currentStep: number;
  hasAggregation: boolean;
  fields: FieldItem[];
  fieldSelectedOption: string;
  beenWarned: boolean;
}

export default class SetUpIndicesStep extends Component<SetUpIndicesStepProps> {
  render() {
    if (this.props.currentStep !== 1) {
      return null;
    }

    const uiSettings = getUISettings();
    const useUpdatedUX = uiSettings.get("home:useNewHomePage");

    const Title = !useUpdatedUX
      ? () => {
          return (
            <EuiFlexItem>
              <EuiTitle size="l">
                <h1>Set up indices</h1>
              </EuiTitle>
              <EuiSpacer />
            </EuiFlexItem>
          );
        }
      : () => {};

    return (
      <div style={{ padding: "5px 50px" }}>
        <EuiFlexGroup>
          <EuiFlexItem style={{ maxWidth: 300 }} grow={false}>
            <CreateTransformSteps step={1} />
          </EuiFlexItem>
          <EuiFlexItem>
            {Title()}
            <EuiFlexItem>
              <ConfigureTransform isEdit={false} {...this.props} />
              <EuiSpacer />
              <TransformIndices key={this.props.dataSourceId} {...this.props} />
            </EuiFlexItem>
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiSpacer />
      </div>
    );
  }
}
