/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useContext } from "react";
import { EuiButtonEmpty, EuiCopy, EuiLink } from "@elastic/eui";
import { RouteComponentProps } from "react-router-dom";
import { ROUTES } from "../../../../utils/constants";
import { DataSourceMenuContext } from "../../../../services/DataSourceMenuContext";

export interface IndexDetailModalProps {
  index: string;
  history: RouteComponentProps["history"];
}

export default function IndexDetail(props: IndexDetailModalProps) {
  const dataSourceMenuProps = useContext(DataSourceMenuContext);
  const { dataSourceId, dataSourceLabel, multiDataSourceEnabled } = dataSourceMenuProps;
  const { index, history } = props;

  return (
    <>
      <EuiCopy textToCopy={index}>
        {(copy) => <EuiButtonEmpty size="xs" flush="right" iconType="copyClipboard" onClick={copy} color="text"></EuiButtonEmpty>}
      </EuiCopy>
      <EuiLink
        onClick={() => {
          multiDataSourceEnabled
            ? history.push(`${ROUTES.INDEX_DETAIL}/${index}?dataSourceId=${dataSourceId}&dataSourceLabel=${dataSourceLabel}`)
            : history.push(`${ROUTES.INDEX_DETAIL}/${index}`);
        }}
        data-test-subj={`viewIndexDetailButton-${index}`}
      >
        {index}
      </EuiLink>
    </>
  );
}
