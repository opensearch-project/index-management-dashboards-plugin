/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useContext, useEffect, useState } from "react";
import { CoreStart } from "opensearch-dashboards/public";
import { ServicesContext } from "../../../../services";
import { CoreServicesContext } from "../../../../components/core_services";
import {
  EuiSmallButton,
  EuiButtonEmpty,
  EuiLoadingSpinner,
  EuiModal,
  EuiModalBody,
  EuiModalFooter,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiSpacer,
} from "@elastic/eui";
import { submitTemplateChange, useComponentMapTemplate } from "../../utils/hooks";
import { Link } from "react-router-dom";
import { ROUTES } from "../../../../utils/constants";
import { AllBuiltInComponents } from "../../../../components/FormGenerator";
import { ServerResponse } from "../../../../../server/models/types";

export interface DeleteTemplateModalProps {
  selectedItems: string[];
  visible: boolean;
  onClose: () => void;
  onDelete: () => void;
}

export default function DeleteTemplateModal(props: DeleteTemplateModalProps) {
  const { onClose, visible, selectedItems, onDelete } = props;
  const services = useContext(ServicesContext);
  const coreServices = useContext(CoreServicesContext) as CoreStart;
  const { componentMapTemplate, loading } = useComponentMapTemplate();
  const [checked, setChecked] = useState(false);
  const linkedIndexItemCount = componentMapTemplate[selectedItems[0]]?.length || 0;

  const onConfirm = async () => {
    if (services) {
      let result: ServerResponse<any> = {
        ok: true,
        response: {},
      };
      if (linkedIndexItemCount) {
        result = await Promise.all(
          componentMapTemplate[selectedItems[0]].map((item) =>
            submitTemplateChange({
              coreService: coreServices,
              commonService: services.commonService,
              templateName: item,
              transformTemplate(currentTemplate) {
                return {
                  ...currentTemplate,
                  composed_of: currentTemplate.composed_of?.filter((item) => item !== selectedItems[0]) || [],
                };
              },
            })
          )
        ).then((result) => ({
          response: {},
          ok: result.every((item) => item.ok),
          error: result
            .filter((item) => !item.ok)
            .map((item) => item.error)
            .join(", "),
        }));
      }
      if (result.ok) {
        result = await services.commonService.apiCaller({
          endpoint: "transport.request",
          data: {
            path: `/_component_template/${selectedItems.join(",")}`,
            method: "DELETE",
          },
        });
      }
      if (result && result.ok) {
        coreServices.notifications.toasts.addSuccess(`Delete [${selectedItems.join(", ")}] successfully`);
        onDelete();
      } else {
        coreServices.notifications.toasts.addDanger(result?.error || "");
      }
    }
  };

  useEffect(() => {
    if (visible) {
      setChecked(false);
    }
  }, [visible]);

  if (!visible) {
    return null;
  }

  return (
    <EuiModal onClose={onClose}>
      <EuiModalHeader>
        <EuiModalHeaderTitle>Delete {selectedItems[0]}</EuiModalHeaderTitle>
      </EuiModalHeader>

      <EuiModalBody>
        {loading ? (
          <EuiLoadingSpinner size="xl" />
        ) : (
          <div style={{ lineHeight: 1.5 }}>
            <p>
              {!linkedIndexItemCount
                ? "The following component template will be permanently deleted. This action cannot be undone."
                : `The component template ${selectedItems.join(
                    ", "
                  )} will be permanently deleted. The component template will be unlinked from ${linkedIndexItemCount} index templates:`}
            </p>
            {!linkedIndexItemCount ? (
              <ul style={{ listStyleType: "disc", listStylePosition: "inside" }}>
                {selectedItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : null}
            {linkedIndexItemCount ? (
              <>
                {componentMapTemplate[selectedItems[0]]?.map((item, index) => (
                  <span key={item}>
                    {index > 0 && ", "}
                    <Link target="_blank" to={`${ROUTES.CREATE_TEMPLATE}/${item}`}>
                      {item}
                    </Link>
                  </span>
                ))}
                <EuiSpacer />
                <AllBuiltInComponents.CheckBox
                  data-test-subj="UnlinkConfirmCheckBox"
                  label={`Unlink index templates and delete ${selectedItems.join(", ")}`}
                  value={checked}
                  onChange={(checked) => setChecked(checked)}
                />
              </>
            ) : null}
          </div>
        )}
      </EuiModalBody>

      <EuiModalFooter>
        <EuiButtonEmpty disabled={loading} isLoading={loading} data-test-subj="deletaCancelButton" onClick={onClose}>
          Cancel
        </EuiButtonEmpty>
        {!linkedIndexItemCount ? (
          <EuiSmallButton
            disabled={loading}
            isLoading={loading}
            data-test-subj="deleteConfirmButton"
            onClick={onConfirm}
            fill
            color="danger"
          >
            Delete
          </EuiSmallButton>
        ) : null}
        {linkedIndexItemCount ? (
          <EuiSmallButton
            data-test-subj="deleteConfirmUnlinkButton"
            onClick={onConfirm}
            disabled={!checked || loading}
            isLoading={loading}
            fill
            color="danger"
          >
            Apply changes
          </EuiSmallButton>
        ) : null}
      </EuiModalFooter>
    </EuiModal>
  );
}
