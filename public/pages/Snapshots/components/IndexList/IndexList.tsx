/*
 *   Copyright OpenSearch Contributors
 *
 *   Licensed under the Apache License, Version 2.0 (the "License").
 *   You may not use this file except in compliance with the License.
 *   A copy of the License is located at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   or in the "license" file accompanying this file. This file is distributed
 *   on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 *   express or implied. See the License for the specific language governing
 *   permissions and limitations under the License.
 */

import { EuiInMemoryTable, EuiIcon, EuiFlyoutHeader, EuiTitle } from "@elastic/eui";
import React from "react";
import { Column } from "../../../../models/interfaces";
import { IndexItem } from "../../../../models/interfaces";

interface IndexListProps {
  indices: IndexItem[];
  snapshot: string;
  title: string;
  columns: Column[];
  onClick: (e: React.MouseEvent) => void;
}

const IndexList = ({ indices, snapshot, onClick, title, columns }: IndexListProps) => {
  indices = indices.filter((index) => index.index.substring(0, 7) !== ".kibana");

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
        <EuiInMemoryTable tableCaption="Indices" items={indices} columns={columns} tableLayout="fixed" pagination={true} sorting={true} />
      </div>
    </>
  );
};

export default IndexList;
