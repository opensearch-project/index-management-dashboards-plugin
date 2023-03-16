/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useMemo, useState, useContext, useEffect } from "react";
import { Link, RouteComponentProps } from "react-router-dom";
import { EuiButton } from "@elastic/eui";
import DeleteIndexModal from "../DeleteComposableTemplatesModal";
import { ROUTES } from "../../../../utils/constants";
import { ServicesContext } from "../../../../services";
import { TemplateItemRemote } from "../../../../../models/interfaces";
import { BrowserServices } from "../../../../../public/models/interfaces";
import { Modal } from "../../../../components/Modal";
import { getAllUsedComponents } from "../../utils/services";

export interface ComposableTemplatesActionsProps {
  selectedItems: string[];
  onDelete: () => void;
  history: RouteComponentProps["history"];
}

export default function ComposableTemplatesActions(props: ComposableTemplatesActionsProps) {
  const { selectedItems, onDelete } = props;
  const [deleteIndexModalVisible, setDeleteIndexModalVisible] = useState(false);
  const [alertModalVisible, setAlertModalVisible] = useState(false);
  const [allIndexTemplates, setAllIndexTemplates] = useState<
    {
      name: string;
      index_template: TemplateItemRemote;
    }[]
  >([]);
  const services = useContext(ServicesContext) as BrowserServices;

  const onDeleteIndexModalClose = () => {
    setDeleteIndexModalVisible(false);
  };

  const allUsedComponent = useMemo(
    () => allIndexTemplates.reduce((total, current) => [...total, ...(current.index_template.composed_of || [])], [] as string[]),
    [allIndexTemplates]
  );

  useEffect(() => {
    getAllUsedComponents({
      commonService: services.commonService,
    }).then((res) => setAllIndexTemplates(res));
  }, []);

  return (
    <>
      <EuiButton
        disabled={selectedItems.length !== 1}
        onClick={() => {
          if (selectedItems.some((item) => allUsedComponent.includes(item))) {
            setAlertModalVisible(true);
          } else {
            setDeleteIndexModalVisible(true);
          }
        }}
      >
        Delete
      </EuiButton>
      <DeleteIndexModal
        selectedItems={selectedItems}
        visible={deleteIndexModalVisible}
        onClose={onDeleteIndexModalClose}
        onDelete={() => {
          onDeleteIndexModalClose();
          onDelete();
        }}
      />
      <Modal.SimpleModal
        visible={alertModalVisible}
        title="The component can not be delete."
        onClose={() => setAlertModalVisible(false)}
        content={
          <div>
            The component is being used by{" "}
            {allIndexTemplates
              .filter((item) => selectedItems.some((selectItem) => item.index_template.composed_of?.includes(selectItem)))
              .reduce(
                (total, current, index) => [
                  ...total,
                  <span key={current.name}>
                    {index === 0 ? null : <span>, </span>}
                    <Link to={`${ROUTES.CREATE_TEMPLATE}/${current.name}/readonly`}>{current.name}</Link>
                  </span>,
                ],
                [] as React.ReactChild[]
              )}{" "}
            template.
          </div>
        }
      />
    </>
  );
}
