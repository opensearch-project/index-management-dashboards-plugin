/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
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
