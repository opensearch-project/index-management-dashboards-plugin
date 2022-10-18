/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { EuiCodeEditor, EuiConfirmModal, EuiCodeEditorProps } from "@elastic/eui";

interface JSONEditorProps extends Partial<EuiCodeEditorProps> {
  value: string;
  onChange?: (value: JSONEditorProps["value"]) => void;
}

const JSONEditor: React.SFC<JSONEditorProps> = ({ value, onChange }) => {
  const [tempEditorValue, setTempEditorValue] = useState(value);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);

  return (
    <>
      <EuiCodeEditor
        mode="json"
        placeholder="The number of replica shards each primary shard should have."
        value={tempEditorValue}
        onChange={setTempEditorValue}
        onBlur={(e) => {
          try {
            JSON.parse(tempEditorValue);
            onChange(tempEditorValue);
          } catch (e) {
            setConfirmModalVisible(true);
          }
        }}
      />
      {confirmModalVisible ? (
        <EuiConfirmModal
          title="Format validate error"
          onCancel={() => setConfirmModalVisible(false)}
          onConfirm={() => {
            onChange(value);
            setTempEditorValue(value);
            setConfirmModalVisible(false);
          }}
          cancelButtonText="Close to modify"
          confirmButtonText="Continue with data reset"
        >
          Your input does not match the validation of json format, please modify the error line with error aside
        </EuiConfirmModal>
      ) : null}
    </>
  );
};

export default JSONEditor;
