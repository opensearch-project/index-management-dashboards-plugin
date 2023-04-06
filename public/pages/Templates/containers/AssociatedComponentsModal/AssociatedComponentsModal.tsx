/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Dispatch, SetStateAction, useContext, useState } from "react";
import { CoreStart } from "opensearch-dashboards/public";
import { ServicesContext } from "../../../../services";
import { CoreServicesContext } from "../../../../components/core_services";
import { EuiButtonIcon, EuiFlyout, EuiFlyoutBody, EuiFlyoutHeader, EuiInMemoryTable, EuiLink, EuiTitle } from "@elastic/eui";
import { ROUTES } from "../../../../utils/constants";
import { ReactChild } from "react";
import { Modal } from "../../../../components/Modal";
import { BrowserServices } from "../../../../models/interfaces";
import { TemplateItemRemote } from "../../../../../models/interfaces";
import { ITemplate } from "../../interface";
import { getTemplate } from "../../../ComposableTemplates/utils/hooks";

interface AssociatedComponentsModalProps {
  template: ITemplate;
  onUnlink?: (unlinkTemplate: string) => void;
  renderProps: (params: { setVisible: Dispatch<SetStateAction<boolean>> }) => ReactChild;
}

export default function AssociatedComponentsModalProps(props: AssociatedComponentsModalProps) {
  const { onUnlink, renderProps, template } = props;
  const [visible, setVisible] = useState(false);
  const services = useContext(ServicesContext) as BrowserServices;
  const coreServices = useContext(CoreServicesContext) as CoreStart;

  return (
    <>
      {renderProps ? renderProps({ setVisible }) : null}
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
                  render: (value: string, record) => {
                    return (
                      <EuiButtonIcon
                        aria-label={`Unlink ${record.name}?`}
                        iconType="unlink"
                        onClick={() => {
                          Modal.show({
                            type: "confirm",
                            title: `Unlink ${record.name}?`,
                            content: `The component ${record.name} will be removed from template ${template.name}. This will affect any new indexes that will be created with this template.`,
                            footer: ["cancel", "confirm"],
                            locale: {
                              ok: "Unlink",
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
                                  path: `_index_template/${template.name}`,
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
                              }
                            },
                          });
                        }}
                      />
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
