/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { forwardRef, useContext, useEffect, useImperativeHandle, useRef, Ref, useState } from "react";
import { EuiButton, EuiButtonEmpty, EuiFlexGroup, EuiFlexItem, EuiLink, EuiSpacer, EuiTitle } from "@elastic/eui";
import { RouteComponentProps } from "react-router-dom";
import { IComposableTemplate, IComposableTemplateRemote } from "../../../../../models/interfaces";
import useField from "../../../../lib/field";
import CustomFormRow from "../../../../components/CustomFormRow";
import { ServicesContext } from "../../../../services";
import { BrowserServices } from "../../../../models/interfaces";
import { CoreServicesContext } from "../../../../components/core_services";
import { CoreStart } from "opensearch-dashboards/public";
import { submitTemplate, getTemplate, formatRemoteTemplateToEditTemplate } from "../../hooks";
import { Modal } from "../../../../components/Modal";
import JSONEditor from "../../../../components/JSONEditor";
import { ROUTES } from "../../../../utils/constants";
import DefineTemplate from "../DefineTemplate";
import IndexSettings from "../../components/IndexSettings";
import IndexAlias from "../IndexAlias";
import TemplateMappings from "../TemplateMappings";
import { IndexForm } from "../../../../containers/IndexForm";
import ComposableTemplatesActions from "../../../ComposableTemplates/containers/ComposableTemplatesActions";
import { diffJson } from "../../../../utils/helpers";
import { ComponentTemplateEdit } from "../../interface";
import { formatTemplate } from "../../hooks";
import UnsavedChangesBottomBar from "../../../../components/UnsavedChangesBottomBar";
import { useCallback } from "react";

export interface TemplateDetailProps {
  templateName?: string;
  onCancel?: () => void;
  onSubmitSuccess?: (templateName: string) => void;
  readonly?: boolean;
  history: RouteComponentProps["history"];
  // hideTitle & hideButton are used
  // when embed in create model in index template create flow
  hideTitle?: boolean;
  hideButton?: boolean;
}

export interface IComponentTemplateDetailInstance {
  submit: () => void;
}

const TemplateDetail = (props: TemplateDetailProps, ref: Ref<IComponentTemplateDetailInstance>) => {
  const { templateName, onCancel, onSubmitSuccess, readonly, hideTitle, hideButton } = props;
  const isEdit = !!templateName;
  const services = useContext(ServicesContext) as BrowserServices;
  const coreServices = useContext(CoreServicesContext) as CoreStart;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const oldValue = useRef<IComposableTemplate | undefined>(undefined);
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
    const { includes, template, ...others } = templateDetail as ComponentTemplateEdit;
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
    if (destroyRef.current) {
      return result;
    }
    setIsSubmitting(false);
    if (result.ok) {
      return result;
    } else {
      return {
        ...result,
        error: result?.body?.error?.caused_by?.reason || result.error,
      };
    }
  };
  const onClickSubmit = useCallback(async () => {
    const result = await onSubmit();
    if (result) {
      if (result.ok) {
        coreServices.notifications.toasts.addSuccess(`${values.name} has been successfully created.`);
        onSubmitSuccess && onSubmitSuccess(values.name);
      } else {
        coreServices.notifications.toasts.addDanger(result.error);
      }
    }
  }, [onSubmit]);
  useImperativeHandle(ref, () => ({
    submit: onClickSubmit,
  }));
  const refreshTemplate = () => {
    getTemplate({
      templateName: templateName || "",
      commonService: services.commonService,
    })
      .then((template) => {
        oldValue.current = JSON.parse(JSON.stringify(template));
        field.resetValues(template);
      })
      .catch((error) => {
        coreServices.notifications.toasts.addDanger(error.message);
        props.history.replace(ROUTES.COMPOSABLE_TEMPLATES);
      });
  };
  useEffect(() => {
    if (isEdit) {
      refreshTemplate();
    }
    return () => {
      destroyRef.current = true;
    };
  }, []);
  const values: ComponentTemplateEdit = field.getValues();
  const subCompontentProps = {
    ...props,
    isEdit,
    field,
  };

  return (
    <>
      {hideTitle ? null : (
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
                    const showValue: ComponentTemplateEdit = JSON.parse(
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
        </>
      )}
      <DefineTemplate {...subCompontentProps} />
      <EuiSpacer />
      <IndexAlias {...subCompontentProps} />
      <EuiSpacer />
      <IndexSettings {...subCompontentProps} />
      <EuiSpacer />
      <TemplateMappings {...subCompontentProps} />
      <EuiSpacer />
      {isEdit || hideButton ? null : (
        <>
          <EuiSpacer />
          <EuiFlexGroup alignItems="center" justifyContent="flexEnd">
            <EuiFlexItem grow={false}>
              <EuiButtonEmpty onClick={onCancel} data-test-subj="CreateComposableTemplateCancelButton">
                Cancel
              </EuiButtonEmpty>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiButton fill onClick={onClickSubmit} isLoading={isSubmitting} data-test-subj="CreateComposableTemplateCreateButton">
                Create template
              </EuiButton>
            </EuiFlexItem>
          </EuiFlexGroup>
        </>
      )}
      {isEdit &&
      diffJson(
        formatTemplate({
          name: values.name,
          ...oldValue.current,
        }),
        formatTemplate(values)
      ) ? (
        <UnsavedChangesBottomBar
          submitButtonDataTestSubj="updateTemplateButton"
          unsavedCount={diffJson(
            formatTemplate({
              name: values.name,
              ...oldValue.current,
            }),
            formatTemplate(values)
          )}
          onClickCancel={async () => {
            field.resetValues(
              formatRemoteTemplateToEditTemplate({
                templateDetail: {
                  ...oldValue.current,
                  template: IndexForm.transformIndexDetailToRemote(oldValue.current?.template),
                },
                templateName: values.name,
              })
            );
          }}
          onClickSubmit={async () => {
            const result = await onSubmit();
            if (result) {
              if (result.ok) {
                coreServices.notifications.toasts.addSuccess(`${values.name} has been successfully updated.`);
                refreshTemplate();
              } else {
                coreServices.notifications.toasts.addDanger(result.error);
              }
            }
          }}
        />
      ) : null}
    </>
  );
};

// @ts-ignore
export default forwardRef(TemplateDetail);
