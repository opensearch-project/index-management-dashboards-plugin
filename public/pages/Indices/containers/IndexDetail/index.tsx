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
import { EuiButtonEmpty, EuiCopy, EuiLink } from "@elastic/eui";
import { RouteComponentProps } from "react-router-dom";
import { ROUTES } from "../../../../utils/constants";

export interface IndexDetailModalProps {
  index: string;
  history: RouteComponentProps["history"];
}

export default function IndexDetail(props: IndexDetailModalProps) {
  const { index, history } = props;

  return (
    <>
      <EuiCopy textToCopy={index}>
        {(copy) => <EuiButtonEmpty size="xs" flush="right" iconType="copyClipboard" onClick={copy} color="text" />}
      </EuiCopy>
      <EuiLink onClick={() => history.push(`${ROUTES.INDEX_DETAIL}/${index}`)} data-test-subj={`viewIndexDetailButton-${index}`}>
        {index}
      </EuiLink>
    </>
  );
}
