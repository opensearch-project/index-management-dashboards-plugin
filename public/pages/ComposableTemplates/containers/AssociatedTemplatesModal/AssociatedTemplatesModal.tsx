/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Dispatch, SetStateAction, useContext, useState } from "react";
import { CoreStart } from "opensearch-dashboards/public";
import { ServicesContext } from "../../../../services";
import { CoreServicesContext } from "../../../../components/core_services";
import {
  EuiSmallButtonEmpty,
  EuiSmallButtonIcon,
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutHeader,
  EuiInMemoryTable,
  EuiLink,
  EuiTitle,
  EuiToolTip,
} from "@elastic/eui";
import { ROUTES } from "../../../../utils/constants";
import { ReactChild } from "react";
import { Modal } from "../../../../components/Modal";
import { submitTemplateChange, useComponentMapTemplate } from "../../utils/hooks";
import { BrowserServices } from "../../../../models/interfaces";

interface AssociatedTemplatesModalProps {
  componentTemplate: string;
  onUnlink?: (unlinkTemplate: string) => void;
  renderProps: (params: { setVisible: Dispatch<SetStateAction<boolean>> }) => ReactChild;
}

export default function AssociatedTemplatesModal(props: AssociatedTemplatesModalProps) {
  const { onUnlink, renderProps, componentTemplate } = props;
  const [visible, setVisible] = useState(false);
  const { loading, componentMapTemplate, reload } = useComponentMapTemplate();
  const services = useContext(ServicesContext) as BrowserServices;
  const coreServices = useContext(CoreServicesContext) as CoreStart;

  return (
    <>
      {renderProps({ setVisible })}
      {visible ? (
        <EuiFlyout onClose={() => setVisible(false)}>
          <EuiFlyoutHeader>
            <EuiTitle>
              <h2>Associated index templates</h2>
            </EuiTitle>
          </EuiFlyoutHeader>
          <EuiFlyoutBody>
            <EuiInMemoryTable
              loading={loading}
              items={(componentMapTemplate[componentTemplate] || []).map((item) => ({
                name: item,
              }))}
              columns={[
                {
                  name: "Templates",
                  field: "name",
                  sortable: true,
                  render: (value: string, record) => (
                    <EuiLink external={false} target="_blank" href={`#${ROUTES.CREATE_TEMPLATE}/${value}`}>
                      {value}
                    </EuiLink>
                  ),
                },
                {
                  name: "Actions",
                  field: "actions",
                  align: "right",
                  render: (value: string, record) => {
                    return (
                      <EuiToolTip content="Unlink">
                        <EuiSmallButtonIcon
                          aria-label={`Unlink from ${record.name}?`}
                          iconType="unlink"
                          onClick={() => {
                            Modal.show({
                              type: "confirm",
                              title: `Unlink from ${record.name}?`,
                              content: (
                                <p style={{ lineHeight: 1.5 }}>
                                  The component {componentTemplate} will be removed from the template {record.name}. This will affect any
                                  new indexes created with the template.
                                </p>
                              ),
                              footer: ["cancel", "confirm"],
                              locale: {
                                confirm: "Unlink",
                              },
                              confirmButtonProps: {
                                color: "danger",
                              },
                              CancelButtonComponent: EuiSmallButtonEmpty,
                              async onOk() {
                                const updateResult = await submitTemplateChange({
                                  templateName: record.name,
                                  commonService: services.commonService,
                                  coreService: coreServices,
                                  transformTemplate(currentTemplate) {
                                    return {
                                      ...currentTemplate,
                                      composed_of: currentTemplate.composed_of?.filter((item) => item !== componentTemplate) || [],
                                    };
                                  },
                                });
                                if (updateResult.ok) {
                                  onUnlink?.(record.name);
                                  reload(true);
                                  coreServices.notifications.toasts.addSuccess(
                                    `${componentTemplate} has been successfully unlinked from ${record.name}.`
                                  );
                                } else {
                                  coreServices.notifications.toasts.addDanger(updateResult.error);
                                  return Promise.reject(updateResult.error);
                                }
                              },
                            });
                          }}
                        />
                      </EuiToolTip>
                    );
                  },
                },
              ]}
              pagination
            />
          </EuiFlyoutBody>
        </EuiFlyout>
      ) : null}
    </>
  );
}
