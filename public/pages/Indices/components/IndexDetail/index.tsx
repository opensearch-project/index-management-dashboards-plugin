/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { EuiButtonEmpty, EuiCopy } from "@elastic/eui";
import { IndexItem } from "../../../../../models/interfaces";
import { Modal } from "../../../../components/Modal";
import IndicesActions from "../IndicesActions";
import { ManagedCatIndex } from "../../../../../server/models/interfaces";

export interface IndexDetailModalProps {
  index: string;
  onDelete?: () => void;
  record: ManagedCatIndex;
}

export default function IndexDetail(props: IndexDetailModalProps) {
  // const { detail, visible } = props;
  const { index, record, onDelete } = props;
  const [visible, setVisible] = useState(false);
  const [detail, setDetail] = useState({} as IndexItem);
  return (
    <>
      <EuiCopy textToCopy={index}>
        {(copy) => <EuiButtonEmpty size="xs" flush="right" iconType="copyClipboard" onClick={copy} color="text"></EuiButtonEmpty>}
      </EuiCopy>
      <EuiButtonEmpty onClick={() => setVisible(true)} data-test-subj={`view-index-detail-button-${index}`}>
        {index}
      </EuiButtonEmpty>
      <Modal.SimpleModal
        visible={visible}
        maxWidth={false}
        style={{
          width: "60vw",
        }}
        onClose={() => setVisible(false)}
        title={
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>{index}</span>
            <IndicesActions selectedItems={[record]} onDelete={onDelete} />
          </div>
        }
      />
    </>
  );
}
