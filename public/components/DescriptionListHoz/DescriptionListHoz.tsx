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
