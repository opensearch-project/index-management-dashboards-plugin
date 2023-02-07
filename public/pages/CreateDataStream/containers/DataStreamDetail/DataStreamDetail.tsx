/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { forwardRef, useContext, useEffect, useImperativeHandle, useRef, Ref, useState } from "react";
import { EuiButton, EuiButtonEmpty, EuiFlexGroup, EuiFlexItem, EuiLink, EuiSpacer, EuiTitle } from "@elastic/eui";
import { TemplateItem, TemplateItemRemote } from "../../../../../models/interfaces";
import useField, { FieldInstance } from "../../../../lib/field";
import CustomFormRow from "../../../../components/CustomFormRow";
import { ServicesContext } from "../../../../services";
import { BrowserServices } from "../../../../models/interfaces";
import { CoreServicesContext } from "../../../../components/core_services";
import { CoreStart } from "opensearch-dashboards/public";
import { getAllDataStreamTemplate, createDataStream, getDataStream } from "./hooks";
import { Modal } from "../../../../components/Modal";
import JSONEditor from "../../../../components/JSONEditor";
import { RouteComponentProps } from "react-router-dom";
import { ROUTES } from "../../../../utils/constants";
import DeleteDataStreamsModal from "../../../DataStreams/containers/DeleteDataStreamsModal";
import DefineDataStream from "../DefineDataStream";
import IndexSettings from "../../components/IndexSettings";
import IndexAlias from "../IndexAlias";
import TemplateMappings from "../TemplateMappings";
import { ContentPanel } from "../../../../components/ContentPanel";
import { DataStreamInEdit } from "../../interface";

export interface DataStreamDetailProps {
  dataStream?: string;
  onCancel?: () => void;
  onSubmitSuccess?: (templateName: string) => void;
  readonly?: boolean;
  history: RouteComponentProps["history"];
}

const DataStreamDetail = (props: DataStreamDetailProps, ref: Ref<FieldInstance>) => {
  const { dataStream, onCancel, onSubmitSuccess, history } = props;
  const isEdit = !!dataStream;
  const services = useContext(ServicesContext) as BrowserServices;
  const coreServices = useContext(CoreServicesContext) as CoreStart;
  const [visible, setVisible] = useState(false);
  const [templates, setTemplates] = useState<
    {
      name: string;
      index_template: TemplateItemRemote;
    }[]
  >([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const field = useField({
    values: {} as Partial<TemplateItem>,
  });
  const destroyRef = useRef<boolean>(false);
  const onSubmit = async () => {
    const { errors, values: dataStream } = (await field.validatePromise()) || {};
    if (errors) {
      return;
    }
    setIsSubmitting(true);
    const result = await createDataStream({
      value: dataStream.name,
      commonService: services.commonService,
      isEdit,
    });
    if (result && result.ok) {
      coreServices.notifications.toasts.addSuccess(`${dataStream.name} has been successfully ${isEdit ? "updated" : "created"}.`);
      onSubmitSuccess && onSubmitSuccess(dataStream.name);
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
      getDataStream({
        dataStream,
        coreService: coreServices,
        commonService: services.commonService,
      })
        .then((dataStreamDetail) => {
          field.resetValues(dataStreamDetail);
        })
        .catch(() => {
          props.history.replace(ROUTES.DATA_STREAMS);
        });
    } else {
      getAllDataStreamTemplate({
        commonService: services.commonService,
      }).then((result) => setTemplates(result));
    }
    return () => {
      destroyRef.current = true;
    };
  }, []);
  const values: DataStreamInEdit & { matchedTemplate?: string } = field.getValues();
  const subCompontentProps = {
    ...props,
    isEdit,
    field,
  };

  return (
    <>
      <EuiFlexGroup alignItems="center">
        <EuiFlexItem>
          <EuiTitle size="l">{isEdit ? <h1 title={values.name}>{values.name}</h1> : <h1>Create data stream</h1>}</EuiTitle>
          {isEdit ? null : (
            <CustomFormRow
              fullWidth
              label=""
              helpText={
                <div>
                  A data stream is internally composed of multiple backing indices. Search requests are routed to all the backing indices,
                  while indexing requests are routed to the latest write index.{" "}
                  <EuiLink target="_blank" external href={coreServices.docLinks.links.opensearch.dataStreams}>
                    Learn more.
                  </EuiLink>
                </div>
              }
            >
              <></>
            </CustomFormRow>
          )}
        </EuiFlexItem>
        {isEdit ? (
          <EuiFlexItem grow={false} style={{ flexDirection: "row" }}>
            <EuiButton
              style={{ marginRight: 20 }}
              onClick={() => {
                Modal.show({
                  "data-test-subj": "templateJSONDetailModal",
                  title: values.name,
                  content: <JSONEditor value={JSON.stringify(values, null, 2)} disabled />,
                });
              }}
            >
              View JSON
            </EuiButton>
            <EuiButton color="danger" onClick={() => setVisible(true)}>
              Delete
            </EuiButton>
            <DeleteDataStreamsModal
              visible={visible}
              selectedItems={[values.name]}
              onClose={() => {
                setVisible(false);
              }}
              onDelete={() => {
                setVisible(false);
                history.replace(ROUTES.DATA_STREAMS);
              }}
            />
          </EuiFlexItem>
        ) : null}
      </EuiFlexGroup>
      <EuiSpacer />
      <DefineDataStream {...subCompontentProps} allDataStreamTemplates={templates} />
      {values.matchedTemplate ? (
        <>
          <EuiSpacer />
          <ContentPanel title="Template details" titleSize="s">
            <EuiSpacer size="s" />
            <IndexAlias {...subCompontentProps} />
            <EuiSpacer />
            <IndexSettings {...subCompontentProps} />
            <EuiSpacer />
            <TemplateMappings {...subCompontentProps} />
          </ContentPanel>
        </>
      ) : null}
      {isEdit ? null : (
        <>
          <EuiSpacer />
          <EuiSpacer />
          <EuiFlexGroup alignItems="center" justifyContent="flexEnd">
            <EuiFlexItem grow={false}>
              <EuiButtonEmpty onClick={onCancel} data-test-subj="CreateDataStreamCancelButton">
                Cancel
              </EuiButtonEmpty>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiButton fill onClick={onSubmit} isLoading={isSubmitting} data-test-subj="CreateDataStreamCreateButton">
                {isEdit ? "Save changes" : "Create data stream"}
              </EuiButton>
            </EuiFlexItem>
          </EuiFlexGroup>
        </>
      )}
    </>
  );
};

// @ts-ignore
export default forwardRef(DataStreamDetail);
