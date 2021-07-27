/*
 * SPDX-License-Identifier: Apache-2.0
 *
 * The OpenSearch Contributors require contributions made to
 * this file be licensed under the Apache-2.0 license or a
 * compatible open source license.
 *
 * Modifications Copyright OpenSearch Contributors. See
 * GitHub history for details.
 */

import React from "react";
import { EuiButton, EuiSpacer, EuiFlexGroup, EuiFlexItem, EuiText, EuiLink, EuiIcon } from "@elastic/eui";
import { ContentPanel } from "../../../../components/ContentPanel";
import "brace/theme/github";
import "brace/mode/json";
import { ISMTemplate as ISMTemplateData, Policy } from "../../../../../models/interfaces";
import { DOCUMENTATION_URL } from "../../../../utils/constants";
import { ISM_TEMPLATE_INPUT_MAX_WIDTH } from "../../utils/constants";
import ISMTemplate from "../ISMTemplate";

interface ISMTemplatesProps {
  policy: Policy;
  onChangePolicy: (policy: Policy) => void;
}

const convertTemplatesToArray = (ismTemplates: ISMTemplateData[] | ISMTemplateData | null | undefined): ISMTemplateData[] => {
  const templates = [];
  // policy.ism_template can be an array of templates or a single template as an object or null
  if (Array.isArray(ismTemplates)) {
    templates.push(...ismTemplates);
  } else if (ismTemplates) {
    templates.push(ismTemplates);
  }
  return templates;
};

const ISMTemplates = ({ policy, onChangePolicy }: ISMTemplatesProps) => {
  const templates = convertTemplatesToArray(policy.ism_template);
  return (
    <ContentPanel bodyStyles={{ padding: "initial" }} title="ISM template - optional" titleSize="s">
      <div style={{ paddingLeft: "10px" }}>
        <EuiText size="xs">
          <p>
            Specify an ISM template pattern that matches the index to apply the policy.{" "}
            <EuiLink href={DOCUMENTATION_URL} target="_blank">
              Learn more <EuiIcon type="popout" size="s" />
            </EuiLink>
          </p>
        </EuiText>

        <EuiSpacer size="s" />

        <EuiFlexGroup gutterSize="l" alignItems="center">
          <EuiFlexItem style={{ maxWidth: ISM_TEMPLATE_INPUT_MAX_WIDTH }}>
            <EuiText>
              <h3>Index patterns</h3>
            </EuiText>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiText>
              <h3>Priority</h3>
            </EuiText>
          </EuiFlexItem>
        </EuiFlexGroup>

        {templates.map((template, idx) => (
          <ISMTemplate
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
          />
        ))}
        <EuiSpacer />
        <EuiButton
          onClick={() => {
            onChangePolicy({ ...policy, ism_template: [...templates, { index_patterns: [], priority: 1 }] });
          }}
        >
          Add template
        </EuiButton>
      </div>
    </ContentPanel>
  );
};

export default ISMTemplates;
