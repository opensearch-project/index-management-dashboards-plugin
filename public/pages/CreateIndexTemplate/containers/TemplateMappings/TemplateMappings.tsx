import React, { useContext, useRef } from "react";
import { EuiFormRow, EuiLink, EuiSpacer, EuiTitle } from "@elastic/eui";
import { ContentPanel } from "../../../../components/ContentPanel";
import { SubDetailProps } from "../../interface";
import IndexMapping, { IIndexMappingsRef } from "../../../CreateIndex/components/IndexMapping";
import { CoreServicesContext } from "../../../../components/core_services";
import { CoreStart } from "opensearch-dashboards/public";

export default function TemplateMappings(props: SubDetailProps) {
  const { readonly, field, isEdit } = props;
  const mappingsRef = useRef<IIndexMappingsRef>(null);
  const coreServices = useContext(CoreServicesContext) as CoreStart;
  return (
    <ContentPanel
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
                  Learn more.
                </EuiLink>
              </div>
            }
          >
            <></>
          </EuiFormRow>
        </>
      }
      titleSize="s"
    >
      <EuiSpacer size="s" />
      <EuiFormRow fullWidth>
        <IndexMapping
          {...field.registerField({
            name: ["template", "mappings"],
            rules: [
              {
                validator() {
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
          readonly={readonly}
          isEdit={isEdit}
          ref={mappingsRef}
          oldMappingsEditable
          docVersion={coreServices.docLinks.DOC_LINK_VERSION}
        />
      </EuiFormRow>
    </ContentPanel>
  );
}
