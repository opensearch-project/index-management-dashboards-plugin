/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useContext, useRef } from "react";
import { EuiCompressedFormRow, EuiLink, EuiSpacer, EuiTitle } from "@elastic/eui";
import { CoreStart } from "opensearch-dashboards/public";
import { SubDetailProps } from "../../interface";
import IndexMapping, { IIndexMappingsRef } from "../../../../components/IndexMapping";
import { CoreServicesContext } from "../../../../components/core_services";

export default function TemplateMappings(props: SubDetailProps) {
  const { field, isEdit } = props;
  const mappingsRef = useRef<IIndexMappingsRef>(null);
  const coreServices = useContext(CoreServicesContext) as CoreStart;
  return (
    <>
      <EuiTitle size="s">
        <EuiCompressedFormRow
          fullWidth
          label={
            <EuiTitle size="s">
              <div>Index mapping</div>
            </EuiTitle>
          }
          helpText={
            <div>
              Define how documents and their fields are stored and indexed.{" "}
              <EuiLink
                target="_blank"
                external
                href={`https://opensearch.org/docs/${coreServices.docLinks.DOC_LINK_VERSION}/opensearch/mappings/`}
              >
                Learn more
              </EuiLink>
            </div>
          }
        >
          <></>
        </EuiCompressedFormRow>
      </EuiTitle>
      <EuiSpacer size="s" />
      <EuiCompressedFormRow fullWidth>
        <IndexMapping
          {...field.registerField({
            name: ["template", "mappings"],
          })}
          readonly
          isEdit={isEdit}
          ref={mappingsRef}
          docVersion={coreServices.docLinks.DOC_LINK_VERSION}
        />
      </EuiCompressedFormRow>
    </>
  );
}
