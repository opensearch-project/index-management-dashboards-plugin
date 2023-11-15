/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import React from "react";
import { EuiLink, EuiSpacer } from "@elastic/eui";
import { SubDetailProps } from "../../interface";
import { ContentPanel } from "../../../../components/ContentPanel";
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
        columns={columns}
        listItems={[
          {
            title: "Template type",
            description: TemplateConvert({
              value: values.data_stream,
            }),
          },
          {
            title: "Index patterns",
            description: values.index_patterns?.join(", "),
          },
          {
            title: "Priority",
            description: values.priority,
          },
          {
            title: "Associated component templates",
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
    <ContentPanel title="Overview" titleSize="s">
      {content}
    </ContentPanel>
  );
}
