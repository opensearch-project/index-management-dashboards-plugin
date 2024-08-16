/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { forwardRef, useContext, useEffect, useImperativeHandle, useRef, Ref, useState } from "react";
import { EuiButton, EuiButtonEmpty, EuiCodeBlock, EuiFlexGroup, EuiFlexItem, EuiLink, EuiSpacer, EuiText, EuiTitle } from "@elastic/eui";
import { RouteComponentProps } from "react-router-dom";
import { IComposableTemplate, IComposableTemplateRemote } from "../../../../../models/interfaces";
import useField from "../../../../lib/field";
import CustomFormRow from "../../../../components/CustomFormRow";
import { ServicesContext } from "../../../../services";
import { BrowserServices } from "../../../../models/interfaces";
import { CoreServicesContext } from "../../../../components/core_services";
import { CoreStart } from "opensearch-dashboards/public";
import { submitTemplate, getTemplate, formatRemoteTemplateToEditTemplate, filterTemplateByIncludes } from "../../hooks";
import { Modal } from "../../../../components/Modal";
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
import { getApplication, getNavigationUI, getUISettings } from "../../../../services/Services";
import { TopNavControlButtonData, TopNavControlIconData } from "src/plugins/navigation/public";
import DeleteIndexModal from "../../../ComposableTemplates/containers/DeleteComposableTemplatesModal";

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
  noPanel?: boolean;
  dataSourceId: string;
  useNewUX?: boolean;
}

export interface IComponentTemplateDetailInstance {
  submit: () => void;
}

const TemplateDetail = (props: TemplateDetailProps, ref: Ref<IComponentTemplateDetailInstance>) => {
  const { templateName, onCancel, onSubmitSuccess, hideTitle, hideButton, noPanel, useNewUX } = props;
  const isEdit = !!templateName;
  const services = useContext(ServicesContext) as BrowserServices;
  const coreServices = useContext(CoreServicesContext) as CoreStart;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteIndexModalVisible, setDeleteIndexModalVisible] = useState(false);
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
    const payload = filterTemplateByIncludes(templateDetail);
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
    noPanel,
  };

  const diffedNumber = isEdit
    ? diffJson(
        formatTemplate(
          filterTemplateByIncludes({
            name: values.name,
            template: {},
            ...oldValue.current,
          })
        ),
        formatTemplate(filterTemplateByIncludes(values))
      )
    : 0;

  const onClickViewJson = () => {
    const showValue: ComponentTemplateEdit = JSON.parse(
      JSON.stringify({
        ...values,
        template: IndexForm.transformIndexDetailToRemote(values.template),
      } as IComposableTemplateRemote)
    );
    const { includes, ...others } = showValue;
    Modal.show({
      locale: {
        ok: "Close",
      },
      style: {
        width: 800,
      },
      "data-test-subj": "templateJSONDetailModal",
      title: values.name,
      content: (
        <EuiCodeBlock language="json" isCopyable>
          {JSON.stringify(others, null, 2)}
        </EuiCodeBlock>
      ),
    });
  };

  const onDelete = () => {
    props.history.replace(ROUTES.COMPOSABLE_TEMPLATES);
  };

  const onDeleteIndexModalClose = () => {
    setDeleteIndexModalVisible(false);
  };

  const onDeleteIndexModalOpen = () => {
    setDeleteIndexModalVisible(true);
  };

  const deleteModal = () => {
    return (
      deleteIndexModalVisible && (
        <DeleteIndexModal
          selectedItems={[templateName || ""]}
          visible={deleteIndexModalVisible}
          onClose={onDeleteIndexModalClose}
          onDelete={() => {
            onDeleteIndexModalClose();
            onDelete();
          }}
        />
      )
    );
  };

  const { HeaderControl } = getNavigationUI();
  const { setAppRightControls, setAppDescriptionControls } = getApplication();

  const descriptionData = [
    {
      renderComponent: (
        <EuiText size="s" color="subdued">
          Component templates are reusable building blocks for composing index or data stream templates.
          <br /> You can define component templates with common index configurations and associate them to an index template.{" "}
          <EuiLink external target="_blank" href={coreServices.docLinks.links.opensearch.indexTemplates.composable}>
            Learn more
          </EuiLink>
        </EuiText>
      ),
    },
  ];

  return (
    <>
      {hideTitle ? null : (
        <>
          <EuiFlexGroup alignItems="center">
            <EuiFlexItem>
              {useNewUX ? (
                <></>
              ) : (
                <EuiTitle size="l">{isEdit ? <h1 title={templateName}>{templateName}</h1> : <h1>Create component template</h1>}</EuiTitle>
              )}
              {isEdit ? null : useNewUX ? (
                <HeaderControl setMountPoint={setAppDescriptionControls} controls={descriptionData} />
              ) : (
                <CustomFormRow
                  fullWidth
                  label=""
                  helpText={
                    <div>
                      Component templates are reusable building blocks for composing index or data stream templates. You can define
                      component templates with common index configurations and associate them to an index template.{" "}
                      <EuiLink external target="_blank" href={coreServices.docLinks.links.opensearch.indexTemplates.composable}>
                        Learn more
                      </EuiLink>
                    </div>
                  }
                >
                  <></>
                </CustomFormRow>
              )}
            </EuiFlexItem>
            {isEdit ? (
              <>
                {useNewUX ? (
                  <>
                    <HeaderControl
                      setMountPoint={setAppRightControls}
                      controls={[
                        {
                          iconType: "trash",
                          testId: "deleteButton",
                          color: "danger",
                          ariaLabel: "delete",
                          run: onDeleteIndexModalOpen,
                          controlType: "icon",
                          display: "base",
                        } as TopNavControlIconData,
                        {
                          id: "View JSON",
                          label: "View JSON",
                          testId: "viewJSONButton",
                          run: onClickViewJson,
                          fill: false,
                          controlType: "button",
                        } as TopNavControlButtonData,
                      ]}
                    />
                    {deleteModal()}
                  </>
                ) : (
                  <EuiFlexItem grow={false} style={{ flexDirection: "row" }}>
                    <EuiButton style={{ marginRight: 20 }} onClick={onClickViewJson}>
                      View JSON
                    </EuiButton>
                    <ComposableTemplatesActions selectedItems={[templateName || ""]} history={props.history} onDelete={onDelete} />
                  </EuiFlexItem>
                )}
              </>
            ) : null}
          </EuiFlexGroup>
          {useNewUX ? <></> : <EuiSpacer />}
        </>
      )}
      <DefineTemplate {...subCompontentProps} />
      <EuiSpacer />
      <IndexAlias key={props.dataSourceId} {...subCompontentProps} />
      {/*{^ Passing dataSourceId as the key to force unmount and remount IndexAlias so as to refresh aliases in case of datasource changes }*/}
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
                Create component template
              </EuiButton>
            </EuiFlexItem>
          </EuiFlexGroup>
        </>
      )}
      {diffedNumber ? (
        <UnsavedChangesBottomBar
          submitButtonDataTestSubj="updateTemplateButton"
          unsavedCount={diffedNumber}
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
