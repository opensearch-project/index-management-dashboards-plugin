/*
 * SPDX-License-Identifier: Apache-2.0
 *
 * The OpenSearch Contributors require contributions made to
 * this file be licensed under the Apache-2.0 license or a
 * compatible open source license.
 *
 * Modifications Copyright OpenSearch Contributors. See
 * GitHub history for details.
 */

import React, { Component } from "react";
import { EuiSpacer, EuiTitle, EuiFlexGroup, EuiFlexItem } from "@elastic/eui";
import { RouteComponentProps } from "react-router-dom";
import { TransformService } from "../../../../services";
import { BREADCRUMBS, ROUTES } from "../../../../utils/constants";
import CreateTransformSteps from "../../components/CreateTransformSteps";
import { CoreServicesContext } from "../../../../components/core_services";
import DefineTransforms from "../../components/DefineTransforms";
import { FieldItem, TransformAggItem, TransformGroupItem } from "../../../../../models/interfaces";

interface DefineTransformsStepProps extends RouteComponentProps {
  transformService: TransformService;
  currentStep: number;
  sourceIndex: string;
  fields: FieldItem[];
  selectedGroupField: TransformGroupItem[];
  onGroupSelectionChange: (selectedFields: TransformGroupItem[], aggItem: TransformAggItem) => void;
  selectedAggregations: any;
  aggList: TransformAggItem[];
  onAggregationSelectionChange: (selectedFields: any, aggItem: TransformAggItem) => void;
  onRemoveTransformation: (name: string) => void;
  previewTransform: any[];
}

export default class DefineTransformsStep extends Component<DefineTransformsStepProps> {
  static contextType = CoreServicesContext;
  constructor(props: DefineTransformsStepProps) {
    super(props);
  }

  componentDidMount = async (): Promise<void> => {
    this.context.chrome.setBreadcrumbs([BREADCRUMBS.INDEX_MANAGEMENT, BREADCRUMBS.TRANSFORMS]);
  };

  onCancel = (): void => {
    this.props.history.push(ROUTES.TRANSFORMS);
  };

  render() {
    const {
      transformService,
      currentStep,
      sourceIndex,
      fields,
      onGroupSelectionChange,
      selectedAggregations,
      onAggregationSelectionChange,
      onRemoveTransformation,
    } = this.props;
    if (currentStep !== 2) return null;

    return (
      <div style={{ padding: "20px 50px" }}>
        <EuiFlexGroup>
          <EuiFlexItem style={{ maxWidth: 300 }} grow={false}>
            <CreateTransformSteps step={2} />
          </EuiFlexItem>
          <EuiFlexItem style={{ maxWidth: "80%" }} grow={false}>
            <EuiTitle size="l">
              <h1>Define transform</h1>
            </EuiTitle>
            <EuiSpacer />
            <DefineTransforms
              {...this.props}
              transformService={transformService}
              notifications={this.context.notifications}
              sourceIndex={sourceIndex}
              fields={fields}
              onGroupSelectionChange={onGroupSelectionChange}
              selectedAggregations={selectedAggregations}
              onAggregationSelectionChange={onAggregationSelectionChange}
              onRemoveTransformation={onRemoveTransformation}
              isReadOnly={false}
            />
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiSpacer />
      </div>
    );
  }
}
