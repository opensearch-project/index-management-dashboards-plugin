/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Dispatch, SetStateAction, useContext, useState } from "react";
import { CoreStart } from "opensearch-dashboards/public";
import { ServicesContext } from "../../../../services";
import { CoreServicesContext } from "../../../../components/core_services";
import {
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
import { BrowserServices } from "../../../../models/interfaces";
import { TemplateItemRemote } from "../../../../../models/interfaces";
import { ITemplate } from "../../interface";
import { getTemplate } from "../../../ComposableTemplates/utils/hooks";

export interface AssociatedComponentsModalProps {
  template: ITemplate;
  onUnlink?: (unlinkTemplate: string) => void;
  renderProps: (params: { setVisible: Dispatch<SetStateAction<boolean>> }) => ReactChild;
}

export default function AssociatedComponentsModal(props: AssociatedComponentsModalProps) {
  const { onUnlink, renderProps, template } = props;
  const [visible, setVisible] = useState(false);
  const services = useContext(ServicesContext) as BrowserServices;
  const coreServices = useContext(CoreServicesContext) as CoreStart;

  return (
    <>
      {renderProps({ setVisible })}
      {visible ? (
        <EuiFlyout onClose={() => setVisible(false)}>
          <EuiFlyoutHeader>
            <EuiTitle>
              <h2>Associated component templates</h2>
            </EuiTitle>
          </EuiFlyoutHeader>
          <EuiFlyoutBody>
            <EuiInMemoryTable
              pagination
              items={(template.templateDetail?.composed_of || []).map((item) => ({
                name: item,
              }))}
              columns={[
                {
                  name: "component template",
                  field: "name",
                  sortable: true,
                  render: (value: string, record) => (
                    <EuiLink external={false} target="_blank" href={`#${ROUTES.CREATE_COMPOSABLE_TEMPLATE}/${value}`}>
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
                          aria-label={`Unlink ${record.name}?`}
                          iconType="unlink"
                          onClick={() => {
                            Modal.show({
                              type: "confirm",
                              title: `Unlink from ${template.name}?`,
                              content: (
                                <p style={{ lineHeight: 1.5 }}>
                                  The component {record.name} will be removed from the template {template.name}. This will affect any new
                                  indexes created with this template.
                                </p>
                              ),
                              footer: ["cancel", "confirm"],
                              locale: {
                                confirm: "Unlink",
                              },
                              confirmButtonProps: {
                                color: "danger",
                              },
                              async onOk() {
                                const currentTemplate = await getTemplate({
                                  templateName: template.name,
                                  commonService: services.commonService,
                                  coreService: coreServices,
                                });
                                const updateResult = await services.commonService.apiCaller({
                                  endpoint: "transport.request",
                                  data: {
                                    method: "POST",
                                    path: `/_index_template/${template.name}`,
                                    body: {
                                      ...currentTemplate,
                                      composed_of: currentTemplate?.composed_of?.filter((item) => item !== record.name) || [],
                                    } as TemplateItemRemote,
                                  },
                                });
                                if (updateResult.ok) {
                                  onUnlink?.(record.name);
                                  coreServices.notifications.toasts.addSuccess(
                                    `${record.name} has been successfully unlinked from ${template.name}.`
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
            />
          </EuiFlyoutBody>
        </EuiFlyout>
      ) : null}
    </>
  );
}
