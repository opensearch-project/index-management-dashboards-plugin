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
