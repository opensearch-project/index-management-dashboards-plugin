/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiInMemoryTable, EuiIcon, EuiFlyoutHeader, EuiTitle } from "@elastic/eui";
import React from "react";
import { CatIndex } from "../../../../../server/models/interfaces";

interface IndexListProps {
  indices: CatIndex[];
  snapshot: string;
  onClick: (e: React.MouseEvent) => void;
}

const IndexList = ({ indices, snapshot, onClick }: IndexListProps) => {
  indices = indices.filter((index) => index.index.substring(0, 7) !== ".kibana");

  const columns = [
    {
      field: "index",
      name: "Index",
      width: "70%",
      sortable: true,
    },
    {
      field: "store.size",
      name: "Total size",
      sortable: true,
    },
  ];

  const sorting = {
    sort: {
      field: "index",
      direction: "asc",
    },
  };

  return (
    <>
      <EuiFlyoutHeader hasBorder>
        <EuiTitle size="m">
          <h2 id="flyoutTitle">
            <EuiIcon onClick={onClick} size="xl" color="primary" type="arrowLeft" style={{ cursor: "pointer", padding: "0 0 5px 0" }} />{" "}
            Indices in snapshot {snapshot} ({indices.length})
          </h2>
        </EuiTitle>
      </EuiFlyoutHeader>
      <div style={{ padding: "1rem 1.5rem" }}>
        <EuiInMemoryTable tableCaption="Indices" items={indices} columns={columns} tableLayout="auto" pagination={true} sorting={sorting} />
      </div>
    </>
  );
};

export default IndexList;
