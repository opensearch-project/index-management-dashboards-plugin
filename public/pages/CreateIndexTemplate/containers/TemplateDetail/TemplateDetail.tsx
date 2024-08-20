/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { forwardRef, useContext, useEffect, useImperativeHandle, useRef, Ref, useState } from "react";
import {
  EuiButton,
  EuiButtonEmpty,
  EuiButtonIcon,
  EuiCodeBlock,
  EuiFlexGroup,
  EuiFlexItem,
  EuiLink,
  EuiSpacer,
  EuiTab,
  EuiTabs,
  EuiText,
  EuiTitle,
} from "@elastic/eui";
import queryString from "query-string";
import { TemplateItem, TemplateItemRemote } from "../../../../../models/interfaces";
import useField, { FieldInstance } from "../../../../lib/field";
import CustomFormRow from "../../../../components/CustomFormRow";
import { ServicesContext } from "../../../../services";
import { BrowserServices } from "../../../../models/interfaces";
import { CoreServicesContext } from "../../../../components/core_services";
import { CoreStart } from "opensearch-dashboards/public";
import { submitTemplate, getTemplate, simulateTemplate, formatTemplate, formatRemoteTemplateToEditTemplate } from "../../hooks";
import { Modal } from "../../../../components/Modal";
import { RouteComponentProps } from "react-router-dom";
import { ROUTES } from "../../../../utils/constants";
import DeleteTemplateModal from "../../../Templates/containers/DeleteTemplatesModal";
import DefineTemplate, { OverviewTemplate } from "../../components/DefineTemplate";
import IndexSettings from "../../components/IndexSettings";
import IndexAlias from "../IndexAlias";
import TemplateMappings from "../TemplateMappings";
import { merge } from "lodash";
import ComposableTemplate from "../ComposableTemplate";
import PreviewTemplate from "../PreviewTemplate";
import { ContentPanel } from "../../../../components/ContentPanel";
import { FLOW_ENUM, TemplateItemEdit } from "../../interface";
import BottomBar from "../../../../components/BottomBar";
import { diffJson } from "../../../../utils/helpers";
import UnsavedChangesBottomBar from "../../../../components/UnsavedChangesBottomBar";
import { IndexForm } from "../../../../containers/IndexForm";
import { TABS_ENUM, tabs } from "../../constant";
import { getApplication, getNavigationUI, getUISettings } from "../../../../services/Services";

export interface TemplateDetailProps {
  templateName?: string;
  onCancel?: () => void;
  onSubmitSuccess?: (templateName: string) => void;
  history: RouteComponentProps["history"];
  location: RouteComponentProps["location"];
  dataSourceId: string;
  useUpdatedUX?: boolean;
}

const TemplateDetail = (props: TemplateDetailProps, ref: Ref<FieldInstance>) => {
  const { templateName, onCancel, onSubmitSuccess, history, useUpdatedUX } = props;
  const isEdit = !!templateName;
  const services = useContext(ServicesContext) as BrowserServices;
  const coreServices = useContext(CoreServicesContext) as CoreStart;
  const [selectedTabId, setSelectedTabId] = useState(TABS_ENUM.SUMMARY);
  const [visible, setVisible] = useState(false);
  const [previewFlyoutVisible, setPreviewFlyoutVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const oldValue = useRef<TemplateItem | undefined>(undefined);
  const searchObject = queryString.parseUrl(props.location.search);
  /* istanbul ignore next */
  if (searchObject.query.values) {
    try {
      searchObject.query.values = JSON.parse((searchObject.query.values || "") as string);
    } catch (e) {
      // do nothing
    }
  }
  const defaultValues = merge(
    {},
    {
      priority: 0,
      template: {},
      _meta: {
        flow: FLOW_ENUM.SIMPLE,
      },
    } as Partial<TemplateItem>,
    searchObject.query.values as any
  );
  const field = useField({
    values: defaultValues,
    onChange(name, value) {
      if (name === "data_stream" && value === undefined) {
        field.deleteValue(name);
      }
    },
  });
  const simulateField = useField({
    values: {
      priority: 0,
      template: {},
      _meta: {
        flow: FLOW_ENUM.SIMPLE,
      },
    } as Partial<TemplateItem>,
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
    /* istanbul ignore next */
    if (destroyRef.current) {
      return;
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
  useImperativeHandle(ref, () => field);
  const refreshTemplate = () => {
    getTemplate({
      templateName: templateName || "",
      coreService: coreServices,
      commonService: services.commonService,
    })
      .then((template) => {
        oldValue.current = JSON.parse(JSON.stringify(template));
        field.resetValues(template);

        simulateTemplate({
          commonService: services.commonService,
          template: field.getValues(),
        }).then((simulateResult) => {
          if (simulateResult.ok) {
            simulateField.resetValues(simulateResult.response);
          } else {
            coreServices.notifications.toasts.addDanger(simulateResult.error);
          }
        });
      })
      .catch(() => {
        // do nothing
        props.history.replace(ROUTES.TEMPLATES);
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
  const values: TemplateItemEdit = field.getValues();
  const subCompontentProps = {
    ...props,
    isEdit,
    field,
    readonly: selectedTabId === TABS_ENUM.SUMMARY && isEdit,
  };

  const PreviewTemplateButton = () => (
    <EuiFlexItem grow={false}>
      <EuiButton
        onClick={async () => {
          const result = await simulateTemplate({
            template: field.getValues(),
            commonService: services.commonService,
          });
          if (result.ok) {
            simulateField.resetValues(result.response);
            setPreviewFlyoutVisible(true);
          } else {
            coreServices.notifications.toasts.addDanger(result.error);
          }
        }}
        data-test-subj="CreateIndexTemplatePreviewButton"
        color="ghost"
      >
        Preview template
      </EuiButton>
    </EuiFlexItem>
  );
  const { HeaderControl } = getNavigationUI();
  const { setAppDescriptionControls, setAppRightControls } = getApplication();

  const descriptionData = [
    {
      renderComponent: (
        <EuiText size="s" color="subdued">
          Define an automated snapshot schedule and retention period with a snapshot policy.{" "}
          <EuiLink external target="_blank" href={coreServices.docLinks.links.opensearch.indexTemplates.base}>
            Learn more
          </EuiLink>
        </EuiText>
      ),
    },
  ];

  const HeaderRight = [
    {
      renderComponent: (
        <>
          <EuiButtonIcon display="base" iconType="trash" aria-label="Delete" color="danger" onClick={() => setVisible(true)} size="s" />
          <DeleteTemplateModal
            visible={visible}
            selectedItems={[templateName]}
            onClose={() => {
              setVisible(false);
            }}
            onDelete={() => {
              setVisible(false);
              history.replace(ROUTES.TEMPLATES);
            }}
          />
        </>
      ),
    },
    {
      renderComponent: (
        <EuiButton
          fill
          size="s"
          style={{ marginRight: 20 }}
          onClick={() => {
            const showValue: TemplateItemRemote = {
              ...values,
              template: IndexForm.transformIndexDetailToRemote(values.template),
            };
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
                  {JSON.stringify(showValue, null, 2)}
                </EuiCodeBlock>
              ),
            });
          }}
        >
          View JSON
        </EuiButton>
      ),
    },
  ];

  const Title = () => {
    return !useUpdatedUX ? (
      <>
        <EuiFlexGroup alignItems="center">
          <EuiFlexItem>
            <EuiTitle size="l">
              {isEdit ? <h1 title={values.name}>{templateName}</h1> : <h1>{isEdit ? "Edit" : "Create"} template</h1>}
            </EuiTitle>
            {isEdit ? null : (
              <CustomFormRow
                fullWidth
                label=""
                helpText={
                  <div>
                    Index templates let you initialize new indexes with predefined mappings and settings.{" "}
                    <EuiLink external target="_blank" href={coreServices.docLinks.links.opensearch.indexTemplates.base}>
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
              <EuiFlexItem grow={false} style={{ flexDirection: "row" }}>
                <EuiButton
                  style={{ marginRight: 20 }}
                  onClick={() => {
                    const showValue: TemplateItemRemote = {
                      ...values,
                      template: IndexForm.transformIndexDetailToRemote(values.template),
                    };
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
                          {JSON.stringify(showValue, null, 2)}
                        </EuiCodeBlock>
                      ),
                    });
                  }}
                >
                  View JSON
                </EuiButton>
                <EuiButton color="danger" onClick={() => setVisible(true)}>
                  Delete
                </EuiButton>
                <DeleteTemplateModal
                  visible={visible}
                  selectedItems={[templateName]}
                  onClose={() => {
                    setVisible(false);
                  }}
                  onDelete={() => {
                    setVisible(false);
                    history.replace(ROUTES.TEMPLATES);
                  }}
                />
              </EuiFlexItem>
            </>
          ) : null}
        </EuiFlexGroup>
        <EuiSpacer />
      </>
    ) : (
      <>
        {isEdit ? (
          <HeaderControl controls={HeaderRight} setMountPoint={setAppRightControls} />
        ) : (
          <HeaderControl controls={descriptionData} setMountPoint={setAppDescriptionControls} />
        )}
      </>
    );
  };

  return (
    <>
      {Title()}
      {isEdit ? (
        <>
          <OverviewTemplate {...subCompontentProps} />
          <EuiSpacer />
        </>
      ) : null}
      {isEdit ? (
        <>
          <EuiTabs>
            {tabs.map((item) => (
              <EuiTab
                onClick={() => {
                  setSelectedTabId(item.id);
                }}
                isSelected={selectedTabId === item.id}
                key={item.id}
                data-test-subj={`TemplateDetailTab-${item.id}`}
              >
                {item.name}
              </EuiTab>
            ))}
          </EuiTabs>
          <EuiSpacer />
        </>
      ) : null}
      {subCompontentProps.readonly ? null : (
        <>
          <DefineTemplate {...subCompontentProps} />
          <EuiSpacer />
        </>
      )}
      {values._meta?.flow === FLOW_ENUM.COMPONENTS && !subCompontentProps.readonly ? (
        <>
          <ComposableTemplate {...subCompontentProps} />
          <EuiSpacer />
        </>
      ) : null}
      <ContentPanel
        title={
          isEdit && selectedTabId === TABS_ENUM.SUMMARY
            ? "Preview template"
            : values._meta?.flow === FLOW_ENUM.COMPONENTS
            ? "Override template definition"
            : "Template definition"
        }
        subTitleText={
          (!isEdit || selectedTabId !== TABS_ENUM.SUMMARY) && values._meta?.flow === FLOW_ENUM.COMPONENTS
            ? "Provide additional configurations such as index aliases, settings, and mappings. Configurations defined in this section will take precedent if they overlap with the associated component templates."
            : undefined
        }
        accordion={(!isEdit || selectedTabId !== TABS_ENUM.SUMMARY) && values._meta?.flow === FLOW_ENUM.COMPONENTS}
        noExtraPadding
        titleSize="s"
      >
        <EuiSpacer size="s" />
        <IndexAlias key={props.dataSourceId} {...subCompontentProps} field={subCompontentProps.readonly ? simulateField : field} />
        {/*{^ Passing dataSourceId as the key to force unmount and remount IndexAlias so as to refresh aliases in case of datasource changes }*/}
        <EuiSpacer />
        <IndexSettings {...subCompontentProps} field={subCompontentProps.readonly ? simulateField : field} />
        <EuiSpacer />
        <TemplateMappings {...subCompontentProps} field={subCompontentProps.readonly ? simulateField : field} />
        <EuiSpacer />
      </ContentPanel>
      {previewFlyoutVisible && simulateField.getValues() ? (
        <Modal.SimpleModal
          style={{
            width: 800,
          }}
          locale={{
            ok: "Close",
          }}
          maxWidth={false}
          onClose={() => setPreviewFlyoutVisible(false)}
          title="Preview template"
          content={<PreviewTemplate value={simulateField.getValues()} history={props.history} />}
        />
      ) : null}
      {isEdit ? null : (
        <>
          <BottomBar>
            <EuiFlexGroup alignItems="center" justifyContent="flexEnd">
              <EuiFlexItem grow={false}>
                <EuiButtonEmpty onClick={onCancel} color="ghost" iconType="cross" size="s" data-test-subj="CreateIndexTemplateCancelButton">
                  Cancel
                </EuiButtonEmpty>
              </EuiFlexItem>
              <PreviewTemplateButton />
              <EuiFlexItem grow={false}>
                <EuiButton
                  fill
                  onClick={async () => {
                    const result = await onSubmit();
                    if (result) {
                      if (result.ok) {
                        coreServices.notifications.toasts.addSuccess(`${values.name} has been successfully created.`);
                        onSubmitSuccess && onSubmitSuccess(values.name);
                      } else {
                        coreServices.notifications.toasts.addDanger(result.error);
                      }
                    }
                  }}
                  isLoading={isSubmitting}
                  data-test-subj="CreateIndexTemplateCreateButton"
                >
                  Create template
                </EuiButton>
              </EuiFlexItem>
            </EuiFlexGroup>
          </BottomBar>
        </>
      )}
      {isEdit && selectedTabId === TABS_ENUM.CONFIG && diffJson(formatTemplate(oldValue.current), formatTemplate(values)) ? (
        <UnsavedChangesBottomBar
          submitButtonDataTestSubj="updateTemplateButton"
          cancelButtonprops={{
            "data-test-subj": "CancelUpdateTemplateButton",
          }}
          unsavedCount={diffJson(formatTemplate(oldValue.current), formatTemplate(values))}
          onClickCancel={async () => {
            field.resetValues(
              formatRemoteTemplateToEditTemplate({
                templateDetail: {
                  ...oldValue.current,
                  template: IndexForm.transformIndexDetailToRemote(oldValue.current?.template),
                },
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
          renderProps={({ renderCancel, renderConfirm, renderUnsavedText }) => {
            return (
              <>
                {renderUnsavedText()}
                {renderCancel()}
                <PreviewTemplateButton />
                {renderConfirm()}
              </>
            );
          }}
        />
      ) : null}
    </>
  );
};

// @ts-ignore
export default forwardRef(TemplateDetail);
