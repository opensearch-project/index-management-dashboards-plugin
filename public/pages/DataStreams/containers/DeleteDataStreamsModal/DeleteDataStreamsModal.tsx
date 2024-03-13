/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useContext } from "react";
import { CoreStart } from "opensearch-dashboards/public";
import { ServicesContext } from "../../../../services";
import { CoreServicesContext } from "../../../../components/core_services";
import DeleteModal from "../../../../components/DeleteModal";
import { DataSourceMenuContext } from "../../../../services/DataSourceMenuContext";

interface DeleteTemplateModalProps {
  selectedItems: string[];
  visible: boolean;
  onClose: () => void;
  onDelete: () => void;
}

export default function DeleteTemplateModal(props: DeleteTemplateModalProps) {
  const { onClose, visible, selectedItems, onDelete } = props;
  const services = useContext(ServicesContext);
  const coreServices = useContext(CoreServicesContext) as CoreStart;
  const dataSourceMenuProps = useContext(DataSourceMenuContext);
  const { dataSourceId } = dataSourceMenuProps;

  const onConfirm = useCallback(async () => {
    if (services) {
      const result = await services.commonService.apiCaller({
        endpoint: "transport.request",
        data: {
          path: `/_data_stream/${selectedItems.join(",")}`,
          method: "DELETE",
          dataSourceId,
        },
      });
      if (result && result.ok) {
        coreServices.notifications.toasts.addSuccess(`Delete [${selectedItems.join(",")}] successfully`);
        onDelete();
      } else {
        coreServices.notifications.toasts.addDanger(result?.error || "");
      }
    }
  }, [selectedItems, services, coreServices, onDelete]);

  return (
    <DeleteModal
      title="Delete data streams"
      tips="The following data streams will be permanently deleted. The backing indexes belonging to the data streams will also be deleted."
      onConfirm={onConfirm}
      onClose={onClose}
      visible={visible}
      selectedItems={selectedItems}
    />
  );
}
