/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiBasicTable, EuiSpacer } from "@elastic/eui";
import React, { useState, ChangeEvent, useEffect } from "react";
import { IndexService } from "../../../../services";
import { CatIndex } from "../../../../../server/models/interfaces";

interface IndexListProps {
  indices: CatIndex[];
}

const IndexList = ({ indices }: IndexListProps) => {
  return (
    <>
      <EuiSpacer size="l" />

      {/* <EuiBasicTable
      columns={indicesColumns(isDataStreamColumnVisible)}
      isSelectable={true}
      itemId="index"
      items={indices}
      noItemsMessage={<IndexEmptyPrompt filterIsApplied={filterIsApplied} loading={loadingIndices} resetFilters={this.resetFilters} />}
      onChange={this.onTableChange}
      pagination={pagination}
      selection={selection}
      sorting={sorting}
      /> */}
    </>
  );
};

export default IndexList;
