/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import React from "react";
import { EuiHealth } from "@elastic/eui";
import { Link } from "react-router-dom";
import { ROUTES } from "../../../../utils/constants";
import { HEALTH_TO_COLOR } from "../../../Indices/utils/constants";
import { IFinalDetail } from "./interface";

export const OVERVIEW_DISPLAY_INFO: {
  label: string;
  value: string | React.FunctionComponent<{ detail: IFinalDetail }>;
}[] = [
  {
    label: "Index name",
    value: "index",
  },
  {
    label: "Health",
    value: ({ detail }) => {
      const health = detail.health;
      const color = health ? HEALTH_TO_COLOR[health] : "subdued";
      const text = health || detail.status;
      return (
        <EuiHealth color={color} className="indices-health">
          {text}
        </EuiHealth>
      );
    },
  },
  {
    label: "Status",
    value: ({ detail }) => {
      return <span className="camel-first-letter">{detail.status}</span>;
    },
  },
  {
    label: "Creation date",
    value: ({ detail }) => (
      <span>
        {detail.settings?.index?.creation_date ? new Date(parseInt(detail.settings?.index?.creation_date)).toLocaleString() : "-"}
      </span>
    ),
  },
  {
    label: "Total size",
    value: ({ detail }) => <span>{detail["store.size"]}</span>,
  },
  {
    label: "Size of primaries",
    value: ({ detail }) => <span>{detail["pri.store.size"]}</span>,
  },
  {
    label: "Total documents",
    value: ({ detail }) => <span>{detail["docs.count"]}</span>,
  },
  {
    label: "Deleted documents",
    value: ({ detail }) => <span>{detail["docs.deleted"]}</span>,
  },
  {
    label: "Primaries",
    value: "pri",
  },
  {
    label: "Replicas",
    value: "rep",
  },
  {
    label: "Index blocks",
    value: ({ detail }) => {
      const blocks = Object.entries(detail.settings?.index?.blocks || {}).filter(([key, value]) => value === "true");
      if (!blocks.length) {
        return <span>-</span>;
      }

      return (
        <ul style={{ listStyleType: "disc", listStylePosition: "inside" }}>
          {blocks.map(([key, value]) => (
            <li key={key}>{key}</li>
          ))}
        </ul>
      );
    },
  },
  {
    label: "Managed by policy",
    value: ({ detail }) => (
      <span>
        {detail.managedPolicy ? <Link to={`${ROUTES.POLICY_DETAILS}?id=${detail.managedPolicy}`}>{detail.managedPolicy}</Link> : "-"}
      </span>
    ),
  },
];
