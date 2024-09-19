/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import React from "react";
import { EuiLink, EuiPanel, EuiSpacer, EuiText, EuiHorizontalRule, EuiTitle } from "@elastic/eui";
import { SubDetailProps } from "../../interface";
import DescriptionListHoz from "../../../../components/DescriptionListHoz";
import { ROUTES } from "../../../../utils/constants";
import { TemplateConvert } from "../TemplateType";
import { TemplateItem } from "../../../../../models/interfaces";

export default function OverviewTemplate(props: SubDetailProps) {
  const { field, withoutPanel, columns } = props;
  const values: TemplateItem = field.getValues();
  const content = (
    <>
      <EuiSpacer size="s" />
      <DescriptionListHoz
        compressed
        columns={columns}
        listItems={[
          {
            title: (
              <EuiText size="s">
                <h4>Template type</h4>
              </EuiText>
            ),
            description: TemplateConvert({
              value: values.data_stream,
            }),
          },
          {
            title: (
              <EuiText size="s">
                <h4>Index patterns</h4>
              </EuiText>
            ),
            description: values.index_patterns?.join(", "),
          },
          {
            title: (
              <EuiText size="s">
                <h4>Priority</h4>
              </EuiText>
            ),
            description: values.priority,
          },
          {
            title: (
              <EuiText size="s">
                <h4>Associated component templates</h4>
              </EuiText>
            ),
            description: (values.composed_of || []).length
              ? (values.composed_of || []).map((item) => (
                  <div key={item}>
                    <EuiLink external={false} target="_blank" href={`#${ROUTES.CREATE_COMPOSABLE_TEMPLATE}/${item}`}>
                      {item}
                    </EuiLink>
                  </div>
                ))
              : "-",
          },
        ]}
      />
    </>
  );

  return withoutPanel ? (
    content
  ) : (
    <EuiPanel>
      <EuiTitle size="s">
        <h2>Overview</h2>
      </EuiTitle>
      <EuiHorizontalRule margin="xs" />
      {content}
    </EuiPanel>
  );
}
