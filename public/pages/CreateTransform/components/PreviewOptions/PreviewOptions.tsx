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

import React from "react";
import {
  EuiButtonIcon,
  EuiContextMenu,
  EuiContextMenuPanelDescriptor,
  EuiFlexGroup,
  EuiFlexItem,
  EuiPopover,
  EuiText,
  EuiToolTip,
} from "@elastic/eui";
import { useState } from "react";

interface PreviewOptionsProps {
  name: string;
  onRemoveTransformation: (name: string) => void;
}

export default function PreviewOptions({ name, onRemoveTransformation }: PreviewOptionsProps) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const closePopover = () => {
    setIsPopoverOpen(false);
  };

  const button = <EuiButtonIcon color="danger" iconType="crossInACircleFilled" onClick={() => setIsPopoverOpen(!isPopoverOpen)} />;

  const panels: EuiContextMenuPanelDescriptor[] = [
    {
      id: 0,
      title: "",
      items: [
        {
          name: "Remove transformation",
          onClick: () => {
            // Remove this transform
            onRemoveTransformation(name);
          },
        },
      ],
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
