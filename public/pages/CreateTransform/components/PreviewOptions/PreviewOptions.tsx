/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
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
import { useState } from "react";
import EditTransformPanel from "./Panels/EditTransformPanel";
import { TransformAggItem } from "../../../../../models/interfaces";

interface PreviewOptionsProps {
  name: string;
  aggList: TransformAggItem[];
  onEditTransformation: (oldName: string, newName: string) => void;
  onRemoveTransformation: (name: string) => void;
}

export default function PreviewOptions({ name, aggList, onEditTransformation, onRemoveTransformation }: PreviewOptionsProps) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const closePopover = () => {
    setIsPopoverOpen(false);
  };

  const button = <EuiSmallButtonIcon color="primary" iconType="pencil" onClick={() => setIsPopoverOpen(!isPopoverOpen)} />;

  const panels: EuiContextMenuPanelDescriptor[] = [
    {
      id: 0,
      title: "",
      items: [
        {
          name: "Edit transformation",
          panel: 1,
        },
        {
          name: "Remove transformation",
          onClick: () => {
            // Remove this transform
            onRemoveTransformation(name);
          },
        },
      ],
    },
    {
      id: 1,
      title: "Back",
      content: <EditTransformPanel name={name} aggList={aggList} onEditTransformation={onEditTransformation} closePopover={closePopover} />,
    },
  ];

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
            id="previewColumnPopover"
            button={button}
            isOpen={isPopoverOpen}
            closePopover={closePopover}
            panelPaddingSize="none"
            anchorPosition="rightCenter"
          >
            <EuiContextMenu initialPanelId={0} panels={panels} />
          </EuiPopover>
        </EuiFlexItem>
      </EuiFlexGroup>
    </div>
  );
}
