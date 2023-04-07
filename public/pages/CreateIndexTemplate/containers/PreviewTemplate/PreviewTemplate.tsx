/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { forwardRef, Ref } from "react";
import { EuiFlexGroup, EuiFlexItem, EuiSpacer, EuiTitle } from "@elastic/eui";
import { RouteComponentProps } from "react-router-dom";
import useField, { FieldInstance } from "../../../../lib/field";
import DefineTemplate from "../../components/DefineTemplate";
import IndexSettings from "../../components/IndexSettings";
import IndexAlias from "../IndexAlias";
import TemplateMappings from "../TemplateMappings";
import ComposableTemplate from "../ComposableTemplate";
import { TemplateItem } from "../../../../../models/interfaces";

export interface TemplateDetailProps {
  value: TemplateItem;
  history: RouteComponentProps["history"];
}

const TemplateDetail = (props: TemplateDetailProps, ref: Ref<FieldInstance>) => {
  const { value, history } = props;
  const field = useField({
    values: JSON.parse(JSON.stringify(value)),
    onChange(name, value) {
      if (name === "data_stream" && value === undefined) {
        field.deleteValue(name);
      }
    },
  });
  const subCompontentProps = {
    ...props,
    field,
    isEdit: false,
    readonly: true,
    history,
    withoutPanel: true,
    columns: 3 as any,
  };

  return (
    <>
      <EuiFlexGroup alignItems="center">
        <EuiFlexItem>
          <EuiTitle size="s">{<div>Template settings</div>}</EuiTitle>
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiSpacer />
      <DefineTemplate {...subCompontentProps} />
      <EuiSpacer />
      <ComposableTemplate {...subCompontentProps} />
      <EuiSpacer />
      <IndexAlias {...subCompontentProps} />
      <EuiSpacer />
      <IndexSettings {...subCompontentProps} />
      <EuiSpacer />
      <TemplateMappings {...subCompontentProps} />
    </>
  );
};

// @ts-ignore
export default forwardRef(TemplateDetail);
