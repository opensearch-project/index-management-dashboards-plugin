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
