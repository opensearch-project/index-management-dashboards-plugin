/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { EuiDataGrid, EuiDataGridColumn, EuiText, EuiToolTip } from "@elastic/eui";
import PreviewEmptyPrompt from "../PreviewEmptyPrompt";
import PreviewOptions from "../PreviewOptions";
import { TransformAggItem } from "../../../../../models/interfaces";
import { renderTime } from "../../../Transforms/utils/helpers";

interface PreviewTransformProps {
  previewTransform: any[];
  aggList: TransformAggItem[];
  onEditTransformation: (oldName: string, newName: string) => void;
  onRemoveTransformation: (name: string) => void;
  isReadOnly: boolean;
}

export default function PreviewTransform({
  previewTransform,
  aggList,
  onEditTransformation,
  onRemoveTransformation,
  isReadOnly,
}: PreviewTransformProps) {
  const [previewColumns, setPreviewColumns] = useState<EuiDataGridColumn[]>([]);
  const [visiblePreviewColumns, setVisiblePreviewColumns] = useState(() => previewColumns.map(({ id }) => id).slice(0, 5));

  const renderPreviewCellValue = ({ rowIndex, columnId }) => {
    if (previewTransform.hasOwnProperty(rowIndex)) {
      if (previewTransform[rowIndex][columnId]) {
        // Case for date histogram type
        // TODO: Check if there's a better way to check for date histogram types
        if (columnId.includes("date_histogram")) {
          return renderTime(previewTransform[rowIndex][columnId]);
        }

        // Case for percentile
        return typeof previewTransform[rowIndex][columnId] !== ("string" || "number")
          ? JSON.stringify(previewTransform[rowIndex][columnId])
          : previewTransform[rowIndex][columnId];
      }
    }
    return "-";
  };

  const updatePreviewColumns = (): void => {
    if (isReadOnly) {
      if (previewTransform.length) {
        const tempCol: EuiDataGridColumn[] = [];
        for (const [key, value] of Object.entries(previewTransform[0])) {
          tempCol.push({
            id: key,
            display: (
              <div>
                <EuiToolTip content={key}>
                  <EuiText size="s">
                    <b>{key}</b>
                  </EuiText>
                </EuiToolTip>
              </div>
            ),
            actions: {
              showHide: false,
              showMoveLeft: false,
              showMoveRight: false,
              showSortAsc: false,
              showSortDesc: false,
            },
          });
        }
        setPreviewColumns(tempCol);
        setVisiblePreviewColumns(() => tempCol.map(({ id }) => id));
      }
    } else {
      if (aggList.length) {
        const tempCol: EuiDataGridColumn[] = [];
        aggList.map((aggItem) => {
          tempCol.push({
            id: aggItem.name,
            display: (
              <PreviewOptions
                name={aggItem.name}
                aggList={aggList}
                onEditTransformation={onEditTransformation}
                onRemoveTransformation={onRemoveTransformation}
              />
            ),
            actions: {
              showHide: false,
              showMoveLeft: false,
              showMoveRight: false,
              showSortAsc: false,
              showSortDesc: false,
            },
          });
        });

        setPreviewColumns(tempCol);
        setVisiblePreviewColumns(() => tempCol.map(({ id }) => id));
      }
    }
  };

  React.useEffect(
    () => {
      updatePreviewColumns();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [previewTransform, aggList]
  );

  return (!isReadOnly && aggList.length) || (isReadOnly && previewTransform.length) ? (
    <EuiDataGrid
      style={{ overflow: "scroll", width: "100%" }}
      aria-label="Preview transforms"
      columns={previewColumns}
      columnVisibility={{ visibleColumns: visiblePreviewColumns, setVisibleColumns: setVisiblePreviewColumns }}
      rowCount={previewTransform.length}
      renderCellValue={renderPreviewCellValue}
      toolbarVisibility={{
        showColumnSelector: true,
        showStyleSelector: false,
        showSortSelector: false,
        showFullScreenSelector: false,
      }}
      gridStyle={{ rowHover: isReadOnly ? "none" : "highlight" }}
    />
  ) : (
    <PreviewEmptyPrompt isReadOnly={isReadOnly} />
  );
}
