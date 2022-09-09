/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiInMemoryTable, EuiIcon, EuiSpacer, EuiFlyoutHeader, EuiTitle, Pagination } from "@elastic/eui";
import React, { useState, ChangeEvent, useEffect, MouseEvent } from "react";
import { CatIndex } from "../../../../../server/models/interfaces";

interface IndexListProps {
  indices: CatIndex[];
  snapshot: string;
  onClick: (e: React.MouseEvent) => void;
}

const IndexList = ({ indices, snapshot, onClick }: IndexListProps) => {
  const columns = [
    {
      field: "index",
      name: "Index",
    },
    {
      field: "store.size",
      name: "Total size",
    },
  ];

  return (
    <>
      <EuiFlyoutHeader hasBorder>
        <EuiTitle size="m">
          <h2 id="flyoutTitle">
            <EuiIcon onClick={onClick} size="xl" color="primary" type="arrowLeft" style={{ cursor: "pointer" }} /> Indices in snapshot{" "}
            {snapshot}
          </h2>
        </EuiTitle>
      </EuiFlyoutHeader>
      <div style={{ padding: "25px 25px" }}>
        <EuiInMemoryTable tableCaption="Indices" items={indices} columns={columns} tableLayout="auto" pagination={true} />
      </div>
    </>
  );
};

export default IndexList;
