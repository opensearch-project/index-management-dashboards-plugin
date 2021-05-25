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
import { EuiSpacer, EuiText, EuiAccordion, EuiFlexGrid, EuiFlexItem } from "@elastic/eui";
// @ts-ignore
import { htmlIdGenerator } from "@elastic/eui/lib/services";
import { ContentPanel } from "../../../../components/ContentPanel";
import { TransformService } from "../../../../services";
import { DimensionItem } from "../../../../../models/interfaces";
import { getErrorMessage } from "../../../../utils/helpers";
import PreviewTransforms from "../../../CreateTransform/components/PreviewTransform";

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

  // getMappings = async (srcIndex: string): Promise<void> => {
  //   if (!srcIndex.length) return;
  //   try {
  //     const { rollupService } = this.props;
  //     const response = await rollupService.getMappings(srcIndex);
  //     if (response.ok) {
  //       let allMappings: FieldItem[][] = [];
  //       const mappings = response.response;
  //       //Push mappings array to allMappings 2D array first
  //       for (let index in mappings) {
  //         allMappings.push(parseFieldOptions("", mappings[index].mappings.properties));
  //       }
  //       //Find intersect from all mappings
  //       const fields = allMappings.reduce((mappingA, mappingB) =>
  //         mappingA.filter((itemA) => mappingB.some((itemB) => compareFieldItem(itemA, itemB)))
  //       );
  //       this.setState({ mappings, fields, allMappings });
  //     } else {
  //       this.context.notifications.toasts.addDanger(`Could not load fields: ${response.error}`);
  //     }
  //   } catch (err) {
  //     this.context.notifications.toasts.addDanger(getErrorMessage(err, "Could not load fields"));
  //   }
  // };

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
    await this.previewTransform({ transform: this.props.transformJson.transform });
  };

  render() {
    const { groupsShown, aggregationsShown } = this.props;

    const groupItems = () => {
      console.log(groupsShown);
      return groupsShown.map((group) => {
        return (
          <EuiFlexItem>
            <EuiText size="xs">
              <dt>Group by {group.aggregationMethod}</dt>
              <dd>{group.field.label}</dd>
            </EuiText>
          </EuiFlexItem>
        );
      });
    };

    const aggItems = () => {
      return Object.keys(aggregationsShown).map((key) => {
        let aggregationType = Object.keys(aggregationsShown[key])[0];
        let sourceField = aggregationsShown[key][aggregationType].field;

        return (
          <EuiFlexItem>
            <EuiText size="xs">
              <dt>{aggregationType}()</dt>
              <dd>{sourceField}</dd>
            </EuiText>
          </EuiFlexItem>
        );
      });
    };

    return (
      <ContentPanel bodyStyles={{ padding: "initial" }} title="Transform settings" titleSize="m">
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
              {/*<DefineTransforms*/}
              {/*  {...this.props}*/}
              {/*  isReadOnly={true}*/}
              {/*  notifications={this.context.notifications}*/}
              {/*  fields={[]}*/}
              {/*  selectedGroupField={[]}*/}
              {/*  onGroupSelectionChange={()=>()}*/}
              {/*  selectedAggregations={{}}*/}
              {/*  onAggregationSelectionChange={()=> ()}*/}
              {/*  previewTransform={[]}*/}
              {/*/>*/}
              <EuiText>
                <h5>Preview result based on sample data</h5>
              </EuiText>
              <EuiSpacer size={"s"} />
              <PreviewTransforms previewTransform={this.state.previewTransform} aggList={[]} isReadOnly={true} />
            </div>
          </EuiAccordion>
        </div>
      </ContentPanel>
    );
  }

  onClick = async () => {
    await this.previewTransform({ transform: this.props.transformJson.transform });
  };
}
