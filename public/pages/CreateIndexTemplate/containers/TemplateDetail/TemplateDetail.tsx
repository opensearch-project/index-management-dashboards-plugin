/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { forwardRef, useContext, useEffect, useImperativeHandle, useRef, Ref, useState } from "react";
import { EuiButton, EuiButtonEmpty, EuiFlexGroup, EuiFlexItem, EuiLink, EuiSpacer, EuiTitle } from "@elastic/eui";
import { transformArrayToObject } from "../../../../components/IndexMapping";
import { TemplateItem, TemplateItemRemote } from "../../../../../models/interfaces";
import useField, { FieldInstance } from "../../../../lib/field";
import CustomFormRow from "../../../../components/CustomFormRow";
import { ServicesContext } from "../../../../services";
import { BrowserServices } from "../../../../models/interfaces";
import { CoreServicesContext } from "../../../../components/core_services";
import { CoreStart } from "opensearch-dashboards/public";
import { submitTemplate, getTemplate } from "./hooks";
import { Modal } from "../../../../components/Modal";
import JSONEditor from "../../../../components/JSONEditor";
import { RouteComponentProps } from "react-router-dom";
import { ROUTES } from "../../../../utils/constants";
import DeleteTemplateModal from "../../../Templates/containers/DeleteTemplatesModal";
import DefineTemplate from "../../components/DefineTemplate";
import IndexSettings from "../../components/IndexSettings";
import IndexAlias from "../IndexAlias";
import TemplateMappings from "../TemplateMappings";

export interface TemplateDetailProps {
  templateName?: string;
  onCancel?: () => void;
  onSubmitSuccess?: (templateName: string) => void;
  readonly?: boolean;
  history: RouteComponentProps["history"];
}

const TemplateDetail = (props: TemplateDetailProps, ref: Ref<FieldInstance>) => {
  const { templateName, onCancel, onSubmitSuccess, readonly, history } = props;
  const isEdit = !!templateName;
  const services = useContext(ServicesContext) as BrowserServices;
  const coreServices = useContext(CoreServicesContext) as CoreStart;
  const [visible, setVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const oldValue = useRef<TemplateItem | undefined>(undefined);
  const field = useField({
    values: {
      priority: 0,
      template: {
        settings: {
          "index.number_of_replicas": 1,
          "index.number_of_shards": 1,
          "index.refresh_interval": "1s",
        },
      },
    } as Partial<TemplateItem>,
    onChange(name, value) {
      if (name === "data_stream" && value === undefined) {
        field.deleteValue(name);
      }
    },
  });
  const destroyRef = useRef<boolean>(false);
  const onSubmit = async () => {
    const { errors, values: templateDetail } = (await field.validatePromise()) || {};
    if (errors) {
      return;
    }
    setIsSubmitting(true);
    const result = await submitTemplate({
      value: templateDetail,
      commonService: services.commonService,
      isEdit,
    });
    if (result && result.ok) {
      coreServices.notifications.toasts.addSuccess(`${templateDetail.name} has been successfully ${isEdit ? "updated" : "created"}.`);
      onSubmitSuccess && onSubmitSuccess(templateDetail.name);
    } else {
      coreServices.notifications.toasts.addDanger(result.error);
    }
    if (destroyRef.current) {
      return;
    }
    setIsSubmitting(false);
  };
  useImperativeHandle(ref, () => field);
  useEffect(() => {
    if (isEdit) {
      getTemplate({
        templateName,
        coreService: coreServices,
        commonService: services.commonService,
      })
        .then((template) => {
          oldValue.current = template;
          field.resetValues(template);
        })
        .catch(() => {
          // do nothing
          props.history.replace(ROUTES.TEMPLATES);
        });
    }
    return () => {
      destroyRef.current = true;
    };
  }, []);
  const values: TemplateItem = field.getValues();
  const subCompontentProps = {
    ...props,
    isEdit,
    field,
  };

  return (
    <>
      <EuiFlexGroup alignItems="center">
        <EuiFlexItem>
          <EuiTitle size="l">
            {readonly ? <h1 title={values.name}>{values.name}</h1> : <h1>{isEdit ? "Edit" : "Create"} template</h1>}
          </EuiTitle>
          {readonly ? null : (
            <CustomFormRow
              fullWidth
              label=""
              helpText={
                <div>
                  Index templates let you initialize new indexes with predefined mappings and settings.{" "}
                  <EuiLink external target="_blank" href={coreServices.docLinks.links.opensearch.indexTemplates.base}>
                    Learn more.
                  </EuiLink>
                </div>
              }
            >
              <></>
            </CustomFormRow>
          )}
        </EuiFlexItem>
        {readonly ? (
          <EuiFlexItem grow={false} style={{ flexDirection: "row" }}>
            <EuiButton
              style={{ marginRight: 20 }}
              onClick={() => {
                const showValue: TemplateItemRemote = {
                  ...values,
                  template: {
                    ...values.template,
                    mappings: {
                      ...values.template.mappings,
                      properties: transformArrayToObject(values.template.mappings?.properties || []),
                    },
                  },
                };
                Modal.show({
                  "data-test-subj": "templateJSONDetailModal",
                  title: values.name,
                  content: <JSONEditor value={JSON.stringify(showValue, null, 2)} disabled />,
                });
              }}
            >
              View JSON
            </EuiButton>
            <EuiButton style={{ marginRight: 20 }} onClick={() => history.push(`${ROUTES.CREATE_TEMPLATE}/${values.name}`)}>
              Edit
            </EuiButton>
            <EuiButton color="danger" style={{ marginRight: 20 }} onClick={() => setVisible(true)}>
              Delete
            </EuiButton>
            <DeleteTemplateModal
              visible={visible}
              selectedItems={[values.name]}
              onClose={() => {
                setVisible(false);
              }}
              onDelete={() => {
                setVisible(false);
                history.replace(ROUTES.TEMPLATES);
              }}
            />
          </EuiFlexItem>
        ) : null}
      </EuiFlexGroup>
      <EuiSpacer />
      <DefineTemplate {...subCompontentProps} />
      <EuiSpacer />
      <IndexAlias {...subCompontentProps} />
      <EuiSpacer />
      <IndexSettings {...subCompontentProps} />
      <EuiSpacer />
      <TemplateMappings {...subCompontentProps} />
      {readonly ? null : (
        <>
          <EuiSpacer />
          <EuiSpacer />
          <EuiFlexGroup alignItems="center" justifyContent="flexEnd">
            <EuiFlexItem grow={false}>
              <EuiButtonEmpty onClick={onCancel} data-test-subj="CreateIndexTemplateCancelButton">
                Cancel
              </EuiButtonEmpty>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiButton fill onClick={onSubmit} isLoading={isSubmitting} data-test-subj="CreateIndexTemplateCreateButton">
                {isEdit ? "Save changes" : "Create template"}
              </EuiButton>
            </EuiFlexItem>
          </EuiFlexGroup>
        </>
      )}
    </>
  );
};

// @ts-ignore
export default forwardRef(TemplateDetail);
