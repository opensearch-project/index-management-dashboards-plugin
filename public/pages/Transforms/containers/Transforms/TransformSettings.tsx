/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from "react";
import { EuiSpacer, EuiText, EuiAccordion, EuiFlexGrid, EuiFlexItem } from "@elastic/eui";
// @ts-ignore
import { htmlIdGenerator } from "@elastic/eui/lib/services";
import { ContentPanel } from "../../../../components/ContentPanel";
import { TransformService } from "../../../../services";
import { DimensionItem, TRANSFORM_AGG_TYPE } from "../../../../../models/interfaces";
import { getErrorMessage } from "../../../../utils/helpers";
import PreviewTransforms from "../../../CreateTransform/components/PreviewTransform";
import { getUISettings } from "../../../../services/Services";

interface TransformSettingsProps {
  transformService: TransformService;
  transformId: string;
  sourceIndex: string;
  transformJson: any;
  groupsShown: DimensionItem[];
  aggregationsShown: any;
}

interface TransformSettingsState {
  previewTransform: any[];
}

export default class TransformSettings extends Component<TransformSettingsProps, TransformSettingsState> {
  constructor(props: TransformSettingsProps) {
    super(props);
    this.state = {
      previewTransform: [],
    };
  }

  previewTransform = async (transform: any): Promise<void> => {
    try {
      const { transformService } = this.props;
      const previewResponse = await transformService.previewTransform(transform);
      if (previewResponse.ok) this.setState({ previewTransform: previewResponse.response.documents });
      else this.context.notifications.toasts.addDanger(`Could not preview transform: ${previewResponse.error}`);
    } catch (err) {
      this.context.notifications.toasts.addDanger(getErrorMessage(err, "Could not load preview transform"));
    }
  };

  componentDidMount = async (): Promise<void> => {
    if (this.props.transformJson.transform) {
      await this.previewTransform({ transform: this.props.transformJson.transform });
    }
  };

  render() {
    const { groupsShown, aggregationsShown } = this.props;

    const groupItems = () => {
      return groupsShown.map((group, index) => {
        return (
          <EuiFlexItem key={index}>
            <EuiText size="xs">
              <dt>Group by {group.aggregationMethod}</dt>
              <dd>{group.field.label}</dd>
            </EuiText>
          </EuiFlexItem>
        );
      });
    };

    const aggItems = () => {
      return Object.keys(aggregationsShown).map((key, index) => {
        let aggregationType = Object.keys(aggregationsShown[key])[0];
        let sourceField = "";
        if (aggregationType != TRANSFORM_AGG_TYPE.scripted_metric) {
          sourceField = aggregationsShown[key][aggregationType].field;
        } else {
          sourceField = key;
        }

        return (
          <EuiFlexItem key={index}>
            <EuiText size="xs">
              <dt>{aggregationType}()</dt>
              <dd>{sourceField}</dd>
            </EuiText>
          </EuiFlexItem>
        );
      });
    };
    const uiSettings = getUISettings();
    const useUpdatedUX = uiSettings.get("home:useNewHomePage");

    return (
      <ContentPanel bodyStyles={{ padding: "initial" }} title="Transform settings" titleSize={useUpdatedUX ? "s" : undefined}>
        <div style={{ paddingLeft: "10px" }}>
          <EuiSpacer size="m" />
          <EuiFlexGrid columns={4}>
            {groupItems()}
            {aggItems()}
          </EuiFlexGrid>
          <EuiSpacer size="m" />
        </div>
        <div style={{ padding: "10px" }}>
          <EuiAccordion id={htmlIdGenerator()()} buttonContent="Sample source index and transform result" onClick={this.onClick}>
            <div style={{ padding: "10px" }}>
              <EuiSpacer size={"m"} />

              {/*// TODO: Use the source data preview table from create workflow */}
              <EuiText>
                <h5>Preview result based on sample data</h5>
              </EuiText>
              <EuiSpacer size={"s"} />
              <PreviewTransforms
                onRemoveTransformation={() => {}}
                previewTransform={this.state.previewTransform}
                aggList={[]}
                isReadOnly={true}
              />
            </div>
          </EuiAccordion>
        </div>
      </ContentPanel>
    );
  }

  onClick = async () => {
    // Only call preview when preview transform is empty
    const { previewTransform } = this.state;
    if (!previewTransform.length) await this.previewTransform({ transform: this.props.transformJson.transform });
  };
}
