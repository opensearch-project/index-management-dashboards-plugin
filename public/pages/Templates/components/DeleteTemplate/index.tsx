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
import React, { useState } from "react";
import { EuiButtonIcon, EuiToolTip } from "@elastic/eui";
import DeleteIndexModal from "../../containers/DeleteTemplatesModal";
import { ITemplate } from "../../interface";

export interface DeleteTemplateProps {
  selectedItems: ITemplate[];
  onDelete: () => void;
}

export default function DeleteTemplate(props: DeleteTemplateProps) {
  const { selectedItems, onDelete } = props;
  const [deleteIndexModalVisible, setDeleteIndexModalVisible] = useState(false);

  const onDeleteIndexModalClose = () => {
    setDeleteIndexModalVisible(false);
  };

  return (
    <>
      <EuiToolTip content="Delete template">
        <EuiButtonIcon
          aria-label="Delete template"
          color="danger"
          iconType="trash"
          onClick={() => setDeleteIndexModalVisible(true)}
          className="icon-hover-danger"
        />
      </EuiToolTip>
      <DeleteIndexModal
        selectedItems={selectedItems.map((item) => item.name)}
        visible={deleteIndexModalVisible}
        onClose={onDeleteIndexModalClose}
        onDelete={() => {
          onDeleteIndexModalClose();
          onDelete();
        }}
      />
    </>
  );
}
