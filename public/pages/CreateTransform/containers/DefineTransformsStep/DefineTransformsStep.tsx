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
  sourceIndexFilter: string;
  fields: FieldItem[];
  selectedGroupField: TransformGroupItem[];
  onGroupSelectionChange: (selectedFields: TransformGroupItem[], aggItem: TransformAggItem) => void;
  selectedAggregations: any;
  aggList: TransformAggItem[];
  onAggregationSelectionChange: (selectedFields: any, aggItem: TransformAggItem) => void;
  onEditTransformation: (oldName: string, newName: string) => void;
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
      onEditTransformation,
      onRemoveTransformation,
    } = this.props;
    if (currentStep !== 2) return null;

    return (
      <div style={{ padding: "5px 50px" }}>
        <EuiFlexGroup>
          <EuiFlexItem style={{ maxWidth: 300 }} grow={false}>
            <CreateTransformSteps step={2} />
          </EuiFlexItem>
          <EuiFlexItem style={{ overflow: "auto", flex: 1 }} grow={false}>
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
              onEditTransformation={onEditTransformation}
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
