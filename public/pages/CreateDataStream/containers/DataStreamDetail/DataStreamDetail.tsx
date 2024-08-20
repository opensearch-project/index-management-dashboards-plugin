/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { forwardRef, useContext, useEffect, useImperativeHandle, useRef, Ref, useState } from "react";
import { EuiButton, EuiButtonEmpty, EuiCallOut, EuiFlexGroup, EuiFlexItem, EuiLink, EuiSpacer, EuiTitle, EuiText } from "@elastic/eui";
import { TemplateItemRemote } from "../../../../../models/interfaces";
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
import DefineDataStream from "../DefineDataStream";
import IndexSettings from "../../components/IndexSettings";
import IndexAlias from "../IndexAlias";
import TemplateMappings from "../TemplateMappings";
import { ContentPanel } from "../../../../components/ContentPanel";
import { DataStreamInEdit } from "../../interface";
import BackingIndices from "../BackingIndices";
import DataStreamsActions from "../../../DataStreams/containers/DataStreamsActions";
import { ExternalLink } from "../../../utils/display-utils";
import { getApplication, getNavigationUI } from "../../../../services/Services";
import { TopNavControlButtonData } from "../../../../../../../src/plugins/navigation/public";

export interface DataStreamDetailProps {
  dataStream?: string;
  onCancel?: () => void;
  onSubmitSuccess?: (templateName: string) => void;
  readonly?: boolean;
  history: RouteComponentProps["history"];
  useNewUX: boolean;
}

const DataStreamDetail = (props: DataStreamDetailProps, ref: Ref<FieldInstance>) => {
  const { dataStream, onCancel, onSubmitSuccess } = props;
  const isEdit = !!dataStream;
  const services = useContext(ServicesContext) as BrowserServices;
  const coreServices = useContext(CoreServicesContext) as CoreStart;
  const [templates, setTemplates] = useState<
    {
      name: string;
      index_template: TemplateItemRemote;
    }[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const field = useField({
    values: {} as Partial<DataStreamInEdit>,
  });
  const destroyRef = useRef<boolean>(false);
  const onSubmit = async () => {
    const { errors, values: dataStream } = (await field.validatePromise()) || {};
    if (errors) {
      return;
    }
    setIsLoading(true);
    const result = await createDataStream({
      value: dataStream.name || "",
      commonService: services.commonService,
      isEdit,
    });
    if (result && result.ok) {
      coreServices.notifications.toasts.addSuccess(`${dataStream.name} has been successfully ${isEdit ? "updated" : "created"}.`);
      onSubmitSuccess && onSubmitSuccess(dataStream.name || "");
    } else {
      coreServices.notifications.toasts.addDanger(result.error);
    }
    if (destroyRef.current) {
      return;
    }
    setIsLoading(false);
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
      setIsLoading(true);
      getAllDataStreamTemplate({
        commonService: services.commonService,
      })
        .then((result) => setTemplates(result))
        .finally(() => {
          setIsLoading(false);
        });
    }
    return () => {
      destroyRef.current = true;
    };
  }, []);
  const values = field.getValues();
  const subCompontentProps = {
    ...props,
    isEdit,
    field,
  };

  const descriptionData = [
    {
      renderComponent: (
        <EuiText size="s" color="subdued">
          A data stream is composed of multiple backing indexes. Search requests are routed to all the backing indexes, while indexing
          requests <br></br>
          are routed to the latest write index. <ExternalLink href={coreServices.docLinks.links.opensearch.dataStreams} />
        </EuiText>
      ),
    },
  ];

  const controlsData = [
    {
      renderComponent: (
        <DataStreamsActions
          selectedItems={values ? ([values] as DataStreamInEdit[]) : []}
          history={props.history}
          onDelete={() => props.history.replace(ROUTES.DATA_STREAMS)}
          useNewUX={props.useNewUX}
        />
      ),
    },
    {
      id: "viewJson",
      label: "View JSON",
      testId: "dataStreamJSONDetailModal",
      run: () => {
        Modal.show({
          "data-test-subj": "dataStreamJSONDetailModal",
          title: values.name,
          content: <JSONEditor value={JSON.stringify(values, null, 2)} disabled />,
        });
      },
      controlType: "button",
      display: "base",
      fill: true,
    } as TopNavControlButtonData,
  ];

  const { HeaderControl } = getNavigationUI();
  const { setAppRightControls, setAppDescriptionControls } = getApplication();

  return (
    <>
      {!isEdit && props.useNewUX && <HeaderControl setMountPoint={setAppDescriptionControls} controls={descriptionData} />}
      {isEdit && props.useNewUX && <HeaderControl setMountPoint={setAppRightControls} controls={controlsData} />}
      {!props.useNewUX && (
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
                      A data stream is composed of multiple backing indexes. Search requests are routed to all the backing indexes, while
                      indexing requests are routed to the latest write index.{" "}
                      <EuiLink target="_blank" external href={coreServices.docLinks.links.opensearch.dataStreams}>
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
              <EuiFlexItem grow={false} style={{ flexDirection: "row" }}>
                <EuiButton
                  style={{ marginRight: 20 }}
                  onClick={() => {
                    Modal.show({
                      "data-test-subj": "dataStreamJSONDetailModal",
                      title: values.name,
                      content: <JSONEditor value={JSON.stringify(values, null, 2)} disabled />,
                    });
                  }}
                >
                  View JSON
                </EuiButton>
                <DataStreamsActions
                  selectedItems={values ? ([values] as DataStreamInEdit[]) : []}
                  history={props.history}
                  onDelete={() => props.history.replace(ROUTES.DATA_STREAMS)}
                />
              </EuiFlexItem>
            ) : null}
          </EuiFlexGroup>
          <EuiSpacer />
        </>
      )}
      {!isLoading && !templates.length && !isEdit ? (
        <>
          <EuiCallOut title="No data stream templates created" color="warning">
            To create a data stream, you must first define its mappings and settings by creating a data stream template.
            <EuiSpacer size="s" />
            <div>
              <EuiButton onClick={() => props.history.push(`${ROUTES.CREATE_TEMPLATE}?values=${JSON.stringify({ data_stream: {} })}`)}>
                Create template
              </EuiButton>
            </div>
          </EuiCallOut>
          <EuiSpacer />
        </>
      ) : null}
      <DefineDataStream {...subCompontentProps} allDataStreamTemplates={templates} />
      {values.matchedTemplate ? (
        <>
          <EuiSpacer />
          <ContentPanel title="Inherited settings from template" titleSize="s">
            <EuiSpacer size="s" />
            <IndexAlias {...subCompontentProps} />
            <EuiSpacer />
            <IndexSettings {...subCompontentProps} />
            <EuiSpacer />
            <TemplateMappings {...subCompontentProps} />
          </ContentPanel>
        </>
      ) : null}
      {isEdit ? (
        <>
          <EuiSpacer />
          <BackingIndices {...subCompontentProps} />
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
              <EuiButton fill onClick={onSubmit} isLoading={isLoading} data-test-subj="CreateDataStreamCreateButton">
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
