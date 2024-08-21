/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import {
  EuiSmallButtonIcon,
  EuiContextMenu,
  EuiContextMenuPanelDescriptor,
  EuiFlexGroup,
  EuiFlexItem,
  EuiPopover,
  EuiText,
  EuiToolTip,
} from "@elastic/eui";
import { isNumericMapping } from "../../utils/helpers";
import { GROUP_TYPES, TRANSFORM_AGG_TYPE, TransformAggItem, TransformGroupItem } from "../../../../../models/interfaces";
import HistogramPanel from "./Panels/HistogramPanel";
import PercentilePanel from "./Panels/PercentilePanel";
import ScriptedMetricsPanel from "./Panels/ScriptedMetricsPanel";
import DateHistogramPanel from "./Panels/DateHistogramPanel";
import { IntervalType } from "../../../../utils/constants";

interface TransformOptionsProps {
  name: string;
  type?: string;
  selectedGroupField: TransformGroupItem[];
  onGroupSelectionChange: (selectedFields: TransformGroupItem[], aggItem: TransformAggItem) => void;
  selectedAggregations: any;
  aggList: TransformAggItem[];
  onAggregationSelectionChange: (selectedFields: any, aggItem: TransformAggItem) => void;
}

export default function TransformOptions({
  name,
  type,
  selectedGroupField,
  onGroupSelectionChange,
  selectedAggregations,
  aggList,
  onAggregationSelectionChange,
}: TransformOptionsProps) {
  const isNumeric = isNumericMapping(type);
  const isDate = type == "date";
  const isText = type == "text";

  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [groupSelection] = useState<TransformGroupItem[]>(selectedGroupField);
  const [aggSelection] = useState(selectedAggregations);

  const closePopover = () => {
    setIsPopoverOpen(false);
  };

  const handleGroupSelectionChange = (newAggItem: any, type: TRANSFORM_AGG_TYPE, name: string): void => {
    groupSelection.push(newAggItem);
    onGroupSelectionChange(groupSelection, {
      type,
      name,
      item: newAggItem,
    });
    closePopover();
  };
  const handleAggSelectionChange = (aggItem: TransformAggItem): void => {
    onAggregationSelectionChange(aggSelection, aggItem);
    closePopover();
  };

  const numberPanels: EuiContextMenuPanelDescriptor[] = [
    {
      id: 0,
      title: "Transform options",
      items: [
        {
          name: "Group by histogram",
          panel: 1,
        },
        {
          name: "Group by terms",
          onClick: () => {
            const targetField = `${name}_${GROUP_TYPES.terms}`;
            handleGroupSelectionChange(
              {
                terms: {
                  source_field: name,
                  target_field: targetField,
                },
              },
              TRANSFORM_AGG_TYPE.terms,
              targetField
            );
          },
        },
        {
          name: "Aggregate by sum",
          onClick: () => {
            const aggItem: TransformAggItem = {
              type: TRANSFORM_AGG_TYPE.sum,
              name: `sum_${name}`,
              item: { sum: { field: name } },
            };
            aggSelection[`sum_${name}`] = {
              sum: { field: name },
            };
            handleAggSelectionChange(aggItem);
          },
        },
        {
          name: "Aggregate by max",
          onClick: () => {
            const aggItem: TransformAggItem = {
              type: TRANSFORM_AGG_TYPE.max,
              name: `max_${name}`,
              item: { max: { field: name } },
            };
            aggSelection[`max_${name}`] = {
              max: { field: name },
            };
            handleAggSelectionChange(aggItem);
          },
        },
        {
          name: "Aggregate by min",
          onClick: () => {
            const aggItem: TransformAggItem = {
              type: TRANSFORM_AGG_TYPE.min,
              name: `min_${name}`,
              item: { min: { field: name } },
            };
            aggSelection[`min_${name}`] = {
              min: { field: name },
            };
            handleAggSelectionChange(aggItem);
          },
        },
        {
          name: "Aggregate by avg",
          onClick: () => {
            const aggItem: TransformAggItem = {
              type: TRANSFORM_AGG_TYPE.avg,
              name: `avg_${name}`,
              item: { avg: { field: name } },
            };
            aggSelection[`avg_${name}`] = {
              avg: { field: name },
            };
            handleAggSelectionChange(aggItem);
          },
        },
        {
          name: "Aggregate by count",
          onClick: () => {
            const aggItem: TransformAggItem = {
              type: TRANSFORM_AGG_TYPE.value_count,
              name: `count_${name}`,
              item: { value_count: { field: name } },
            };
            aggSelection[`count_${name}`] = {
              value_count: { field: name },
            };
            handleAggSelectionChange(aggItem);
          },
        },
        {
          name: "Aggregate by percentile",
          panel: 2,
        },
        {
          name: "Aggregate by scripted metrics",
          panel: 3,
        },
      ],
    },
    {
      id: 1,
      title: "Back",
      content: (
        <HistogramPanel name={name} handleGroupSelectionChange={handleGroupSelectionChange} aggList={aggList} closePopover={closePopover} />
      ),
    },
    {
      id: 2,
      title: "Back",
      content: (
        <PercentilePanel
          name={name}
          aggSelection={aggSelection}
          handleAggSelectionChange={handleAggSelectionChange}
          closePopover={closePopover}
        />
      ),
    },
    {
      id: 3,
      title: "Back",
      width: 0.4 * window.innerWidth,
      content: (
        <ScriptedMetricsPanel
          name={name}
          aggSelection={aggSelection}
          handleAggSelectionChange={handleAggSelectionChange}
          closePopover={closePopover}
        />
      ),
    },
  ];
  const datePanels: EuiContextMenuPanelDescriptor[] = [
    {
      id: 0,
      title: "Transform options",
      items: [
        {
          name: "Group by date histogram",
          panel: 1,
        },
        {
          name: "Group by terms",
          onClick: () => {
            const targetField = `${name}_${GROUP_TYPES.terms}`;
            handleGroupSelectionChange(
              {
                terms: {
                  source_field: name,
                  target_field: targetField,
                },
              },
              TRANSFORM_AGG_TYPE.terms,
              targetField
            );
          },
        },
        {
          name: "Aggregate by max",
          onClick: () => {
            const aggItem: TransformAggItem = {
              type: TRANSFORM_AGG_TYPE.max,
              name: `max_${name}`,
              item: { max: { field: name } },
            };
            aggSelection[`max_${name}`] = {
              max: { field: name },
            };
            handleAggSelectionChange(aggItem);
          },
        },
        {
          name: "Aggregate by min",
          onClick: () => {
            const aggItem: TransformAggItem = {
              type: TRANSFORM_AGG_TYPE.min,
              name: `min_${name}`,
              item: { min: { field: name } },
            };
            aggSelection[`min_${name}`] = {
              min: { field: name },
            };
            handleAggSelectionChange(aggItem);
          },
        },
        {
          name: "Aggregate by count",
          onClick: () => {
            const aggItem: TransformAggItem = {
              type: TRANSFORM_AGG_TYPE.value_count,
              name: `count_${name}`,
              item: { value_count: { field: name } },
            };
            aggSelection[`count_${name}`] = {
              value_count: { field: name },
            };
            handleAggSelectionChange(aggItem);
          },
        },
      ],
    },
    {
      id: 1,
      title: "Back",
      items: [
        {
          name: "Fixed interval",
          panel: 2,
        },
        {
          name: "Calendar interval",
          panel: 3,
        },
      ],
    },
    {
      id: 2,
      title: "Back",
      width: 350,
      content: (
        <DateHistogramPanel
          name={name}
          handleGroupSelectionChange={handleGroupSelectionChange}
          aggList={aggList}
          closePopover={closePopover}
          intervalType={IntervalType.FIXED}
        />
      ),
    },
    {
      id: 3,
      title: "Back",
      width: 350,
      content: (
        <DateHistogramPanel
          name={name}
          handleGroupSelectionChange={handleGroupSelectionChange}
          aggList={aggList}
          closePopover={closePopover}
          intervalType={IntervalType.CALENDAR}
        />
      ),
    },
  ];
  const textPanels: EuiContextMenuPanelDescriptor[] = [
    {
      id: 0,
      title: "Transform options",
      items: [
        {
          name: "No options available for text fields",
        },
      ],
    },
  ];
  const defaultPanels: EuiContextMenuPanelDescriptor[] = [
    {
      id: 0,
      title: "Transform options",
      items: [
        {
          name: "Group by terms",
          onClick: () => {
            const targetField = `${name}_${GROUP_TYPES.terms}`;
            handleGroupSelectionChange(
              {
                terms: {
                  source_field: name,
                  target_field: targetField,
                },
              },
              TRANSFORM_AGG_TYPE.terms,
              targetField
            );
          },
        },
        {
          name: "Aggregate by count",
          onClick: () => {
            const aggItem: TransformAggItem = {
              type: TRANSFORM_AGG_TYPE.value_count,
              name: `count_${name}`,
              item: { value_count: { field: name } },
            };
            aggSelection[`count_${name}`] = {
              value_count: { field: name },
            };
            handleAggSelectionChange(aggItem);
          },
        },
      ],
    },
  ];

  const button = (
    <EuiSmallButtonIcon
      iconType="plusInCircleFilled"
      onClick={() => setIsPopoverOpen(!isPopoverOpen)}
      data-test-subj={`${name}OptionsPopover`}
    />
  );

  return (
    <div>
      <EuiFlexGroup justifyContent="spaceBetween">
        <EuiFlexItem className="eui-textTruncate" grow={false}>
          <EuiToolTip content={name}>
            <EuiText size="s">
              <b>{name}</b>
            </EuiText>
          </EuiToolTip>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiPopover
            id="contextMenuExample"
            button={button}
            isOpen={isPopoverOpen}
            closePopover={closePopover}
            panelPaddingSize="none"
            anchorPosition="rightCenter"
          >
            <EuiContextMenu
              initialPanelId={0}
              panels={isNumeric ? numberPanels : isText ? textPanels : isDate ? datePanels : defaultPanels}
            />
          </EuiPopover>
        </EuiFlexItem>
      </EuiFlexGroup>
    </div>
  );
}
