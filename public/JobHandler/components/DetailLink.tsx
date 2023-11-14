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
import { EuiLink } from "@elastic/eui";
import { ROUTES } from "../../utils/constants";
import { FormatResourceWithClusterInfo, FormatResourceWithClusterInfoProps } from "./FormatResourceWithClusterInfo";

export const DetailLink = (props: FormatResourceWithClusterInfoProps & { index: string; writingIndex?: string }) => {
  return (
    <EuiLink href={`#${ROUTES.INDEX_DETAIL}/${props.writingIndex ? props.writingIndex : props.index}`}>
      <FormatResourceWithClusterInfo resource={props.index} clusterInfo={props.clusterInfo} />
    </EuiLink>
  );
};
