/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import React from "react";
import { ClusterInfo } from "../../models/interfaces";

export interface FormatResourceWithClusterInfoProps {
  clusterInfo?: ClusterInfo;
}

export const FormatResourceWithClusterInfo = (props: { resource: string } & FormatResourceWithClusterInfoProps) => {
  return props.clusterInfo?.cluster_name ? (
    <>
      {props.clusterInfo.cluster_name}/{props.resource}
    </>
  ) : (
    <>{props.resource}</>
  );
};

export const FormatResourcesWithClusterInfo = (props: { resources: string[] } & FormatResourceWithClusterInfoProps) => {
  return (
    <>
      {props.resources.map((item, index) => (
        <span key={item}>
          {index > 0 && ", "}
          <FormatResourceWithClusterInfo resource={item} clusterInfo={props.clusterInfo} />
        </span>
      ))}
    </>
  );
};
