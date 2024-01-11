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

interface SetUpIndicesStepProps extends RouteComponentProps {
  transformService: TransformService;
  indexService: IndexService;
  transformId: string;
  transformIdError: string;
  submitError: string;
  isSubmitting: boolean;
  hasSubmitted: boolean;
  description: string;
  sourceIndex: Array<{ label: string; value?: IndexItem }>;
  sourceIndexFilter: string;
  sourceIndexFilterError: string;
  sourceIndexError: string;
  targetIndex: Array<{ label: string; value?: IndexItem }>;
  targetIndexError: string;
  onChangeName: (e: ChangeEvent<HTMLInputElement>) => void;
  onChangeDescription: (value: ChangeEvent<HTMLTextAreaElement>) => void;
  onChangeSourceIndex: (options: Array<EuiComboBoxOptionOption<IndexItem>>) => void;
  onChangeSourceIndexFilter: (sourceIndexFilter: string) => void;
  onChangeTargetIndex: (options: Array<EuiComboBoxOptionOption<IndexItem>>) => void;
  currentStep: number;
  hasAggregation: boolean;
  fields: FieldItem[];
  fieldSelectedOption: string;
  beenWarned: boolean;
}

// eslint-disable-next-line react/prefer-stateless-function
export default class SetUpIndicesStep extends Component<SetUpIndicesStepProps> {
  render() {
    if (this.props.currentStep !== 1) {
      return null;
    }

    return (
      <div style={{ padding: "5px 50px" }}>
        <EuiFlexGroup>
          <EuiFlexItem style={{ maxWidth: 300 }} grow={false}>
            <CreateTransformSteps step={1} />
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiTitle size="l">
              <h1>Set up indices</h1>
            </EuiTitle>
            <EuiSpacer />
            <ConfigureTransform isEdit={false} {...this.props} />
            <EuiSpacer />
            <TransformIndices {...this.props} />
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiSpacer />
      </div>
    );
  }
}
