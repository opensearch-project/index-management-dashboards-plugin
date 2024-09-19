/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from "react";
import {
  EuiFlexGrid,
  EuiSpacer,
  EuiFlexItem,
  EuiText,
  EuiAccordion,
  EuiFlexGroup,
  EuiPanel,
  EuiHorizontalRule,
  EuiTitle,
} from "@elastic/eui";
import { ContentPanelActions } from "../../../../components/ContentPanel";
import { ModalConsumer } from "../../../../components/Modal";
import { TransformGroupItem, FieldItem, TransformAggItem, TRANSFORM_AGG_TYPE } from "../../../../../models/interfaces";
import DefineTransforms from "../DefineTransforms";
import { TransformService } from "../../../../services";
import { CoreStart } from "opensearch-dashboards/public";

interface ReviewDefinitionProps {
  transformService: TransformService;
  notifications: CoreStart["notifications"];
  transformId: string;
  sourceIndex: string;
  fields: FieldItem[];
  selectedGroupField: TransformGroupItem[];
  onGroupSelectionChange: (selectedFields: TransformGroupItem[], aggItem: TransformAggItem) => void;
  selectedAggregations: any;
  aggList: TransformAggItem[];
  onAggregationSelectionChange: (selectedFields: any, aggItem: TransformAggItem) => void;
  onRemoveTransformation: (name: string) => void;
  previewTransform: any[];
  onChangeStep: (step: number) => void;
}

export default class ReviewDefinition extends Component<ReviewDefinitionProps> {
  constructor(props: ReviewDefinitionProps) {
    super(props);
  }

  render() {
    const {
      transformService,
      sourceIndex,
      fields,
      onGroupSelectionChange,
      selectedAggregations,
      onAggregationSelectionChange,
      onRemoveTransformation,
      onChangeStep,
      aggList,
    } = this.props;

    const aggListItems = () => {
      return aggList.map((item) => {
        return parseAggListItem(item);
      });
    };

    const parseAggListItem = (item: any) => {
      let title = "";
      let field = "";
      if (
        item.type == TRANSFORM_AGG_TYPE.histogram ||
        item.type == TRANSFORM_AGG_TYPE.terms ||
        item.type == TRANSFORM_AGG_TYPE.date_histogram
      ) {
        // is a group
        title = "Group by " + item.type;
        field = item.item[item.type].source_field;
      } else if (item.type == TRANSFORM_AGG_TYPE.scripted_metric) {
        title = item.type + "()";
        field = item.name;
      } else {
        // is an agg
        title = item.type + "()";
        field = item.item[item.type].field;
      }
      return (
        <EuiFlexItem>
          <EuiText size="xs">
            <dt>{title}</dt>
            <dd>{field}</dd>
          </EuiText>
        </EuiFlexItem>
      );
    };

    return (
      <EuiPanel>
        <EuiFlexGroup>
          <EuiFlexItem>
            <EuiTitle size="s">
              <h2>Define transforms</h2>
            </EuiTitle>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <ModalConsumer>
              {() => (
                <ContentPanelActions
                  actions={[
                    {
                      text: "Edit",
                      buttonProps: {
                        onClick: () => onChangeStep(2),
                      },
                    },
                  ]}
                />
              )}
            </ModalConsumer>
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiHorizontalRule margin="xs" />
        <div>
          <EuiFlexGrid columns={4}>{aggListItems()}</EuiFlexGrid>
          <EuiSpacer />
          <EuiAccordion
            id=""
            buttonContent={
              <EuiText size="s">
                <h4>Sample source index and transform result</h4>
              </EuiText>
            }
          >
            <div style={{ padding: "10px" }}>
              <EuiSpacer size="m" />
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
                isReadOnly={true}
              />
            </div>
          </EuiAccordion>
        </div>
      </EuiPanel>
    );
  }
}
