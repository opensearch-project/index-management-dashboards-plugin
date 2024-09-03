/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import { EuiDescriptionList, EuiDescriptionListProps, EuiFlexGrid, EuiFlexGridProps, EuiFlexItem } from "@elastic/eui";
import React from "react";

const DisplayItem = (
  props: {
    listItem: Required<EuiDescriptionListProps>["listItems"][number];
  } & Omit<EuiDescriptionListProps, "listItems">
) => {
  const { listItem, ...others } = props;
  return (
    <EuiDescriptionList
      compressed={true}
      listItems={[
        {
          ...listItem,
          description: listItem.description === undefined || listItem.description === null ? "-" : listItem.description,
        },
      ]}
      {...others}
    />
  );
};

export default function DescriptionListHoz(props: EuiDescriptionListProps & Pick<EuiFlexGridProps, "columns">) {
  const { listItems, columns = 4, ...others } = props;
  return (
    <EuiFlexGrid columns={columns}>
      {listItems?.map((item) => (
        <EuiFlexItem key={item.title as string}>
          <DisplayItem listItem={item} {...others} />
        </EuiFlexItem>
      ))}
    </EuiFlexGrid>
  );
}
