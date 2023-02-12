import React, { useContext, useEffect, useState } from "react";
import { EuiBasicTable, EuiHealth, EuiLink, EuiSpacer } from "@elastic/eui";
import { ServicesContext } from "../../../../services";
import { BrowserServices } from "../../../../models/interfaces";
import { ManagedCatIndex } from "../../../../../server/models/interfaces";
import { DataStreamInEdit, SubDetailProps } from "../../interface";
import { ROUTES } from "../../../../utils/constants";
import { ContentPanel } from "../../../../components/ContentPanel";

const renderNumber = (value: string) => {
  return value || "-";
};

export const HEALTH_TO_COLOR: {
  [health: string]: string;
  green: string;
  yellow: string;
  red: string;
} = {
  green: "success",
  yellow: "warning",
  red: "danger",
};

export default function BackingIndices(props: SubDetailProps) {
  const { field } = props;
  const values: DataStreamInEdit = field.getValues();
  const services = useContext(ServicesContext) as BrowserServices;
  const [indexes, setIndexes] = useState<ManagedCatIndex[]>([]);
  useEffect(() => {
    if (values.name) {
      services.indexService
        .getIndices({
          from: 0,
          size: 999,
          search: values.name,
          terms: values.name,
          sortField: "index",
          sortDirection: "desc",
          showDataStreams: true,
        })
        .then((result) => {
          if (result && result.ok) {
            setIndexes(result.response.indices.filter((item) => item.data_stream === values.name));
          }
        });
    }
  }, [values.name]);
  const writingIndex = (values.indices || [])[(values.indices?.length || 0) - 1]?.index_name;
  return (
    <ContentPanel title="Backing indexes" titleSize="s">
      <EuiSpacer size="s" />
      <EuiBasicTable
        pagination={undefined}
        items={indexes}
        columns={[
          {
            field: "index",
            name: "Index",
            sortable: true,
            truncateText: false,
            textOnly: true,
            width: "250px",
            render: (index: string) => {
              return <EuiLink href={`#${ROUTES.INDEX_DETAIL}/${index}`}>{index}</EuiLink>;
            },
          },
          {
            field: "health",
            name: "Health",
            sortable: true,
            truncateText: true,
            textOnly: true,
            render: (health: string, item: ManagedCatIndex) => {
              const color = health ? HEALTH_TO_COLOR[health] : "subdued";
              const text = health || item.status;
              return (
                <EuiHealth color={color} className="indices-health">
                  {text}
                </EuiHealth>
              );
            },
          },
          {
            field: "managed",
            name: "Managed by policy",
            sortable: false,
            truncateText: true,
            textOnly: true,
            width: "140px",
            render: renderNumber,
          },
          {
            field: "status",
            name: "Status",
            sortable: true,
            truncateText: true,
            textOnly: true,
            render: (status: string, item: ManagedCatIndex) => {
              return <span className="camel-first-letter">{item.extraStatus || status}</span>;
            },
          },
          {
            field: "store.size",
            name: "Total size",
            sortable: true,
            truncateText: true,
            textOnly: true,
            dataType: "number",
            render: renderNumber,
          },
          {
            field: "pri.store.size",
            name: "Size of primaries",
            sortable: true,
            truncateText: true,
            textOnly: true,
            dataType: "number",
            render: renderNumber,
          },
          {
            field: "docs.count",
            name: "Total documents",
            sortable: true,
            truncateText: true,
            textOnly: true,
            dataType: "number",
            render: (count: string) => <span title={count}>{count || "-"}</span>,
          },
          {
            field: "docs.deleted",
            name: "Deleted documents",
            sortable: true,
            truncateText: true,
            textOnly: true,
            dataType: "number",
            render: (deleted: string) => <span title={deleted}>{deleted || "-"}</span>,
          },
          {
            field: "pri",
            name: "Primaries",
            sortable: true,
            truncateText: true,
            textOnly: true,
            dataType: "number",
          },
          {
            field: "rep",
            name: "Replicas",
            sortable: true,
            truncateText: true,
            textOnly: true,
            dataType: "number",
          },
          {
            field: "rep",
            name: "Writing index",
            textOnly: true,
            render: (value: string, record: ManagedCatIndex) => {
              return record.index === writingIndex ? "Yes" : "No";
            },
          },
        ]}
      />
    </ContentPanel>
  );
}
