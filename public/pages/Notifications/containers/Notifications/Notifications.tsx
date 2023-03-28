/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { forwardRef, useContext, useEffect, useRef, Ref, useState } from "react";
import { EuiSpacer, EuiTitle } from "@elastic/eui";
import useField, { FieldInstance } from "../../../../lib/field";
import { ServicesContext } from "../../../../services";
import { BrowserServices } from "../../../../models/interfaces";
import { CoreServicesContext } from "../../../../components/core_services";
import { CoreStart } from "opensearch-dashboards/public";
import { getComputedResultFromPlainList, getNotifications, transformConfigListToPlainList } from "../../hooks";
import { RouteComponentProps } from "react-router-dom";
import { FieldState } from "../../interface";
import { ContentPanel } from "../../../../components/ContentPanel";
import { AllBuiltInComponents } from "../../../../components/FormGenerator";

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
    setIsLoading(false);
  };
  useEffect(() => {
    getNotifications({
      commonService: services.commonService,
    }).then((res) => {
      if (res.ok) {
        const plainList = transformConfigListToPlainList(res.response.lron_configs.map((item) => item.lron_config));
        field.resetValues({
          ...getComputedResultFromPlainList(plainList),
          dataSource: plainList,
        } as FieldState);
      }
    });
    return () => {
      destroyRef.current = true;
    };
  }, []);
  const values: FieldState = field.getValues();

  return (
    <>
      <EuiTitle size="l">
        <h1>Manage notifications for index operations</h1>
      </EuiTitle>
      <ContentPanel title="Index operations" titleSize="s">
        <EuiSpacer />
        <EuiTitle>
          <h5>Shrink, split, reindex, force merge, clone</h5>
        </EuiTitle>
        <EuiSpacer />
        <AllBuiltInComponents.CheckBox
          {...field.registerField({
            name: "useDifferentSettings",
          })}
          label="Use different settings for each operation"
        />
      </ContentPanel>
    </>
  );
};

// @ts-ignore
export default forwardRef(DataStreamDetail);
