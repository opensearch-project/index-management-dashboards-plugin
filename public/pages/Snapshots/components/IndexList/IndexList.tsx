/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiInMemoryTable, EuiIcon, EuiFlyoutHeader, EuiTitle } from "@elastic/eui";
import React from "react";
import { CatSnapshotIndex } from "../../../../../server/models/interfaces";

interface IndexListProps {
  indices: CatSnapshotIndex[];
  snapshot: string;
  title: string
  onClick: (e: React.MouseEvent) => void;
}

const IndexList = ({ indices, snapshot, onClick, title }: IndexListProps) => {
  indices = indices.filter((index) => index.index?.substring(0, 7) !== ".kibana");

  const columns = [
    {
      field: "index",
      name: "Index",
      width: "100%",
      truncateText: true,
      sortable: true,
    }
  ];

  return (
    <>
      <EuiFlyoutHeader hasBorder>
        <EuiTitle size="m">
          <h2 id="flyoutTitle">
            <EuiIcon onClick={onClick} size="xl" color="primary" type="arrowLeft" style={{ cursor: "pointer", padding: "0 0 5px 0" }} />{" "}
            {title} {snapshot} ({indices.length})
          </h2>
        </EuiTitle>
      </EuiFlyoutHeader>
      <div style={{ padding: "1rem 1.5rem" }}>
        <EuiInMemoryTable tableCaption="Indices" items={indices} columns={columns} tableLayout="auto" pagination={true} sorting={true} />
      </div>
    </>
  );
};

export default IndexList;
