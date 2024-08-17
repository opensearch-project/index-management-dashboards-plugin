/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { EuiButton, EuiSpacer, EuiFlexGroup, EuiEmptyPrompt, EuiFlexItem, EuiText, EuiLink, EuiIcon } from "@elastic/eui";
import { ContentPanel } from "../../../../components/ContentPanel";
import "brace/theme/github";
import "brace/mode/json";
import { ISMTemplate as ISMTemplateData, Policy } from "../../../../../models/interfaces";
import { DOCUMENTATION_URL } from "../../../../utils/constants";
import { ISM_TEMPLATE_INPUT_MAX_WIDTH } from "../../utils/constants";
import ISMTemplate from "../ISMTemplate";
import { convertTemplatesToArray } from "../../utils/helpers";
import { makeId } from "../../../../utils/helpers";

interface ISMTemplatesProps {
  policy: Policy;
  onChangePolicy: (policy: Policy) => void;
  useNewUx?: boolean;
}

const ISMTemplates = ({ policy, onChangePolicy, useNewUx }: ISMTemplatesProps) => {
  const templates = convertTemplatesToArray(policy.ism_template);
  const addTemplateButton = (
    <EuiButton
      size={useNewUx ? "s" : undefined}
      onClick={() => {
        onChangePolicy({ ...policy, ism_template: [...templates, { index_patterns: [], priority: 1 }] });
      }}
      data-test-subj="ism-templates-add-template-button"
    >
      Add template
    </EuiButton>
  );
  const paddingStyle = useNewUx ? { padding: "0px 0px" } : { padding: "5px 0px" };
  return (
    <ContentPanel
      bodyStyles={{ padding: "initial" }}
      title={
        <EuiFlexGroup gutterSize="xs" alignItems="center">
          <EuiFlexItem grow={false}>
            <EuiText>
              <h3>ISM templates</h3>
            </EuiText>
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiText color="subdued">
              <i> – optional</i>
            </EuiText>
          </EuiFlexItem>
        </EuiFlexGroup>
      }
      titleSize="s"
      subTitleText={
        <EuiText color="subdued" size="s" style={paddingStyle}>
          <p style={{ fontWeight: 200 }}>
            Specify ISM template patterns that match the index to apply the policy.{" "}
            <EuiLink href={DOCUMENTATION_URL} target="_blank" rel="noopener noreferrer">
              Learn more
            </EuiLink>
          </p>
        </EuiText>
      }
    >
      <div style={{ padding: "10px 0px 0px 10px" }}>
        {!!templates.length && (
          <EuiFlexGroup gutterSize="l" alignItems="center">
            <EuiFlexItem style={{ maxWidth: ISM_TEMPLATE_INPUT_MAX_WIDTH }}>
              <EuiText>
                <h5>Index patterns</h5>
              </EuiText>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiText>
                <h5>Priority</h5>
              </EuiText>
            </EuiFlexItem>
          </EuiFlexGroup>
        )}

        {templates.map((template, idx) => (
          <ISMTemplate
            key={makeId()}
            isFirst={!idx}
            template={template}
            onUpdateTemplate={(template: ISMTemplateData) => {
              onChangePolicy({
                ...policy,
                ism_template: templates
                  .slice(0, idx)
                  .concat(template)
                  .concat(templates.slice(idx + 1)),
              });
            }}
            onRemoveTemplate={() => {
              onChangePolicy({
                ...policy,
                ism_template: templates.slice(0, idx).concat(templates.slice(idx + 1)),
              });
            }}
            useNewUx={useNewUx}
          />
        ))}

        {!templates.length ? (
          <EuiEmptyPrompt
            title={<h2>No ISM templates</h2>}
            style={{ maxWidth: "37em" }}
            titleSize="s"
            body={
              <p>
                Your policy currently has no ISM templates defined. Add ISM templates to automatically apply the policy to indices created
                in the future.
              </p>
            }
            actions={addTemplateButton}
          />
        ) : (
          <>
            <EuiSpacer />
            {addTemplateButton}
          </>
        )}
      </div>
    </ContentPanel>
  );
};

export default ISMTemplates;
