/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { forwardRef, useContext, useEffect, useImperativeHandle, useRef, Ref, useState } from "react";
import { EuiButton, EuiButtonEmpty, EuiFlexGroup, EuiFlexItem, EuiLink, EuiSpacer, EuiTitle } from "@elastic/eui";
import { IComposableTemplate, IComposableTemplateRemote } from "../../../../../models/interfaces";
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
import DefineTemplate from "../../components/DefineTemplate";
import IndexSettings from "../../components/IndexSettings";
import IndexAlias from "../IndexAlias";
import TemplateMappings from "../TemplateMappings";
import { IndexForm } from "../../../../containers/IndexForm";
import ComposableTemplatesActions from "../../../ComposableTemplates/containers/ComposableTemplatesActions";

export interface TemplateDetailProps {
  templateName?: string;
  onCancel?: () => void;
  onSubmitSuccess?: (templateName: string) => void;
  readonly?: boolean;
  history: RouteComponentProps["history"];
}

const TemplateDetail = (props: TemplateDetailProps, ref: Ref<FieldInstance>) => {
  const { templateName, onCancel, onSubmitSuccess, readonly } = props;
  const isEdit = !!templateName;
  const services = useContext(ServicesContext) as BrowserServices;
  const coreServices = useContext(CoreServicesContext) as CoreStart;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const oldValue = useRef<IComposableTemplateRemote | undefined>(undefined);
  const field = useField({
    values: {
      template: {},
    } as Partial<IComposableTemplate>,
  });
  const destroyRef = useRef<boolean>(false);
  const onSubmit = async () => {
    const { errors, values: templateDetail } = (await field.validatePromise()) || {};
    if (errors) {
      return;
    }
    const { includes, template, ...others } = templateDetail as IComposableTemplate;
    const payload: Partial<IComposableTemplate> = {
      ...others,
    };
    const templatePayload: IComposableTemplate["template"] = {};
    if (includes?.aliases) {
      templatePayload.aliases = template.aliases;
    }
    if (includes?.mappings) {
      templatePayload.mappings = template.mappings;
    }
    if (includes?.settings) {
      templatePayload.settings = template.settings;
    }
    payload.template = templatePayload;
    setIsSubmitting(true);
    const result = await submitTemplate({
      value: payload,
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
          props.history.replace(ROUTES.COMPOSABLE_TEMPLATES);
        });
    }
    return () => {
      destroyRef.current = true;
    };
  }, []);
  const values: IComposableTemplate & { name: string } = field.getValues();
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
            {readonly ? <h1 title={values.name}>{values.name}</h1> : <h1>{isEdit ? "Edit" : "Create"} composable template</h1>}
          </EuiTitle>
          {readonly ? null : (
            <CustomFormRow
              fullWidth
              label=""
              helpText={
                <div>
                  Template components let you initialize new templates with predefined mappings and settings.{" "}
                  <EuiLink external target="_blank" href={coreServices.docLinks.links.opensearch.indexTemplates.composable}>
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
                const showValue: IComposableTemplateRemote = JSON.parse(
                  JSON.stringify({
                    ...values,
                    template: IndexForm.transformIndexDetailToRemote(values.template),
                  } as IComposableTemplateRemote)
                );
                const { includes, ...others } = showValue;
                Modal.show({
                  "data-test-subj": "templateJSONDetailModal",
                  title: values.name,
                  content: <JSONEditor value={JSON.stringify(others, null, 2)} disabled />,
                });
              }}
            >
              View JSON
            </EuiButton>
            <ComposableTemplatesActions
              selectedItems={[templateName || ""]}
              history={props.history}
              onDelete={() => props.history.replace(ROUTES.COMPOSABLE_TEMPLATES)}
            />
          </EuiFlexItem>
        ) : null}
      </EuiFlexGroup>
      <EuiSpacer />
      <DefineTemplate {...subCompontentProps} />
      <EuiSpacer />
      {values.includes?.aliases ? (
        <>
          <IndexAlias {...subCompontentProps} />
          <EuiSpacer />
        </>
      ) : null}
      {values.includes?.settings ? (
        <>
          <IndexSettings {...subCompontentProps} />
          <EuiSpacer />
        </>
      ) : null}
      {values.includes?.mappings ? (
        <>
          <TemplateMappings {...subCompontentProps} />
          <EuiSpacer />
        </>
      ) : null}
      {readonly ? null : (
        <>
          <EuiSpacer />
          <EuiFlexGroup alignItems="center" justifyContent="flexEnd">
            <EuiFlexItem grow={false}>
              <EuiButtonEmpty onClick={onCancel} data-test-subj="CreateComposableTemplateCancelButton">
                Cancel
              </EuiButtonEmpty>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiButton fill onClick={onSubmit} isLoading={isSubmitting} data-test-subj="CreateComposableTemplateCreateButton">
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
