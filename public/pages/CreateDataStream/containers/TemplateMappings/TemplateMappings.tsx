/*
 *   Copyright OpenSearch Contributors
 *
 *   Licensed under the Apache License, Version 2.0 (the "License").
 *   You may not use this file except in compliance with the License.
 *   A copy of the License is located at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   or in the "license" file accompanying this file. This file is distributed
 *   on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 *   express or implied. See the License for the specific language governing
 *   permissions and limitations under the License.
 */
import React, { useContext, useRef } from "react";
import { EuiFormRow, EuiLink, EuiSpacer, EuiTitle } from "@elastic/eui";
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
        <EuiFormRow
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
        </EuiFormRow>
      </EuiTitle>
      <EuiSpacer size="s" />
      <EuiFormRow fullWidth>
        <IndexMapping
          {...field.registerField({
            name: ["template", "mappings"],
          })}
          readonly
          isEdit={isEdit}
          ref={mappingsRef}
          docVersion={coreServices.docLinks.DOC_LINK_VERSION}
        />
      </EuiFormRow>
    </>
  );
}
