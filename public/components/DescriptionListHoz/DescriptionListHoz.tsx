import { EuiDescriptionList, EuiDescriptionListProps, EuiFlexGroup, EuiFlexItem } from "@elastic/eui";
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

export default function DescriptionListHoz(props: EuiDescriptionListProps) {
  const { listItems, ...others } = props;
  return (
    <EuiFlexGroup>
      {listItems?.map((item) => (
        <EuiFlexItem key={item.title as string}>
          <DisplayItem listItem={item} {...others} />
        </EuiFlexItem>
      ))}
    </EuiFlexGroup>
  );
}
