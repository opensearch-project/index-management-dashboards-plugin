/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useContext, useRef } from "react";
import { EuiFormRow, EuiLink, EuiSpacer, EuiTitle } from "@elastic/eui";
import { CoreStart } from "opensearch-dashboards/public";
import { ContentPanel } from "../../../../components/ContentPanel";
import { SubDetailProps } from "../../interface";
import IndexMapping, { IIndexMappingsRef } from "../../../../components/IndexMapping";
import { CoreServicesContext } from "../../../../components/core_services";
import { AllBuiltInComponents } from "../../../../components/FormGenerator";
import { IndicesUpdateMode } from "../../../../utils/constants";

export default function TemplateMappings(props: SubDetailProps) {
  const { field, noPanel } = props;
  const values = field.getValues();
  const mappingsRef = useRef<IIndexMappingsRef>(null);
  const coreServices = useContext(CoreServicesContext) as CoreStart;
  return (
    <ContentPanel
      noExtraPadding
      color={noPanel ? "ghost" : undefined}
      title={
        <>
          <EuiTitle size="s">
            <div>Index mapping</div>
          </EuiTitle>
          <EuiFormRow
            fullWidth
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
        </>
      }
      actions={
        <AllBuiltInComponents.Switch
          {...field.registerField({
            name: ["includes", IndicesUpdateMode.mappings],
          })}
          label="Use configuration"
          showLabel
        />
      }
      titleSize="s"
    >
      {values.includes?.[IndicesUpdateMode.mappings] ? (
        <>
          <EuiSpacer />
          <EuiFormRow fullWidth>
            <IndexMapping
              {...field.registerField({
                name: ["template", "mappings"],
                rules: [
                  {
                    validator() {
                      if (!mappingsRef.current) {
                        return Promise.resolve("");
                      }
                      return (mappingsRef.current as IIndexMappingsRef).validate()?.then((result) => {
                        if (result) {
                          return Promise.reject(result);
                        }

                        return Promise.resolve("");
                      });
                    },
                  },
                ],
              })}
              isEdit
              ref={mappingsRef}
              oldMappingsEditable
              docVersion={coreServices.docLinks.DOC_LINK_VERSION}
            />
          </EuiFormRow>
          <EuiSpacer />
        </>
      ) : null}
    </ContentPanel>
  );
}
